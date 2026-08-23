import type { GameCoordinator } from "../application/coordinator";
import type { IntentRejectionReason } from "../domain/model";
import { html, plural, remainingSeconds } from "./dom";
import { controllerView, type ControllerViewModel } from "./viewModels";

const rejectionCopy: Record<IntentRejectionReason, string> = {
  "already-submitted": "Your bluff is already filed.",
  "already-voted": "Your vote is already locked.",
  "bluff-too-short": "Write at least 2 characters.",
  "bluff-too-long": "Keep your bluff to 36 characters or fewer.",
  "duplicate-bluff": "That answer cannot be filed. Try a different bluff.",
  "matches-truth": "That answer cannot be filed. Try a different bluff.",
  "future-sequence": "The room changed before this response arrived. Try again.",
  "invalid-choice": "That answer is no longer available. Choose again.",
  "not-a-controller": "Only a player controller can file a response.",
  "not-in-round": "You are not part of this active file.",
  "phase-closed": "That phase has closed. Follow the current prompt.",
  "self-vote": "You cannot vote for your own bluff.",
  "stale-round": "That response belongs to an earlier file. Try again."
};

function header(view: ControllerViewModel): string {
  return `<header class="controller-header">
    <div class="player-seal" aria-hidden="true">${html(view.playerName.slice(0, 1).toUpperCase())}</div>
    <div><strong>${html(view.playerName)}</strong><span>${view.playerScore.toLocaleString()} points</span></div>
    <div class="terminal-leds" aria-hidden="true"><i></i><i></i><i></i></div>
    ${view.isAuthority ? '<span class="director-badge">Room director</span>' : ""}
  </header>`;
}

function phaseHeader(view: ControllerViewModel, label: string, title: string): string {
  const seconds = remainingSeconds(view.deadlineAt);
  return `<div class="controller-phase-header"><div><p class="paper-tab">${html(label)}</p><h1>${html(title)}</h1></div>${seconds === null ? "" : `<div class="phone-timer" aria-label="${seconds} seconds remaining">${String(seconds).padStart(2, "0")}</div>`}</div>`;
}

function errorText(view: ControllerViewModel): string {
  const reason = view.receipt?.status === "rejected" ? view.receipt.reason : undefined;
  const message = reason ? rejectionCopy[reason] : view.error;
  return message ? `<p class="form-error" role="alert">${html(message)}</p>` : '<p class="form-error" aria-live="polite"></p>';
}

function authorityActions(view: ControllerViewModel, primary?: { action: string; label: string }): string {
  if (!view.isAuthority) return '<p class="helper-copy">The room director controls what happens next.</p>';
  return `<div class="director-actions">
    ${primary ? `<button class="primary-action" type="button" data-action="${html(primary.action)}">${html(primary.label)}</button>` : ""}
    <button class="secondary-action" type="button" data-action="settings">Room settings</button>
  </div>`;
}

function loading(view: ControllerViewModel): string {
  return `<section class="controller-card controller-center">${header(view)}<div class="loading-beacon" aria-hidden="true">B</div><h1>Connecting to the Bureau…</h1><p>Waiting for confirmed room state.</p></section>`;
}

function reconnecting(view: ControllerViewModel): string {
  return `<section class="controller-card controller-center">${header(view)}<div class="reconnect-mark" aria-hidden="true">↻</div><h1>Reconnecting your file</h1><p>Your confirmed bluff, vote, and score are preserved. Keep this screen open.</p></section>`;
}

function lobby(view: ControllerViewModel): string {
  const count = view.roster.filter((player) => player.connected).length;
  return `<section class="controller-card">${header(view)}${phaseHeader(view, "Bureau intake", "You’re checked in")}
    <p class="lead-copy">Write convincing lies, spot strange truths, and decide how much confidence to risk.</p>
    <ul class="phone-roster">${view.roster.map((player) => `<li class="${player.connected ? "" : "is-disconnected"}"><span class="status-lamp" aria-hidden="true"></span>${html(player.name)}${player.id === view.playerId ? " · You" : ""}</li>`).join("")}</ul>
    ${view.isAuthority && count >= 3 ? authorityActions(view, { action: "advance", label: "Brief the room" }) : view.isAuthority ? `<p class="helper-copy">Waiting for ${3 - count} more ${plural(3 - count, "player")}.</p>${authorityActions(view)}` : authorityActions(view)}
  </section>`;
}

