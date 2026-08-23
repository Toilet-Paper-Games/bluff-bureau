import type { GameCoordinator } from "../application/coordinator";
import type { ChoiceResult } from "../domain/model";
import { flapText, html, plural, remainingSeconds } from "./dom";
import { publicView, type PublicViewModel, type ScoreRow } from "./viewModels";

function scoreboard(rows: ScoreRow[], compact = false): string {
  return `<ol class="scoreboard ${compact ? "scoreboard--compact" : ""}" aria-label="Scoreboard">${rows
    .map(
      (row, index) => `<li class="score-row ${row.connected ? "" : "is-disconnected"}">
        <span class="score-rank">${index + 1}</span>
        <span class="score-name">${html(row.name)}</span>
        <strong class="score-value">${row.score.toLocaleString()}</strong>
      </li>`
    )
    .join("")}</ol>`;
}

function shell(view: PublicViewModel, content: string, status: string): string {
  const roundTrack = Array.from({ length: view.totalRounds }, (_, index) => {
    const round = index + 1;
    const state = round < view.roundNumber ? "is-done" : round === view.roundNumber ? "is-current" : "";
    return `<span class="${state}">${round}</span>`;
  }).join("");
  return `<div class="public-frame phase-${view.phase}">
    <header class="board-rail">
      <div class="brand-lockup" role="heading" aria-level="2"><span class="brand-mark" aria-hidden="true">B</span><span><small>Department of dubious facts</small><strong>Bluff Bureau</strong></span></div>
      <div class="film-drive" aria-hidden="true"><i></i><span></span><i></i></div>
      <div class="round-track" aria-hidden="true">${roundTrack}</div>
      <div class="rail-file" role="heading" aria-level="2">${view.roundNumber ? `${view.roundNumber === view.totalRounds ? "Final file" : "File"} ${String(view.roundNumber).padStart(2, "0")}` : "Intake"}</div>
      ${view.isSpectator ? '<div class="spectator-badge">Spectator feed</div>' : ""}
    </header>
    <section class="public-content"><div class="marquee-lights" aria-hidden="true">${"<i></i>".repeat(14)}</div><div class="screen-glass">${content}</div></section>
    <footer class="signal-strip"><div class="signal-lamps" aria-hidden="true"><i></i><i></i><i></i></div><span><span class="signal-dot" aria-hidden="true"></span>${html(status)}</span><div class="signal-knobs" aria-hidden="true"><i></i><i></i></div></footer>
    <div class="machine-screws" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  </div>`;
}

function timer(deadlineAt: number | null): string {
  const seconds = remainingSeconds(deadlineAt);
  return seconds === null ? "" : `<div class="timer" data-timer aria-label="${seconds} seconds remaining"><span aria-hidden="true">${flapText(String(seconds).padStart(2, "0"), "timer-flaps")}</span></div>`;
}

function loading(view: PublicViewModel): string {
  return shell(view, `<div class="center-stage"><div class="brand-beacon" aria-hidden="true">B</div><h1>Opening the records…</h1><p>Synchronizing this room’s case files.</p></div>`, "Keep this display open");
}

function lobby(view: PublicViewModel): string {
  const count = view.roster.filter((player) => player.connected).length;
  return shell(
    view,
    `<div class="lobby-grid">
      <div class="hero-board">
        <div class="microfilm-reels" aria-hidden="true"><i></i><span></span><i></i></div>
        <h1>${flapText("BLUFF BUREAU", "title-flaps")}</h1>
        <p class="hero-copy">Invent a believable lie. Find the ridiculous truth. Decide how certain you really are.</p>
        <div class="confidence-dial" aria-hidden="true"><span>Sure</span><i></i><span>Certain</span></div>
      </div>
      <aside class="roster-panel" aria-label="Players online">
        <p class="section-label">Players online</p>
        <strong class="roster-count">${count}<span>/8</span></strong>
        <ul class="roster-list">${view.roster.map((player) => `<li class="${player.connected ? "" : "is-disconnected"}"><span class="status-lamp" aria-hidden="true"></span>${html(player.name)}</li>`).join("")}</ul>
      </aside>
    </div>`,
    count < 3 ? `Waiting for ${3 - count} more ${plural(3 - count, "player")}` : "The room director starts from their phone"
  );
}

