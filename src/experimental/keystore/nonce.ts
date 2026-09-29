import { nonceFreeDefaultExpiryWindow } from '../../eip8130/constants.js'
import { type Nonce, nonce } from '../../eip8130/nonce.js'
import { isNoncelessOnly } from './keys.js'

/**
 * Selects the default nonce strategy for an actor's `scope`, mirroring the
 * node rule. Admin actors (`scope == 0`) and actors holding `SCOPE_NONCE` may
 * use ordered *or* nonce-free nonces; only a restricted actor **without**
 * `SCOPE_NONCE` is confined to nonce-free.
 *
 * - Admin (`scope == 0`) **or** `SCOPE_NONCE` set → sequenced
 *   `nonce.channel` (default channel `0`, i.e. `nonce.sequential`).
 * - Restricted actor **without** `SCOPE_NONCE` → `nonce.nonceless`,
 *   defaulting the window to `nonceFreeDefaultExpiryWindow` from now.
 *
 * @param scope - The signing actor's scope bitmask.
 * @param parameters.key - Sequenced channel selector (ignored in nonce-free
 *   mode). @default 0n
 * @param parameters.validBefore - Absolute upper validity bound (unix ms) for
 *   nonce-free mode. Overrides `expiresIn`.
 * @param parameters.expiresIn - Relative validity window (seconds) for
 *   nonce-free mode. @default Number(nonceFreeDefaultExpiryWindow) / 1000
 */
export function nonceForScope(
  scope: number,
  parameters: {
    key?: bigint | undefined
    validBefore?: bigint | undefined
    expiresIn?: number | undefined
  } = {},
): Nonce {
  if (isNoncelessOnly(scope))
    return nonce.nonceless(
      parameters.validBefore !== undefined
        ? { validBefore: parameters.validBefore }
        : {
            // `nonceFreeDefaultExpiryWindow` is milliseconds; `expiresIn` seconds.
            expiresIn:
              parameters.expiresIn ??
              Number(nonceFreeDefaultExpiryWindow) / 1000,
          },
    )
  return nonce.channel(parameters.key ?? 0n)
}