function instructions(view: ControllerViewModel): string {
  return `<section class="controller-card">${header(view)}${phaseHeader(view, "How to play", "Three moves. One truth.")}
    <ol class="phone-instructions">
      <li><span>1</span><div><strong>Write a plausible wrong answer.</strong><p>Your bluff earns points each time it fools someone.</p></div></li>
      <li><span>2</span><div><strong>Choose the real answer.</strong><p>Your own bluff is never selectable.</p></div></li>
      <li><span>3</span><div><strong>Pick your confidence.</strong><p><b>Certain</b> doubles correct points—and doubles what a bluff writer earns if you miss.</p></div></li>
    </ol>
    ${authorityActions(view, { action: "advance", label: "Open first file now" })}
  </section>`;
}

function writing(view: ControllerViewModel, draft: string): string {
  const submitted = view.receipt?.status === "accepted" && view.receipt.intentId.startsWith("submit-bluff");
  return `<section class="controller-card">${header(view)}${phaseHeader(view, `${view.category}${view.roundNumber === view.totalRounds ? " · 2× points" : ""}`, submitted ? "Bluff filed" : "File a believable lie")}
    <div class="phone-prompt">${html(view.prompt)}</div>
    ${submitted
      ? `<div class="submitted-state" role="status"><span aria-hidden="true">✓</span><strong>Confirmed</strong><p>Your answer is sealed until voting opens.</p></div>`
      : `<form data-form="bluff" novalidate>
          <label for="bluff-answer">Your false answer</label>
          <textarea id="bluff-answer" name="bluff" maxlength="36" rows="3" aria-describedby="bluff-hint bluff-error" placeholder="Make it plausible…">${html(draft)}</textarea>
          <div class="field-meta"><span id="bluff-hint">2–36 characters</span><output data-count aria-label="Character count">${Array.from(draft).length}/36</output></div>
          <div id="bluff-error">${errorText(view)}</div>
          <button class="primary-action" type="submit" data-action="submit-bluff" ${view.writePending ? "disabled" : ""}>${view.writePending ? "Filing…" : "File bluff"}</button>
        </form>`}
    ${view.isAuthority ? '<button class="text-action" type="button" data-action="settings">Room settings</button>' : ""}
  </section>`;
}

function voting(view: ControllerViewModel, selectedChoice: string, confidence: "sure" | "certain"): string {
  const voted = view.receipt?.status === "accepted" && view.receipt.intentId.startsWith("submit-vote");
  if (voted) {
    return `<section class="controller-card">${header(view)}${phaseHeader(view, "Vote locked", "Your decision is filed")}
      <div class="submitted-state" role="status"><span aria-hidden="true">✓</span><strong>Confirmed</strong><p>The truth is revealed after every eligible vote arrives.</p></div>
    </section>`;
  }
  const choices = view.choices
    .map((choice, boardIndex) => ({ choice, boardIndex }))
    .filter(({ choice }) => choice.id !== view.ownChoiceId);
  return `<section class="controller-card controller-card--wide controller-card--vote">${header(view)}${phaseHeader(view, "Answer lock", "Which answer is real?")}
    <form class="vote-console" data-form="vote">
      <fieldset class="answer-fieldset"><legend class="visually-hidden">Choose one answer</legend><div class="answer-pad-header" aria-hidden="true"><strong>Answer pad</strong><small>Match a key on the shared display</small></div>
        <div class="answer-options">${choices.map(({ choice, boardIndex }) => `<label class="answer-option answer-color-${boardIndex % 4}"><input type="radio" name="choice" value="${html(choice.id)}" ${selectedChoice === choice.id ? "checked" : ""}/><span class="answer-letter">${String.fromCharCode(65 + boardIndex)}</span><strong>${html(choice.text)}</strong><span class="answer-pip" aria-hidden="true"></span></label>`).join("")}</div>
      </fieldset>
      <div class="vote-dock">
        <fieldset class="confidence-fieldset"><legend>Power</legend>
          <label><input type="radio" name="confidence" value="sure" ${confidence === "sure" ? "checked" : ""}/><span><strong>Sure</strong><small>Normal points</small></span></label>
          <label><input type="radio" name="confidence" value="certain" ${confidence === "certain" ? "checked" : ""}/><span><strong>Certain</strong><small>2× reward · 2× risk</small></span></label>
        </fieldset>
        <div id="vote-error">${errorText(view)}</div>
        <button class="primary-action lock-button" type="submit" data-action="submit-vote" aria-label="Lock vote" ${view.writePending ? "disabled" : ""}><strong aria-hidden="true">${view.writePending ? "…" : "LOCK"}</strong><small aria-hidden="true">VOTE</small></button>
      </div>
    </form>
  </section>`;
}

