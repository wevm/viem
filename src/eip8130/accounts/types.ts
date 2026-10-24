import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import type {
  AaPayer,
  TransactionSerializable8130,
  TransactionSerialized8130,
} from '../types/transaction.js'
import type { Signer } from '../utils/signTransaction.js'

/**
 * An account that can send AA (`AA_TX_TYPE`) transactions: it names the sender
 * and signs `sender_auth`.
 *
 * {@link toEoaAccount} returns one for a secp256k1 key. Keystore accounts from
 * `viem/experimental/keystore` also conform, and fill the optional hooks.
 */
export type AaAccount = {
  /** The sending account address. */
  readonly address: Address
  /** Signer that produces `sender_auth`. */
  readonly signer: Signer
  /**
   * Acting actor id, forwarded to `eth_estimateGas` as `senderActorId`
   * (EIP-8130 Keystore integration). Unset for plain secp256k1 accounts.
   */
  readonly actorId?: Hex | undefined
  /**
   * Resolves the nonce channel for a send. Called with the caller's requested
   * `nonceKey` (possibly undefined); returns the key to use, or undefined for
   * the default (`0`). Keystore accounts use it to confine restricted actors
   * to nonce-free mode.
   */
  resolveNonceKey?:
    | ((
        client: Client<Transport, Chain | undefined, Account | undefined>,
        parameters: { nonceKey?: bigint | undefined },
      ) => Promise<bigint | undefined>)
    | undefined
  /** Signs an `AA_TX_TYPE` transaction as this account. */
  signTransaction(
    transaction: TransactionSerializable8130,
    options?: {
      payer?: { account: Signer; address?: AaPayer | undefined } | undefined
    },
  ): Promise<TransactionSerialized8130>
}
