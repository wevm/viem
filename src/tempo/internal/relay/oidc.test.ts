import { createRequestListener } from '@remix-run/node-fetch-server'
import { Hash, Hex, PublicKey } from 'ox'
import {
  type BaseError,
  createClient,
  http,
  InvalidInputRpcError,
  zeroAddress,
} from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import { sendTransactionSync } from 'viem/actions'
import { Account, Actions, Oidc, Relay, withRelay } from 'viem/tempo'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import * as Tempo from '~test/tempo/config.js'
import { createIssuer, serve } from '~test/tempo/oidc.js'

// The Key Publisher precompile activates at T14.
const hardfork = import.meta.env.VITE_TEMPO_HARDFORK
const supported =
  Tempo.nodeEnv === 'localnet' && (!hardfork || hardfork === 'Tnext')
// A prover whose proving key matches the dev chain's development verifying key.
const prover = import.meta.env.VITE_TEMPO_OIDC_PROVER_URL
  ? {
      apiKey: import.meta.env.VITE_TEMPO_OIDC_PROVER_API_KEY ?? '',
      url: import.meta.env.VITE_TEMPO_OIDC_PROVER_URL as string,
    }
  : undefined

const owner = Tempo.accounts[0]
const audience = 'app'
const saltKey = Hash.keccak256(Hex.fromString('viem:oidc:salt-key'))

let issuer: Awaited<ReturnType<typeof createIssuer>>
let publisherId: Hex.Hex

beforeAll(async () => {
  if (!supported) return
  issuer = await createIssuer()
  ;({ publisherId } = await Actions.keyPublisher.createSync(
    Tempo.getClient({ account: owner }),
    {
      keys: [
        { issuer: Oidc.hashIssuer(issuer.iss), keyHashes: [issuer.keyHash] },
      ],
      salt: Hash.keccak256(Hex.fromString('viem:oidc:publisher')),
    },
  ))
})

afterAll(async () => {
  await issuer?.close()
})