function instructions(view: PublicViewModel): string {
  return shell(
    view,
    `<div class="instruction-layout">
      <div class="instruction-title"><p class="paper-tab">How to play</p><h1>File. Find. Risk it.</h1></div>
      <ol class="instruction-steps">
        <li><span>1</span><div><strong>File a bluff</strong><p>Write an answer plausible enough to pass inspection.</p></div></li>
        <li><span>2</span><div><strong>Find the truth</strong><p>Choose the real answer—but never your own bluff.</p></div></li>
        <li><span>3</span><div><strong>Set confidence</strong><p>“Certain” doubles your reward and the cost of being fooled.</p></div></li>
      </ol>
      ${timer(view.deadlineAt)}
    </div>`,
    "The first file opens automatically"
  );
}

function writing(view: PublicViewModel): string {
  return shell(
    view,
    `<div class="case-layout">
      <section class="prompt-stage">
        <p class="paper-tab">${html(view.category)}${view.roundNumber === view.totalRounds ? " · 2× points" : ""}</p>
        <div class="scanner-line" aria-hidden="true"></div>
        <h1>${flapText(view.prompt.toUpperCase(), "prompt-flaps")}</h1>
        <div class="waveform" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      </section>
      <aside class="progress-panel" aria-label="Response progress">
        ${timer(view.deadlineAt)}
        <p class="section-label">Responses filed</p>
        <strong class="progress-count">${view.submittedCount}<span>/${view.roster.length}</span></strong>
        <div class="file-lights" aria-label="${view.submittedCount} of ${view.roster.length} responses filed">${view.roster.map((_, index) => `<span class="${index < view.submittedCount ? "is-on" : ""}"></span>`).join("")}</div>
      </aside>
    </div>`,
    view.roundNumber === view.totalRounds ? "Final file · points are doubled" : "File your bluff on your phone"
  );
}

function voting(view: PublicViewModel): string {
  return shell(
    view,
    `<div class="vote-layout">
      <section class="choice-stage">
        <p class="paper-tab">Which answer is true?</p>
        <h1 class="compact-prompt">${html(view.prompt)}</h1>
        <ol class="choice-board">${view.choices.map((choice, index) => `<li class="answer-color-${index % 4}" style="--choice-index:${index}"><span class="choice-key">${String.fromCharCode(65 + index)}</span>${flapText(choice.text.toUpperCase(), "choice-flaps")}<span class="choice-bulb" aria-hidden="true"></span></li>`).join("")}</ol>
      </section>
      <aside class="progress-panel" aria-label="Voting progress">
        ${timer(view.deadlineAt)}
        <p class="section-label">Votes locked</p>
        <strong class="progress-count">${view.votedCount}<span>/${view.roster.length}</span></strong>
        ${scoreboard(view.scoreboard, true)}
      </aside>
    </div>`,
    "Choose an answer and confidence on your phone"
  );
}

function resultRow(result: ChoiceResult, view: PublicViewModel, index: number): string {
  const author = result.authorId ? view.roster.find((player) => player.id === result.authorId)?.name : undefined;
  const voters = result.voterIds.map((id) => view.roster.find((player) => player.id === id)?.name ?? "Player");
  return `<li class="result-row result-${result.kind} answer-color-${index % 4}" style="--result-index:${index}">
    <span class="result-key" aria-hidden="true">${String.fromCharCode(65 + index)}</span>
    <div class="result-answer"><strong>${html(result.text)}</strong><span>${result.kind === "truth" ? "The truth" : result.kind === "bureau-decoy" ? "Bureau decoy" : `Filed by ${html(author ?? "Unknown")}`}</span></div>
    <div class="result-route">${voters.length ? `${voters.map(html).join(", ")} ${voters.length === 1 ? "voted" : "voted"}` : "No votes"}</div>
    <strong class="result-points">${result.pointsForAuthor ? `+${result.pointsForAuthor.toLocaleString()}` : result.kind === "truth" ? `${result.voterIds.length} found it` : "+0"}</strong>
  </li>`;
}

