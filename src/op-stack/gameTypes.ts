/**
 * Super dispute game type IDs from the OP Stack contracts
 * (`GameTypes.isSuperGame` in `contracts-bedrock/src/dispute/lib/Types.sol`):
 * `SUPER_CANNON` (4), `SUPER_PERMISSIONED` (5), `SUPER_ASTERISC_KONA` (7),
 * `SUPER_CANNON_KONA` (9) and `ZK_DISPUTE_GAME` (10).
 */
export const superGameTypes = new Set([4, 5, 7, 9, 10]) as ReadonlySet<number>

export function isSuperGameType(gameType: number): boolean {
  return superGameTypes.has(gameType)
}
