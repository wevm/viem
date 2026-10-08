import type { Address } from 'abitype'
import * as Address_ from 'ox/Address'
import * as Base64 from 'ox/Base64'
import * as Bytes from 'ox/Bytes'
import * as Hex from 'ox/Hex'
import * as RpcResponse from 'ox/RpcResponse'
import { Oidc } from 'ox/tempo'
import { isKeyActive } from '../../actions/keyPublisher.js'
import type * as Relay from '../../Relay.js'

// Scheme `0x01` accepts a ZK signature for at most 600 seconds after the token's `iat`.
const maxValidity = 600

/** Creates middleware that proves OIDC sign-ins as the salt service. @internal */
export function create(options: Relay.oidc.Options): Relay.Plugin {
  const {
    audiences,
    fetch = globalThis.fetch,
    issuers,
    prover,
    publisherId,
    saltKey,
  } = options
  const accepted = new Map(issuers.map((iss) => [Oidc.hashIssuer(iss), iss]))

  // Signing keys per issuer, refetched when a token names a key they lack. Failed fetches are not kept.
  const keySets = new Map<string, Promise<readonly Oidc.Key[]>>()
  async function getKey(iss: string, kid: string | undefined) {
    const find = (keys: readonly Oidc.Key[]) =>
      keys.find((key) => key.kid === kid)
    const cached = await keySets.get(iss)?.catch(() => undefined)
    const key = cached && find(cached)
    if (key) return key
    const keys = fetchKeys(fetch, iss)
    keySets.set(iss, keys)
    keys.catch(() => keySets.delete(iss))
    return find(await keys)
  }

  return {
    async handleRequest(context, next) {
      if (context.request.method !== 'oidc_prove') return next()

      const { accessKeyAddress, blinding, token, validUntil } = parseParameters(
        context.request.params?.[0],
      )
      const { claims, header, signature, signedInput } = decode(token)

      if (header.alg !== 'RS256')
        throw new RpcResponse.InvalidInputError({
          message: 'The ID token must be signed with RS256.',
        })
      const iss = accepted.get(Oidc.hashIssuer(claims.iss))
      if (!iss || !audiences.includes(claims.aud))
        throw new RpcResponse.InvalidInputError({
          message: 'The ID token is not from an accepted issuer and audience.',
        })
      const now = Math.floor(Date.now() / 1000)
      if (claims.exp <= now)
        throw new RpcResponse.InvalidInputError({
          message: 'The ID token has expired.',
        })
      if (validUntil <= now || validUntil > claims.iat + maxValidity)
        throw new RpcResponse.InvalidInputError({
          message: `\`validUntil\` must be in the future and at most ${maxValidity} seconds after the ID token's \`iat\`.`,
        })
      const nonce = (() => {
        try {
          return Oidc.getNonce({ accessKeyAddress, blinding, validUntil })
        } catch (error) {
          if (error instanceof Oidc.InvalidFieldElementError)
            throw new RpcResponse.InvalidParamsError({
              message:
                'Expected `blinding` to be below the BN254 scalar field modulus.',
            })
          throw error
        }
      })()
      // The circuit checks the nonce too; checking first saves a proof the node would reject.
      if (claims.nonce !== nonce)
        throw new RpcResponse.InvalidInputError({
          message: 'The ID token nonce does not commit to this access key.',
        })

      const key = await getKey(iss, header.kid)
      if (!key || !(await verify({ key, signature, signedInput })))
        throw new RpcResponse.InvalidInputError({
          message: 'The ID token signature does not match a key of its issuer.',
        })
      const issuer = Oidc.hashIssuer(iss)
      const active = await isKeyActive(context.client, {
        issuer,
        keyHash: key.keyHash,
        publisherId,
      })
      if (!active)
        throw new RpcResponse.InvalidInputError({
          message:
            'The Key Publisher does not list the key that signed the ID token.',
        })

      const { aud, iat, sub } = claims
      const salt = Oidc.getSalt({ aud, iss, key: saltKey, sub })
      const addressSeed = (() => {
        try {
          return Oidc.getAddressSeed({ aud, salt, sub })
        } catch (error) {
          if (error instanceof Oidc.ClaimTooLongError)
            throw new RpcResponse.InvalidInputError({ message: error.message })
          throw error
        }
      })()
      const proof = await prove(fetch, {
        prover,
        request: {
          blinding,
          commitA: Hex.padLeft(accessKeyAddress, 32),
          commitB: Hex.fromNumber(validUntil, { size: 32 }),
          modulus: key.modulus,
          salt,
          token,
        },
      })
      const publicInput = Oidc.getPublicInput({
        accessKeyAddress,
        addressSeed,
        issuedAt: iat,
        issuer,
        keyHash: key.keyHash,
        validUntil,
      })
      if (Hex.toBigInt(proof.publicInput) !== Hex.toBigInt(publicInput))
        throw new RpcResponse.InternalError({
          message: 'The prover returned a proof for another statement.',
        })

      return {
        addressSeed,
        issuedAt: Hex.fromNumber(iat),
        issuer,
        keyHash: key.keyHash,
        proof: proof.proof,
        publisherId,
        scheme: Hex.fromNumber(Oidc.scheme),
        validUntil: Hex.fromNumber(validUntil),
      }
    },
  }
}

type Claims = {
  aud: string
  exp: number
  iat: number
  iss: string
  nonce: string
  sub: string
}

type Header = { alg?: unknown; kid?: string | undefined }

