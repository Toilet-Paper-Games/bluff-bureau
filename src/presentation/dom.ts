export function html(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function flapText(value: string, className = ""): string {
  return `<span class="flap-text ${html(className)}" aria-label="${html(value)}">${[...value]
    .map((character) => `<span class="flap-cell" aria-hidden="true">${character === " " ? "&nbsp;" : html(character)}</span>`)
    .join("")}</span>`;
}

export function remainingSeconds(deadlineAt: number | null, now = Date.now()): number | null {
  return deadlineAt === null ? null : Math.max(0, Math.ceil((deadlineAt - now) / 1_000));
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return count === 1 ? singular : pluralForm;
}
