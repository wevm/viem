import { createServer, type RequestListener } from 'node:http'
import type { AddressInfo } from 'node:net'
import { Base64, Bytes } from 'ox'
import { Oidc } from 'ox/tempo'

/**
 * Starts an OIDC issuer on a local port: it serves a discovery document and one
 * RS256 key, and mints ID tokens with that key.
 */
export async function createIssuer() {
  const { privateKey, publicKey } = (await globalThis.crypto.subtle.generateKey(
    {
      hash: 'SHA-256',
      modulusLength: 2048,
      name: 'RSASSA-PKCS1-v1_5',
      publicExponent: new Uint8Array([1, 0, 1]),
    },
    true,
    ['sign', 'verify'],
  )) as CryptoKeyPair
  const jwk = {
    ...(await globalThis.crypto.subtle.exportKey('jwk', publicKey)),
    alg: 'RS256',
    kid: 'k1',
    use: 'sig',
  }

  const server = await serve((request, response) => {
    response.setHeader('content-type', 'application/json')
    if (request.url === '/.well-known/openid-configuration') {
      response.end(
        JSON.stringify({ issuer: server.url, jwks_uri: `${server.url}/jwks` }),
      )
      return
    }
    if (request.url === '/jwks') {
      response.end(JSON.stringify({ keys: [jwk] }))
      return
    }
    response.statusCode = 404
    response.end('{}')
  })

  /** Mints an ID token, signed with the issuer's key unless `kid` names another. */
  async function mint(
    claims: Record<string, unknown>,
    options: { alg?: string | undefined; kid?: string | undefined } = {},
  ) {
    const { alg = 'RS256', kid = 'k1' } = options
    const encode = (value: unknown) =>
      Base64.fromString(JSON.stringify(value), { pad: false, url: true })
    const signedInput = `${encode({ alg, kid, typ: 'JWT' })}.${encode(claims)}`
    const signature = await globalThis.crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKey,
      Bytes.fromString(signedInput) as Uint8Array<ArrayBuffer>,
    )
    return `${signedInput}.${Base64.fromBytes(new Uint8Array(signature), { pad: false, url: true })}`
  }

  return {
    close: server.close,
    iss: server.url,
    keyHash: Oidc.fromJwk(jwk).keyHash,
    mint,
  }
}

/** Serves `listener` on a local port. */
export function serve(
  listener: RequestListener,
): Promise<{ close: () => Promise<void>; url: string }> {
  const server = createServer(listener)
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo
      resolve({
        close: () =>
          new Promise((resolve, reject) =>
            server.close((error) => (error ? reject(error) : resolve())),
          ),
        url: `http://127.0.0.1:${port}`,
      })
    })
  })
}
