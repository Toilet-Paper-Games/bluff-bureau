import { expect, test } from "vitest";

import { decodeBluffBureauState } from "../domain/codec";
import { mapRuntimeRole } from "./tpgRuntime";

test("production bootstrap maps the passive host and consumes the shell's external-game sentinel", () => {
  expect(mapRuntimeRole("host")).toBe("host-display");
  expect(decodeBluffBureauState({ kind: "external", gameId: "bluff-bureau" })).toBeUndefined();
  expect(() => decodeBluffBureauState({})).toThrow("invalid Bluff Bureau shared-state");
});
