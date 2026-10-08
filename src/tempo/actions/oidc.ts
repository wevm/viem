import type { Address } from 'abitype'
import * as Hex from 'ox/Hex'
import * as PublicKey from 'ox/PublicKey'
import { Oidc, type ZkSignature } from 'ox/tempo'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { OneOf } from '../../types/utils.js'

/**
 * Proves an OIDC sign-in and returns the credential that `Account.fromZk` signs with,
 * along with the nonce and ID token it proved.
 *
 * Pass `Oidc.prepare`'s result with the ID token the issuer returned for its nonce,
 * or pass the access key's public key and a `getToken` callback to sign in within the
 * page. The transport must reach a relay with the `Relay.oidc` plugin.
 *
 * [TIP-1133](https://tips.sh/1133)
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Account, Actions, withRelay } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo,
 *   transport: withRelay(http(), http('https://relay.example')),
 * })
 *
 * const { credential } = await Actions.oidc.prove(client, {
 *   getToken: ({ nonce }) => signIn({ nonce }),
 *   publicKey: '0x...',
 * })
 * const account = Account.fromZk(credential)
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The ZK credential, with the nonce and ID token it proves.
 */
export async function prove<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: prove.Parameters,
): Promise<prove.ReturnValue> {
  const { accessKeyAddress, blinding, token, validUntil } = await (async () => {
    if (!parameters.getToken) return parameters
    const { getToken, publicKey, validUntil } = parameters
    const prepared = Oidc.prepare({
      publicKey:
        typeof publicKey === 'string'
          ? PublicKey.fromHex(publicKey)
          : publicKey,
      validUntil,
    })
    return { ...prepared, token: await getToken({ nonce: prepared.nonce }) }
  })()
  const response = await client
    .request<{
      Method: 'oidc_prove'
      Parameters: [prove.Request]
      ReturnType: prove.Response
    }>({
      method: 'oidc_prove',
      params: [
        {
          accessKeyAddress,
          blinding,
          token,
          validUntil: Hex.fromNumber(validUntil),
        },
      ],
    })
    .catch((error) => {
      throw redact(error, [token, blinding])
    })
  return {
    credential: {
      addressSeed: response.addressSeed,
      issuedAt: Hex.toNumber(response.issuedAt),
      issuer: response.issuer,
      keyHash: response.keyHash,
      proof: response.proof,
      publisherId: response.publisherId,
      scheme: Hex.toNumber(response.scheme),
      validUntil: Hex.toNumber(response.validUntil),
    },
    // The relay checked that the token's nonce commits to these values.
    nonce: Oidc.getNonce({ accessKeyAddress, blinding, validUntil }),
    token,
  }
}

export declare namespace prove {
  export type Parameters = OneOf<
    | {
        /** Address of the access key the nonce commits to. */
        accessKeyAddress: Address
        /** Blinding value the nonce commits to. */
        blinding: Hex.Hex
        /** ID token the issuer returned for the nonce. */
        token: string
        /** When the credential expires, in seconds. */
        validUntil: number
      }
    | {
        /** Signs in with the nonce, returning the issuer's ID token. */
        getToken: (parameters: {
          /** Nonce to request the ID token with. */
          nonce: string
        }) => string | Promise<string>
        /** Public key of the access key the credential will commit to. */
        publicKey: Hex.Hex | PublicKey.PublicKey
        /** When the credential expires, in seconds. Defaults to 540 seconds from now. */
        validUntil?: number | undefined
      }
  >

  export type ReturnValue = {
    /** Credential that `Account.fromZk` signs with. */
    credential: ZkSignature.Credential
    /** Nonce the ID token was requested with. */
    nonce: string
    /** ID token the credential proves. */
    token: string
  }

  /** `oidc_prove` request, as the relay receives it. */
  export type Request = {
    /** Address of the access key the nonce commits to. */
    accessKeyAddress: Address
    /** Blinding value the nonce commits to. */
    blinding: Hex.Hex
    /** ID token the issuer returned for the nonce. */
    token: string
    /** When the credential expires, in seconds. */
    validUntil: Hex.Hex
  }

  /** `oidc_prove` response: the credential, with hex quantities. */
  export type Response = {
    [key in keyof ZkSignature.Credential]: Hex.Hex
  }

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

// RPC errors quote their request body, which holds the ID token and blinding value.
function redact(error: unknown, secrets: readonly string[]) {
  const replace = (value: string) =>
    secrets.reduce(
      (value, secret) => value.replaceAll(secret, '[redacted]'),
      value,
    )
  const seen = new Set<unknown>()
  for (
    let current = error as Record<string, unknown> | undefined;
    current && typeof current === 'object' && !seen.has(current);
    current = current.cause as Record<string, unknown> | undefined
  ) {
    seen.add(current)
    for (const key of ['details', 'message', 'shortMessage', 'stack'])
      if (typeof current[key] === 'string')
        current[key] = replace(current[key] as string)
    if (Array.isArray(current.metaMessages))
      current.metaMessages = current.metaMessages.map((message) =>
        typeof message === 'string' ? replace(message) : message,
      )
    if ('body' in current) delete current.body
  }
  return error
}