describe.runIf(supported)('oidc_prove', () => {
  test('error: issuer not accepted', async () => {
    const { prepared, client } = setup()
    const token = await issuer.mint(
      claims({ iss: 'https://issuer.example', nonce: prepared.nonce }),
    )

    await expect(
      Actions.oidc.prove(client, { ...prepared, token }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidInputError: The ID token is not from an accepted issuer and audience.]`,
    )
  })

  test('error: audience not accepted', async () => {
    const { prepared, client } = setup()
    const token = await issuer.mint(
      claims({ aud: 'other', nonce: prepared.nonce }),
    )

    await expect(
      Actions.oidc.prove(client, { ...prepared, token }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidInputError: The ID token is not from an accepted issuer and audience.]`,
    )
  })

  test('error: not RS256', async () => {
    const { prepared, client } = setup()
    const token = await issuer.mint(claims({ nonce: prepared.nonce }), {
      alg: 'HS256',
    })

    await expect(
      Actions.oidc.prove(client, { ...prepared, token }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidInputError: The ID token must be signed with RS256.]`,
    )
  })

  test('error: expired token', async () => {
    const { prepared, client } = setup()
    const token = await issuer.mint(
      claims({ exp: now() - 1, nonce: prepared.nonce }),
    )

    await expect(
      Actions.oidc.prove(client, { ...prepared, token }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidInputError: The ID token has expired.]`,
    )
  })

  test('error: validUntil outside the window', async () => {
    const { prepared, client } = setup({ validUntil: now() + 601 })
    const token = await issuer.mint(claims({ nonce: prepared.nonce }))

    await expect(
      Actions.oidc.prove(client, { ...prepared, token }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidInputError: \`validUntil\` must be in the future and at most 600 seconds after the ID token's \`iat\`.]`,
    )
  })

  test('error: nonce for another access key', async () => {
    const { prepared, client } = setup()
    const other = setup()
    const token = await issuer.mint(claims({ nonce: other.prepared.nonce }))

    await expect(
      Actions.oidc.prove(client, { ...prepared, token }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidInputError: The ID token nonce does not commit to this access key.]`,
    )
  })

  test('error: unknown key', async () => {
    const { prepared, client } = setup()
    const token = await issuer.mint(claims({ nonce: prepared.nonce }), {
      kid: 'unknown',
    })

    await expect(
      Actions.oidc.prove(client, { ...prepared, token }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidInputError: The ID token signature does not match a key of its issuer.]`,
    )
  })

  test('error: invalid signature', async () => {
    const { prepared, client } = setup()
    const [header, payload] = (
      await issuer.mint(claims({ nonce: prepared.nonce }))
    ).split('.')
    const token = `${header}.${payload}.${(await issuer.mint({})).split('.')[2]}`

    await expect(
      Actions.oidc.prove(client, { ...prepared, token }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidInputError: The ID token signature does not match a key of its issuer.]`,
    )
  })

  test('error: key not listed by the publisher', async () => {
    const { prepared, client } = setup({
      publisherId: Hash.keccak256(Hex.fromString('viem:oidc:unknown')),
    })
    const token = await issuer.mint(claims({ nonce: prepared.nonce }))

    await expect(
      Actions.oidc.prove(client, { ...prepared, token }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidInputError: The Key Publisher does not list the key that signed the ID token.]`,
    )
  })

  test('error: malformed parameters', async () => {
    const { client } = setup()

    await expect(
      client.request({ method: 'oidc_prove' as never, params: [{}] as never }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Expected \`accessKeyAddress\` to be an address.]`,
    )
  })

  test('behavior: forwards other requests', async () => {
    const { client } = setup()

    expect(await client.request({ method: 'eth_chainId' })).toBe(
      Hex.fromNumber(Tempo.chain.id),
    )
  })

  test('behavior: remote relay', async () => {
    const relay = Relay.create({
      client: Tempo.getClient({ chain: Tempo.chain }),
      plugins: [plugin()],
    })
    const server = await serve(createRequestListener(relay.fetch))
    const client = createClient({
      chain: Tempo.chain,
      transport: withRelay(Tempo.http(), http(server.url)),
    })
    const { prepared } = setup()
    const token = await issuer.mint(
      claims({ aud: 'other', nonce: prepared.nonce }),
    )

    const error = await Actions.oidc.prove(client, { ...prepared, token }).then(
      () => undefined,
      (error: unknown) => error,
    )
    await server.close()

    if (!(error instanceof InvalidInputRpcError))
      throw new Error('Expected an InvalidInputRpcError.')
    expect(error.details).toMatchInlineSnapshot(
      `"The ID token is not from an accepted issuer and audience."`,
    )
    // Errors never quote the ID token or the blinding value.
    for (const secret of [token, prepared.blinding])
      expect(messages(error).join('\n')).not.toContain(secret)
  })
})

describe.runIf(supported && prover)('behavior: proven sign-in', () => {
  // Proving takes several seconds, and longer while the prover starts.
  test('default', { timeout: 120_000 }, async () => {
    const { client } = setup()
    const privateKey = generatePrivateKey()

    const credential = await Actions.oidc.prove(client, {
      getToken: ({ nonce }) => issuer.mint(claims({ nonce })),
      publicKey: Account.fromSecp256k1(privateKey).publicKey,
    })
    const account = Account.fromZk(credential)
    const accessKey = Account.fromSecp256k1(privateKey, { access: account })
    await Tempo.setupFeeToken(Tempo.getClient(), { account: accessKey })
    const keyAuthorization = await account.signKeyAuthorization(accessKey, {
      chainId: BigInt(Tempo.chain.id),
    })
    const receipt = await sendTransactionSync(
      Tempo.getClient({ account: accessKey }),
      { keyAuthorization, to: zeroAddress },
    )

    const {
      addressSeed: _,
      issuedAt,
      proof: __,
      validUntil,
      ...rest
    } = credential
    expect(rest).toEqual({
      issuer: Oidc.hashIssuer(issuer.iss),
      keyHash: issuer.keyHash,
      publisherId,
      scheme: 1,
    })
    expect(validUntil - issuedAt).toBeLessThanOrEqual(600)
    expect(receipt.status).toBe('success')
  })
})

function plugin(options: { publisherId?: Hex.Hex | undefined } = {}) {
  return Relay.oidc({
    audiences: [audience],
    issuers: [issuer.iss],
    prover: prover ?? { apiKey: '', url: 'http://localhost:1' },
    publisherId: options.publisherId ?? publisherId,
    saltKey,
  })
}

function setup(
  options: {
    publisherId?: Hex.Hex | undefined
    validUntil?: number | undefined
  } = {},
) {
  const { validUntil } = options
  const prepared = Oidc.prepare({
    publicKey: PublicKey.fromHex(
      Account.fromSecp256k1(generatePrivateKey()).publicKey,
    ),
    validUntil,
  })
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), { plugins: [plugin(options)] }),
  })
  return { client, prepared }
}

function claims(overrides: Record<string, unknown> = {}) {
  return {
    aud: audience,
    exp: now() + 600,
    iat: now(),
    iss: issuer.iss,
    sub: 'user',
    ...overrides,
  }
}

function messages(error: unknown): string[] {
  if (!(error instanceof Error)) return []
  const { metaMessages = [], stack = '' } = error as BaseError
  return [error.message, stack, ...metaMessages, ...messages(error.cause)]
}

function now() {
  return Math.floor(Date.now() / 1000)
}