function results(view: ControllerViewModel): string {
  const points = view.results?.roundPoints[view.playerId] ?? 0;
  const truth = view.results?.caseFile.truth ?? "";
  const foundTruth = view.results?.choices.find((choice) => choice.kind === "truth")?.voterIds.includes(view.playerId);
  return `<section class="controller-card">${header(view)}${phaseHeader(view, "Results filed", foundTruth ? "You found the truth" : "The truth got away")}
    <div class="personal-result ${foundTruth ? "is-correct" : ""}"><span>${points >= 0 ? "+" : ""}${points.toLocaleString()}</span><p>points this file</p></div>
    <div class="truth-slip"><span>The truth</span><strong>${html(truth)}</strong><p>${html(view.results?.caseFile.explanation ?? "")}</p></div>
    ${authorityActions(view, { action: "advance", label: view.roundNumber === view.totalRounds ? "Show final standings" : "Close this file" })}
  </section>`;
}

function roundBreak(view: ControllerViewModel): string {
  return `<section class="controller-card">${header(view)}${phaseHeader(view, `File ${String(view.roundNumber).padStart(2, "0")} closed`, "Next record incoming")}
    <ol class="phone-scoreboard">${view.scoreboard.map((row, index) => `<li><span>${index + 1}</span><strong>${html(row.name)}</strong><b>${row.score.toLocaleString()}</b></li>`).join("")}</ol>
    ${authorityActions(view, { action: "advance", label: "Open next file now" })}
  </section>`;
}

