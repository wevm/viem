import type { Address, TypedData } from 'abitype'
import type { LocalAccount } from '../../accounts/types.js'
import { BaseError } from '../../errors/base.js'
import type { Hex, SignableMessage } from '../../types/misc.js'
import type { TypedDataDefinition } from '../../types/typedData.js'
import { k1Authenticator } from '../constants.js'
import type { AaAccountChangeDelegation } from '../types/transaction.js'
import { type Signer, signTransaction } from '../utils/signTransaction.js'
import type { AaAccount } from './types.js'

export type ToEoaAccountReturnType = AaAccount & {
  /** viem account kind (`'local'`), so core `sendTransaction` takes the local-account path. */
  readonly type: 'local'
  /** viem account source marker used by `eip8130ChainConfig` to detect AA sends. */
  readonly source: 'eip8130'
  /** SEC1 hex public key of the signer, or `'0x'` when unavailable. */
  readonly publicKey: Hex
  /** Personal-sign `message` with the EOA key (delegates to the signer). */
  signMessage(parameters: { message: SignableMessage }): Promise<Hex>
  /** Sign EIP-712 `typedData` with the EOA key (delegates to the signer). */
  signTypedData<
    const typedData extends TypedData | Record<string, unknown>,
    primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
  >(parameters: TypedDataDefinition<typedData, primaryType>): Promise<Hex>
  /**
   * Builds a `delegation` account-change entry that sets EIP-7702-style code
   * at this EOA (or clears it with the zero address). Authorized by the
   * transaction's own `sender_auth`; nothing is delegated automatically.
   *
   * @example
   * await sendTransaction(client, {
   *   account,
   *   accountChanges: [account.delegate(implementation)],
   *   calls: [{ to: account.address, data }],
   *   gas,
   * })
   */
  delegate(target: Address): AaAccountChangeDelegation
}

/**
 * Wraps a secp256k1 EOA signer for AA (`AA_TX_TYPE`) transactions. The EOA
 * key is the account: `sender_auth` is `K1_AUTHENTICATOR || r || s || v` when
 * the sender is named, or a raw 65-byte signature when it is recovered.
 *
 * The account also conforms to viem's `LocalAccount` shape, so on a chain that
 * spreads {@link eip8130ChainConfig} core `client.sendTransaction({ calls })`
 * submits an AA transaction.
 *
 * @example
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { sendTransaction, toEoaAccount } from 'viem/eip8130'
 *
 * const account = toEoaAccount(privateKeyToAccount(pk))
 * const hash = await sendTransaction(client, {
 *   account,
 *   calls: [{ to, value: parseEther('0.01') }, { to: token, data }],
 *   gas: 200_000n,
 * })
 */
export function toEoaAccount(signer: Signer): ToEoaAccountReturnType {
  if (!signer.address)
    throw new BaseError(
      '`signer.address` is required. Use `privateKeyToAccount(pk)` or equivalent.',
    )
  const address = signer.address
  const local = signer as Partial<LocalAccount>
  const publicKey: Hex =
    typeof local.publicKey === 'string' ? local.publicKey : '0x'

  return {
    address,
    signer,
    type: 'local',
    source: 'eip8130',
    publicKey,

    async signMessage({ message }) {
      if (!local.signMessage)
        throw new BaseError('`signer` does not support `signMessage`.')
      return local.signMessage({ message })
    },
    async signTypedData(typedData) {
      if (!local.signTypedData)
        throw new BaseError('`signer` does not support `signTypedData`.')
      return local.signTypedData(typedData as never)
    },

    delegate(target) {
      return { type: 'delegation', target }
    },

    async signTransaction(transaction, options = {}) {
      if (!signer.sign)
        throw new BaseError('`signer` does not support raw signing.')
      return signTransaction({
        transaction,
        account: signer,
        authenticator: k1Authenticator,
        payer: options.payer,
      })
    },
  }
}