// Errors never quote the token, blinding value, or salt, since they are secrets.
function parseParameters(value: unknown) {
  const { accessKeyAddress, blinding, token, validUntil } = (
    value && typeof value === 'object' ? value : {}
  ) as Record<string, unknown>
  if (
    typeof accessKeyAddress !== 'string' ||
    !Address_.validate(accessKeyAddress)
  )
    throw new RpcResponse.InvalidParamsError({
      message: 'Expected `accessKeyAddress` to be an address.',
    })
  if (
    typeof blinding !== 'string' ||
    !Hex.validate(blinding, { strict: true }) ||
    Hex.size(blinding) > 32
  )
    throw new RpcResponse.InvalidParamsError({
      message: 'Expected `blinding` to be a 32-byte hex value.',
    })
  if (typeof token !== 'string')
    throw new RpcResponse.InvalidParamsError({
      message: 'Expected `token` to be a compact JWS ID token.',
    })
  if (
    typeof validUntil !== 'string' ||
    !Hex.validate(validUntil, { strict: true }) ||
    !Number.isSafeInteger(Hex.toNumber(validUntil))
  )
    throw new RpcResponse.InvalidParamsError({
      message: 'Expected `validUntil` to be a hex quantity.',
    })
  return {
    accessKeyAddress: accessKeyAddress as Address,
    blinding: blinding as Hex.Hex,
    token,
    validUntil: Hex.toNumber(validUntil),
  }
}

function decode(token: string) {
  const invalid = () =>
    new RpcResponse.InvalidParamsError({
      message: 'Expected `token` to be a compact JWS ID token.',
    })
  const parts = token.split('.')
  if (parts.length !== 3) throw invalid()
  const [header, payload, signature] = parts as [string, string, string]
  const [decodedHeader, claims] = (() => {
    try {
      return [header, payload].map((part) =>
        JSON.parse(Bytes.toString(Base64.toBytes(part))),
      ) as [Header, Record<string, unknown>]
    } catch {
      throw invalid()
    }
  })()
  for (const name of ['aud', 'iss', 'nonce', 'sub'] as const)
    if (typeof claims[name] !== 'string')
      throw new RpcResponse.InvalidInputError({
        message: `The ID token has no single \`${name}\` string.`,
      })
  for (const name of ['exp', 'iat'] as const)
    if (!Number.isSafeInteger(claims[name]))
      throw new RpcResponse.InvalidInputError({
        message: `The ID token has no \`${name}\` time.`,
      })
  return {
    claims: claims as Claims,
    header: decodedHeader,
    signature: Base64.toBytes(signature),
    signedInput: `${header}.${payload}`,
  }
}

async function verify(options: {
  key: Oidc.Key
  signature: Bytes.Bytes
  signedInput: string
}) {
  const { key, signature, signedInput } = options
  const algorithm = { hash: 'SHA-256', name: 'RSASSA-PKCS1-v1_5' }
  const publicKey = await globalThis.crypto.subtle.importKey(
    'jwk',
    {
      alg: 'RS256',
      e: 'AQAB',
      kty: 'RSA',
      n: Base64.fromHex(key.modulus, { pad: false, url: true }),
    },
    algorithm,
    false,
    ['verify'],
  )
  return globalThis.crypto.subtle.verify(
    algorithm,
    publicKey,
    signature as Uint8Array<ArrayBuffer>,
    Bytes.fromString(signedInput) as Uint8Array<ArrayBuffer>,
  )
}

// Reads the issuer's key set through its discovery document, keeping the keys ZK signatures can use.
async function fetchKeys(fetch: typeof globalThis.fetch, iss: string) {
  const discovery = (await get(
    fetch,
    `${iss.replace(/\/$/, '')}/.well-known/openid-configuration`,
  )) as { issuer?: unknown; jwks_uri?: unknown }
  if (discovery.issuer !== iss || typeof discovery.jwks_uri !== 'string')
    throw new RpcResponse.InternalError({
      message: 'The issuer discovery document is invalid.',
    })
  const { keys } = (await get(fetch, discovery.jwks_uri)) as {
    keys?: readonly Oidc.fromJwk.Jwk[] | undefined
  }
  return (keys ?? []).flatMap((jwk) => {
    try {
      return [Oidc.fromJwk(jwk)]
    } catch (error) {
      if (error instanceof Oidc.UnsupportedKeyError) return []
      throw error
    }
  })
}

async function get(fetch: typeof globalThis.fetch, url: string) {
  const response = await fetch(url)
  if (!response.ok)
    throw new RpcResponse.InternalError({
      message: 'The issuer keys are unavailable.',
    })
  return response.json() as Promise<unknown>
}

async function prove(
  fetch: typeof globalThis.fetch,
  options: {
    prover: Relay.oidc.Options['prover']
    request: Record<string, string>
  },
) {
  const { prover, request } = options
  const response = await fetch(`${prover.url.replace(/\/$/, '')}/v1/proofs`, {
    body: JSON.stringify(request),
    headers: {
      authorization: `Bearer ${prover.apiKey}`,
      'content-type': 'application/json',
    },
    method: 'POST',
  })
  const body = (await response.json().catch(() => undefined)) as
    | { proof?: unknown; publicInput?: unknown }
    | undefined
  // Prover messages are not passed on, so errors never depend on what the prover quotes.
  if (response.status === 503)
    throw new RpcResponse.ResourceUnavailableError({
      message: 'The prover is busy or starting. Retry the request.',
    })
  if (response.status === 400 || response.status === 422)
    throw new RpcResponse.InvalidInputError({
      message: 'The prover cannot prove this sign-in.',
    })
  if (
    !response.ok ||
    typeof body?.proof !== 'string' ||
    typeof body.publicInput !== 'string'
  )
    throw new RpcResponse.InternalError({ message: 'The prover failed.' })
  return {
    proof: body.proof as Hex.Hex,
    publicInput: body.publicInput as Hex.Hex,
  }
}
