import { Account, Actions, type Client } from 'viem'
import { type Hex, Siwe } from 'viem/utils'

export function buildSignInMessage(options: buildSignInMessage.Options) {
  return Siwe.createMessage({ ...options, chainId: 1, version: '1' })
}

export declare namespace buildSignInMessage {
  type Options = Pick<Siwe.Message, 'address' | 'domain' | 'nonce' | 'uri'>
}

export async function signSignInMessage(options: signSignInMessage.Options) {
  const { message, privateKey } = options
  return Account.fromPrivateKey(privateKey).signMessage({ message })
}

export declare namespace signSignInMessage {
  type Options = {
    message: string
    privateKey: Hex.Hex
  }
}

export async function verifySignIn(
  client: Client.Client,
  options: verifySignIn.Options,
) {
  return Actions.verifySiweMessage(client, options)
}

export declare namespace verifySignIn {
  type Options = Required<
    Pick<Actions.verifySiweMessage.Options, 'message' | 'nonce' | 'signature'>
  >
}
