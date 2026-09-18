/**
 * Registry of chain IDs known to support EIP-8130 natively (the `AA_TX_TYPE`
 * transaction type and the protocol precompiles).
 *
 * @remarks
 * EIP-8130 is enabled per-chain. Accounts are portable: on an 8130-enabled chain
 * use the `AA_TX_TYPE` flow; on other chains the same account operates through an
 * alternative AA mechanism (e.g. ERC-4337) with the `Keystore`
 * contract as its factory.
 *
 * This set is empty by default (no networks have shipped 8130 yet). Populate it
 * with {@link register8130Chains}, or pass an explicit `chainIds` set to
 * {@link is8130Enabled}.
 */
export const eip8130ChainIds: Set<number> = new Set<number>()

/** Registers one or more chain IDs as EIP-8130 enabled. */
export function register8130Chains(...chainIds: number[]): void {
  for (const id of chainIds) eip8130ChainIds.add(id)
}

/** Unregisters one or more chain IDs. */
export function unregister8130Chains(...chainIds: number[]): void {
  for (const id of chainIds) eip8130ChainIds.delete(id)
}

export type Is8130EnabledParameters = {
  /**
   * Explicit set of 8130-enabled chain IDs to check against. Defaults to the
   * shared {@link eip8130ChainIds} registry.
   */
  chainIds?: Iterable<number> | undefined
}

/**
 * Returns whether a chain supports EIP-8130 natively — i.e. whether to route a
 * transaction through the `AA_TX_TYPE` flow (`true`) or an ERC-4337-style
 * fallback (`false`).
 */
export function is8130Enabled(
  chain: number | { id: number },
  parameters: Is8130EnabledParameters = {},
): boolean {
  const id = typeof chain === 'number' ? chain : chain.id
  const set = parameters.chainIds
    ? parameters.chainIds instanceof Set
      ? parameters.chainIds
      : new Set(parameters.chainIds)
    : eip8130ChainIds
  return set.has(id)
}