function gameOver(view: ControllerViewModel): string {
  const rank = view.scoreboard.findIndex((row) => row.id === view.playerId) + 1;
  return `<section class="controller-card">${header(view)}${phaseHeader(view, "Case closed", rank === 1 ? "Chief of believable nonsense" : `You finished #${rank}`)}
    <ol class="phone-scoreboard phone-scoreboard--final">${view.scoreboard.map((row, index) => `<li class="${row.id === view.playerId ? "is-you" : ""}"><span>${index + 1}</span><strong>${html(row.name)}</strong><b>${row.score.toLocaleString()}</b></li>`).join("")}</ol>
    ${view.isAuthority ? `<div class="director-actions"><button class="primary-action" type="button" data-action="lobby">Return to lobby</button><button class="secondary-action" type="button" data-action="settings">Room settings</button></div>` : authorityActions(view)}
  </section>`;
}

export class ControllerSurfaceRenderer {
  private unsubscribe?: () => void;
  private interval?: number;
  private coordinator?: GameCoordinator;
  private bluffDraft = "";
  private selectedChoice = "";
  private confidence: "sure" | "certain" = "sure";
  private lastViewKey = "";

  constructor(private readonly root: HTMLElement) {
    this.root.addEventListener("input", (event) => this.handleInput(event));
    this.root.addEventListener("change", (event) => this.handleChange(event));
    this.root.addEventListener("submit", (event) => void this.handleSubmit(event));
    this.root.addEventListener("click", (event) => void this.handleClick(event));
  }

  connect(coordinator: GameCoordinator): void {
    this.coordinator = coordinator;
    this.lastViewKey = "";
    this.unsubscribe?.();
    this.unsubscribe = coordinator.subscribe(() => this.render());
    this.interval = window.setInterval(() => this.updateTimer(), 1_000);
  }
  dispose(): void {
    this.unsubscribe?.();
    if (this.interval) window.clearInterval(this.interval);
  }

  private render(force = false) {
    if (!this.coordinator) return;
    const view = controllerView(this.coordinator.snapshot());
    const viewKey = JSON.stringify(view);
    if (!force && viewKey === this.lastViewKey) return;
    if (view.phase !== "writing") this.bluffDraft = "";
    if (view.phase !== "voting") this.selectedChoice = "";
    const content = view.phase === "loading" ? loading(view)
      : !view.isConnected ? reconnecting(view)
      : view.phase === "lobby" ? lobby(view)
      : view.phase === "instructions" ? instructions(view)
      : view.phase === "writing" ? writing(view, this.bluffDraft)
      : view.phase === "voting" ? voting(view, this.selectedChoice, this.confidence)
      : view.phase === "results" ? results(view)
      : view.phase === "round-break" ? roundBreak(view)
      : gameOver(view);
    this.root.innerHTML = `<main class="controller-shell"><div class="terminal-antenna" aria-hidden="true"><i></i></div><div class="terminal-grip terminal-grip--left" aria-hidden="true"></div><div class="terminal-grip terminal-grip--right" aria-hidden="true"></div>${content}<div class="terminal-brand" aria-hidden="true"><span>B</span> Bureau game controller</div></main>`;
    this.lastViewKey = viewKey;
  }

  private updateTimer() {
    if (!this.coordinator) return;
    const seconds = remainingSeconds(this.coordinator.snapshot().state?.deadlineAt ?? null);
    const timer = this.root.querySelector<HTMLElement>(".phone-timer");
    if (seconds === null || !timer) return;
    timer.textContent = String(seconds).padStart(2, "0");
    timer.setAttribute("aria-label", `${seconds} seconds remaining`);
  }

  private handleInput(event: Event) {
    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement)) return;
    this.bluffDraft = target.value;
    const output = this.root.querySelector<HTMLOutputElement>("[data-count]");
    if (output) output.value = `${Array.from(target.value).length}/36`;
  }

  private handleChange(event: Event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.name === "choice") {
      this.selectedChoice = target.value;
      const error = this.root.querySelector("#vote-error .form-error");
      if (error) error.textContent = "";
    }
    if (target.name === "confidence" && (target.value === "sure" || target.value === "certain")) this.confidence = target.value;
  }

  private async handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!this.coordinator || !(event.target instanceof HTMLFormElement)) return;
    await this.submitForm(event.target);
  }

  private async submitForm(form: HTMLFormElement) {
    if (!this.coordinator) return;
    if (form.dataset.form === "bluff") {
      const field = form.elements.namedItem("bluff");
      if (!(field instanceof HTMLTextAreaElement)) return;
      const value = field.value.trim();
      if (Array.from(value).length < 2) {
        field.setAttribute("aria-invalid", "true");
        field.focus();
        const error = this.root.querySelector("#bluff-error .form-error");
        if (error) error.textContent = "Write at least 2 characters.";
        return;
      }
      await this.coordinator.submitBluff(value);
      return;
    }
    if (!this.selectedChoice) {
      const firstChoice = form.elements.namedItem("choice");
      const firstInput = firstChoice instanceof RadioNodeList ? firstChoice[0] : firstChoice;
      if (firstInput instanceof HTMLInputElement) firstInput.focus();
      const error = this.root.querySelector("#vote-error .form-error");
      if (error) error.textContent = "Choose an answer before locking your vote.";
      return;
    }
    await this.coordinator.submitVote(this.selectedChoice, this.confidence);
  }

  private async handleClick(event: MouseEvent) {
    const target = (event.target as Element | null)?.closest<HTMLElement>("[data-action]");
    if (!target || !this.coordinator) return;
    if (target.dataset.action === "submit-bluff" || target.dataset.action === "submit-vote") {
      event.preventDefault();
      const form = target.closest("form");
      if (form instanceof HTMLFormElement) await this.submitForm(form);
      return;
    }
    if (target.dataset.action === "advance") await this.coordinator.advance();
    if (target.dataset.action === "settings") await this.coordinator.openSettings();
    if (target.dataset.action === "lobby") await this.coordinator.returnToLobby();
  }
}
