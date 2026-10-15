/**
 * Registry of chain IDs whose node RPC serves the ERC-8168 `payer_*` methods
 * natively — i.e. the wallet can add the execution client itself as a payer
 * source (see {@link toChainPayerClient}) instead of, or alongside, an external
 * payer web service.
 *
 * @remarks
 * A payer service can be exposed by several parties: the chain/node itself, a
 * block builder integrated with the sequencer (e.g. flashblocks), an app's own
 * endpoint, or the wallet. Only the node-native case is discoverable from the
 * chain, so it is tracked here; the other sources are supplied explicitly to
 * {@link createAggregatePayerClient}.
 *
 * This set is empty by default. Populate it with {@link registerPayerServiceChains},
 * or pass an explicit `chainIds` set to {@link hasChainPayerService}.
 */
export const payerServiceChainIds: Set<number> = new Set<number>()

/** Registers one or more chain IDs as serving `payer_*` on their node RPC. */
export function registerPayerServiceChains(...chainIds: number[]): void {
  for (const id of chainIds) payerServiceChainIds.add(id)
}

/** Unregisters one or more chain IDs. */
export function unregisterPayerServiceChains(...chainIds: number[]): void {
  for (const id of chainIds) payerServiceChainIds.delete(id)
}

export type HasChainPayerServiceParameters = {
  /**
   * Explicit set of chain IDs to check against. Defaults to the shared
   * {@link payerServiceChainIds} registry.
   */
  chainIds?: Iterable<number> | undefined
}

/**
 * Returns whether a chain serves the ERC-8168 payer service on its node RPC. A
 * wallet uses this to decide whether to include {@link toChainPayerClient} among
 * the payer sources it queries in parallel.
 *
 * Accepts a chain ID, a chain object, or `undefined` (returns `false`, so it can
 * be called directly with `client.chain`).
 */
export function hasChainPayerService(
  chain: number | { id: number } | undefined,
  parameters: HasChainPayerServiceParameters = {},
): boolean {
  if (chain === undefined) return false
  const id = typeof chain === 'number' ? chain : chain.id
  const set = parameters.chainIds
    ? parameters.chainIds instanceof Set
      ? parameters.chainIds
      : new Set(parameters.chainIds)
    : payerServiceChainIds
  return set.has(id)
}
