import type { CoordinatorSnapshot, GameCoordinator } from "../application/coordinator";

export function staticCoordinator(snapshot: CoordinatorSnapshot): GameCoordinator {
  return {
    snapshot: () => snapshot,
    subscribe(listener: (value: CoordinatorSnapshot) => void) {
      listener(snapshot);
      return () => {};
    },
    submitBluff: async () => ({ status: "applied", revision: 1 }),
    submitVote: async () => ({ status: "applied", revision: 1 }),
    advance: async () => ({ status: "applied", revision: 1 }),
    openSettings: async () => {},
    returnToLobby: async () => {}
  } as unknown as GameCoordinator;
}
