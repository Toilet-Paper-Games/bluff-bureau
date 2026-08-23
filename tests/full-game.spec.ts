import { expect, test, type FrameLocator } from "@playwright/test";

async function submitBluff(controller: FrameLocator, text: string) {
  await expect(controller.getByRole("heading", { name: "File a believable lie" })).toBeVisible();
  await controller.getByRole("textbox", { name: "Your false answer" }).fill(text);
  await controller.getByRole("button", { name: "File bluff" }).click();
  await expect(
    controller.getByText("Confirmed").or(controller.getByRole("heading", { name: "Which answer is real?" }))
  ).toBeVisible();
}

async function submitVote(controller: FrameLocator, confidence: "sure" | "certain") {
  await expect(controller.getByRole("heading", { name: "Which answer is real?" })).toBeVisible();
  await controller.locator('input[name="choice"]').first().check();
  if (confidence === "certain") await controller.locator('input[value="certain"]').check();
  await controller.getByRole("button", { name: "Lock vote" }).click();
  await expect(
    controller.getByText("Your decision is filed").or(controller.getByText("Results filed"))
  ).toBeVisible();
}

test("three controllers complete all four files while the host remains passive", async ({ page }) => {
  await page.goto("/__tpg/workbench");
  await expect(page.getByText("4/4 connected")).toBeVisible();

  const participantPanel = page.getByRole("complementary", { name: "Scenario controls" });
  const playerOneParticipant = participantPanel.getByRole("article").filter({ hasText: "Player 1" });
  await playerOneParticipant.getByRole("button", { name: "Make authority" }).click();
  await page.getByRole("combobox", { name: "Lifecycle state" }).selectOption("started");

  const host = page.frameLocator("iframe").nth(0);
  const controllers = [1, 2, 3].map((index) => page.frameLocator("iframe").nth(index));
  await expect(controllers[0].locator(".director-badge")).toHaveText("Room director");
  await expect(controllers[1].locator(".director-badge")).toHaveCount(0);
  await expect(host.locator("button, input, textarea, select, a[href], [tabindex]")).toHaveCount(0);

  await controllers[0].getByRole("button", { name: "Brief the room" }).click();
  await expect(host.getByRole("heading", { name: "File. Find. Risk it." })).toBeVisible();
  await controllers[0].getByRole("button", { name: "Open first file now" }).click();

  for (let round = 1; round <= 4; round += 1) {
    for (const [index, controller] of controllers.entries()) {
      if (round === 1 && index === 0) {
        const draft = controller.getByRole("textbox", { name: "Your false answer" });
        await draft.fill("credible draft");
        await expect(draft).toBeFocused();
        const draftNode = await draft.elementHandle();
        expect(draftNode).not.toBeNull();
        const playerTwoParticipant = participantPanel.getByRole("article").filter({ hasText: "Player 2" });
        await playerTwoParticipant.getByRole("button", { name: "Mark waiting" }).click();
        await expect(draft).toHaveValue("credible draft");
        expect(await draftNode!.evaluate((element) => element.isConnected)).toBe(true);
        await playerTwoParticipant.getByRole("button", { name: "Mark ready" }).click();
        await expect(draft).toHaveValue("credible draft");
        expect(await draftNode!.evaluate((element) => element.isConnected)).toBe(true);
      }
      await submitBluff(controller, `credible answer ${round}-${index + 1}`);
    }
    if (round === 1) {
      const boardLabels = await host.locator(".choice-board li").evaluateAll((rows) =>
        Object.fromEntries(rows.map((row) => [(row.querySelector(".choice-flaps")?.getAttribute("aria-label") ?? "").toLocaleLowerCase(), row.querySelector(".choice-key")?.textContent ?? ""]))
      );
      for (const controller of controllers) {
        const controllerLabels = await controller.locator(".answer-option").evaluateAll((rows) =>
          rows.map((row) => ({ answer: row.querySelector("strong")?.textContent ?? "", label: row.querySelector(".answer-letter")?.textContent ?? "" }))
        );
        for (const choice of controllerLabels) expect(choice.label).toBe(boardLabels[choice.answer.toLocaleLowerCase()]);
      }
    }
    for (const [index, controller] of controllers.entries()) {
      await submitVote(controller, index === 1 ? "certain" : "sure");
    }

    await expect(host.locator(".phase-results")).toBeVisible();
    await expect(host.getByText("The truth", { exact: true }).first()).toBeVisible();
    await expect(host.locator("button, input, textarea, select, a[href], [tabindex]")).toHaveCount(0);

    if (round < 4) {
      await controllers[0].getByRole("button", { name: "Close this file" }).click();
      await expect(controllers[0].getByRole("heading", { name: "Next record incoming" })).toBeVisible();
      await controllers[0].getByRole("button", { name: "Open next file now" }).click();
    } else {
      await controllers[0].getByRole("button", { name: "Show final standings" }).click();
    }
  }

  await expect(host.locator(".phase-game-over")).toBeVisible();
  await expect(host.getByText("Case closed")).toBeVisible();
  await expect(controllers[0].getByRole("button", { name: "Return to lobby" })).toBeVisible();
  await expect(controllers[1].getByRole("button", { name: "Return to lobby" })).toHaveCount(0);
});