function results(view: PublicViewModel): string {
  const result = view.results;
  if (!result) return loading(view);
  return shell(
    view,
    `<div class="results-layout">
      <section class="truth-stage">
        <p class="truth-stamp">The truth</p>
        <div class="truth-burst" aria-hidden="true"></div>
        <h1>${flapText(result.caseFile.truth.toUpperCase(), "truth-flaps")}</h1>
        <p class="explanation">${html(result.caseFile.explanation)}</p>
        <p class="source-note">Source: ${html(result.caseFile.sourceLabel)}</p>
      </section>
      <ol class="result-ledger">${result.choices.map((choice, index) => resultRow(choice, view, index)).join("")}</ol>
      <aside class="results-score" aria-label="Current standings">${scoreboard(view.scoreboard)}</aside>
    </div>`,
    result.multiplier === 2 ? "Final file · all points doubled" : "Results filed"
  );
}

function roundBreak(view: PublicViewModel): string {
  return shell(view, `<div class="center-stage"><p class="paper-tab">File ${String(view.roundNumber).padStart(2, "0")} closed</p><h1>Next record incoming</h1>${scoreboard(view.scoreboard)}${timer(view.deadlineAt)}</div>`, "Stand by for the next file");
}

function gameOver(view: PublicViewModel): string {
  const [winner, second, third] = view.scoreboard;
  return shell(
    view,
    `<div class="final-layout">
      <section class="winner-board"><p class="paper-tab">Case closed</p><h1>${html(winner?.name ?? "No winner")}</h1><p>Chief of believable nonsense</p><strong>${(winner?.score ?? 0).toLocaleString()}</strong></section>
      <ol class="podium" aria-label="Final podium">
        ${second ? `<li class="place-second"><span>2</span><strong>${html(second.name)}</strong><b>${second.score.toLocaleString()}</b></li>` : ""}
        ${winner ? `<li class="place-first"><span>1</span><strong>${html(winner.name)}</strong><b>${winner.score.toLocaleString()}</b></li>` : ""}
        ${third ? `<li class="place-third"><span>3</span><strong>${html(third.name)}</strong><b>${third.score.toLocaleString()}</b></li>` : ""}
      </ol>
    </div>`,
    "The room director controls what happens next"
  );
}

function renderView(view: PublicViewModel): string {
  if (view.phase === "loading") return loading(view);
  if (view.phase === "lobby") return lobby(view);
  if (view.phase === "instructions") return instructions(view);
  if (view.phase === "writing") return writing(view);
  if (view.phase === "voting") return voting(view);
  if (view.phase === "results") return results(view);
  if (view.phase === "round-break") return roundBreak(view);
  return gameOver(view);
}

export class PublicSurfaceRenderer {
  private unsubscribe?: () => void;
  private interval?: number;
  private coordinator?: GameCoordinator;
  constructor(private readonly root: HTMLElement, private readonly spectator = false) {}

  connect(coordinator: GameCoordinator): void {
    this.coordinator = coordinator;
    this.unsubscribe?.();
    this.unsubscribe = coordinator.subscribe(() => this.render());
    this.interval = window.setInterval(() => this.updateTimer(), 1_000);
  }
  dispose(): void {
    this.unsubscribe?.();
    if (this.interval) window.clearInterval(this.interval);
  }
  private render() {
    if (!this.coordinator) return;
    this.root.innerHTML = renderView(publicView(this.coordinator.snapshot(), this.spectator));
  }
  private updateTimer() {
    if (!this.coordinator) return;
    const seconds = remainingSeconds(this.coordinator.snapshot().state?.deadlineAt ?? null);
    const timer = this.root.querySelector<HTMLElement>("[data-timer]");
    if (seconds === null || !timer) return;
    timer.setAttribute("aria-label", `${seconds} seconds remaining`);
    const cells = timer.querySelectorAll<HTMLElement>(".flap-cell");
    for (const [index, character] of [...String(seconds).padStart(2, "0")].entries()) {
      if (cells[index]) cells[index]!.textContent = character;
    }
  }
}
