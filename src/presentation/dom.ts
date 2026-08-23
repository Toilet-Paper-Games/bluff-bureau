export function html(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function flapText(value: string, className = ""): string {
  return `<span class="flap-text ${html(className)}" aria-label="${html(value)}">${value.split(" ")
    .map((word) => `<span class="flap-word" aria-hidden="true">${[...word]
      .map((character) => `<span class="flap-cell">${html(character)}</span>`)
      .join("")}</span>`)
    .join("")}</span>`;
}

export function remainingSeconds(deadlineAt: number | null, now = Date.now()): number | null {
  return deadlineAt === null ? null : Math.max(0, Math.ceil((deadlineAt - now) / 1_000));
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return count === 1 ? singular : pluralForm;
}
