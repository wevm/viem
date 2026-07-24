import { Account, Actions, type Client } from 'viem'
import {
  type Address,
  type Hex,
  PublicKey,
  Secp256k1,
  Signature,
} from 'viem/utils'

export async function sendEth(client: Client.Client, options: sendEth.Options) {
  const { privateKey, to, value } = options
  const account = Account.from({
    publicKey: PublicKey.toHex(Secp256k1.getPublicKey({ privateKey })),
    sign: ({ hash }) =>
      Signature.toHex(Secp256k1.sign({ payload: hash, privateKey })),
  })
  return Actions.transaction.sendSync(client, { account, to, value })
}

export declare namespace sendEth {
  type Options = {
    privateKey: Hex.Hex
    to: Address.Address
    value: bigint
  }
}
