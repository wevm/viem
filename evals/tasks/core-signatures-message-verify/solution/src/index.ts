import { Account, Actions, type Client } from 'viem'
import type { Address, Hex } from 'viem/utils'

export async function signPersonalMessage(
  options: signPersonalMessage.Options,
): Promise<Hex.Hex> {
  const { message, privateKey } = options
  return Account.fromPrivateKey(privateKey).signMessage({ message })
}

export declare namespace signPersonalMessage {
  type Options = {
    message: string
    privateKey: Hex.Hex
  }
}

export async function verifySignature(
  client: Client.Client,
  options: verifySignature.Options,
): Promise<boolean> {
  return Actions.verifyMessage(client, options)
}

export declare namespace verifySignature {
  type Options = {
    address: Address.Address
    message: string
    signature: Hex.Hex
  }
}