test("a controller reconnects and room-director authority transfers safely", async ({ page }) => {
  await page.goto("/__tpg/workbench");
  await expect(page.getByText("4/4 connected")).toBeVisible();
  const panel = page.getByRole("complementary", { name: "Scenario controls" });
  const participant = (name: string) => panel.getByRole("article").filter({ hasText: name });
  const controllers = [1, 2, 3].map((index) => page.frameLocator("iframe").nth(index));
  const host = page.frameLocator("iframe").nth(0);

  await participant("Player 1").getByRole("button", { name: "Make authority" }).click();
  await expect(controllers[0].locator(".director-badge")).toBeVisible();

  await controllers[0].getByRole("button", { name: "Brief the room" }).click();
  await controllers[0].getByRole("button", { name: "Open first file now" }).click();
  await submitBluff(controllers[2], "a reconnecting answer");

  await panel.getByRole("spinbutton", { name: "Reconnect (ms)" }).fill("15000");
  await panel.getByRole("button", { name: "Apply network profile" }).click();
  await participant("Player 3").getByRole("button", { name: "Disconnect" }).click();
  await expect(participant("Player 3")).toContainText("Reconnecting");
  await participant("Player 3").getByRole("button", { name: "Reconnect" }).click();
  await expect(controllers[2].getByRole("heading", { name: "Bluff filed" })).toBeVisible();
  await expect(controllers[2].getByText("Confirmed")).toBeVisible();

  await participant("Player 2").getByRole("button", { name: "Make authority" }).click();
  await expect(controllers[1].locator(".director-badge")).toBeVisible();
  await expect(controllers[0].locator(".director-badge")).toHaveCount(0);
  await expect(controllers[1].getByRole("button", { name: "Room settings" })).toBeVisible();
  await expect(controllers[0].getByRole("button", { name: "Room settings" })).toHaveCount(0);
  await expect(host.locator(".phase-writing")).toBeVisible();
  await expect(host.locator("button, input, textarea, select, a[href], [tabindex]")).toHaveCount(0);
});

test("maximum voting choices fit the phone and host without clipping", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/gallery.html?surface=controller&scenario=max-voting&player=p1");

  await expect(page.getByRole("heading", { name: "Which answer is real?" })).toBeVisible();
  await expect(page.locator(".answer-option")).toHaveCount(8);
  await expect(page.getByRole("button", { name: "Lock vote" })).toBeVisible();

  await page.getByRole("button", { name: "Lock vote" }).click();
  await expect(page.getByText("Choose an answer before locking your vote.")).toBeVisible();
  await page.locator('.answer-option input[name="choice"]').last().check();
  await expect(page.getByText("Choose an answer before locking your vote.")).toBeHidden();

  const overflow = await page.evaluate(() => {
    const answerBank = document.querySelector<HTMLElement>(".answer-options");
    if (!answerBank) throw new Error("Missing answer bank.");
    return {
      page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      answerBank: answerBank.scrollWidth - answerBank.clientWidth,
      lockBottom: document.querySelector<HTMLElement>('[data-action="submit-vote"]')?.getBoundingClientRect().bottom
    };
  });

  expect(overflow.page).toBe(0);
  expect(overflow.answerBank).toBe(0);
  expect(overflow.lockBottom).toBeLessThanOrEqual(812);

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/gallery.html?surface=host&scenario=max-voting");
  await expect(page.locator(".choice-board li")).toHaveCount(9);
  await expect(page.locator(".score-row")).toHaveCount(8);

  const hostFit = await page.evaluate(() => {
    const screen = document.querySelector<HTMLElement>(".screen-glass")?.getBoundingClientRect();
    const lastChoice = document.querySelector<HTMLElement>(".choice-board li:last-child")?.getBoundingClientRect();
    const lastScore = document.querySelector<HTMLElement>(".score-row:last-child")?.getBoundingClientRect();
    if (!screen || !lastChoice || !lastScore) throw new Error("Missing maximum-voting host regions.");
    return {
      page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      lastChoiceBottom: lastChoice.bottom,
      lastScoreBottom: lastScore.bottom,
      screenBottom: screen.bottom
    };
  });

  expect(hostFit.page).toBe(0);
  expect(hostFit.lastChoiceBottom).toBeLessThanOrEqual(hostFit.screenBottom);
  expect(hostFit.lastScoreBottom).toBeLessThanOrEqual(hostFit.screenBottom);
});
