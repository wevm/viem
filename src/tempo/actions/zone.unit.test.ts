import { once } from 'node:events'
import * as Http from 'node:http'
import { AbiFunction, Hex, PublicKey, Secp256k1 } from 'ox'
import { ZoneRpcAuthentication } from 'ox/tempo'
import {
  type Address,
  createClient,
  decodeFunctionData,
  encodeAbiParameters,
  getAddress,
  http,
  zeroHash,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { tempoModerato } from 'viem/chains'
import { Abis, Actions, Addresses, Store, tempoActions, Zone } from 'viem/tempo'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { multicall3Abi } from '../../constants/abis.js'

const sender = '0x0000000000000000000000000000000000000001'
const recipient: Address = '0x0000000000000000000000000000000000000002'
const prepared = {
  amount: 1n,
  chainId: tempoModerato.id,
  encrypted: {
    ciphertext: `0x${'11'.repeat(64)}`,
    ephemeralPubkeyX: zeroHash,
    ephemeralPubkeyYParity: 2,
    nonce: `0x${'22'.repeat(12)}`,
    tag: `0x${'33'.repeat(16)}`,
  },
  keyIndex: 0n,
  portalAddress: Addresses.zonePortal(1),
  sender,
  tempoRefundRecipient: sender,
  token: Addresses.pathUsd,
  zoneId: 1,
} as const satisfies Actions.zone.PreparedEncryptedDeposit

const client = createClient({
  account: sender,
  chain: tempoModerato,
  transport: http('http://127.0.0.1:1', { retryCount: 0 }),
})

type DepositClient = typeof client
type DepositAccount = typeof client.account
type AsyncDeposit = (
  client: DepositClient,
  parameters: Actions.zone.encryptedDeposit.Parameters<
    typeof tempoModerato,
    DepositAccount
  >,
) => Promise<Actions.zone.encryptedDeposit.ReturnValue>
type SyncDeposit = (
  client: DepositClient,
  parameters: Actions.zone.encryptedDepositSync.Parameters<
    typeof tempoModerato,
    DepositAccount
  >,
) => Promise<Actions.zone.encryptedDepositSync.ReturnValue>
const deposits: readonly (AsyncDeposit | SyncDeposit)[] = [
  Actions.zone.encryptedDeposit,
  Actions.zone.encryptedDepositSync,
]

test('exposes one deposit pair on the action and client namespaces', () => {
  const decorated = client.extend(tempoActions())

  expect(Actions.zone).not.toHaveProperty('deposit')
  expect(Actions.zone).not.toHaveProperty('depositSync')
  expect(Object.keys(decorated.zone)).toMatchInlineSnapshot(`
    [
      "encryptedDeposit",
      "encryptedDepositSync",
      "getAuthorizationTokenInfo",
      "getEncryptionKey",
      "getPortalInfo",
      "getWithdrawalFee",
      "getZoneInfo",
      "requestWithdrawal",
      "requestWithdrawalSync",
      "requestVerifiableWithdrawal",
      "requestVerifiableWithdrawalSync",
      "signAuthorizationToken",
      "waitForTempoBlock",
    ]
  `)
})

test('encryptedDeposit.calls encodes the encrypted deposit signature', () => {
  const [approve, deposit] = Actions.zone.encryptedDeposit.calls(prepared)
  if (!approve || !deposit) throw new Error('Missing deposit calls.')
  const decoded = decodeFunctionData({
    abi: Abis.zonePortal,
    data: deposit.data,
  })

  expect(decoded).toMatchObject({
    functionName: 'depositEncrypted',
    args: [
      getAddress(prepared.token),
      prepared.amount,
      prepared.keyIndex,
      prepared.encrypted,
      sender,
    ],
  })
  expect(approve.args).toMatchInlineSnapshot(`
    [
      "0x5ad0000000000000000000000000000000000001",
      1n,
    ]
  `)
  expect(deposit.data.slice(0, 10)).toMatchInlineSnapshot('"0xb01f22e4"')
})

describe('prepared deposits', () => {
  test.each(deposits)(
    'rejects a different sender before broadcasting',
    async (action) => {
      await expect(
        action(client, { ...prepared, sender: recipient }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Prepared encrypted deposit sender does not match transaction account.]`,
      )
    },
  )

  test.each(deposits)(
    'rejects a different chain before broadcasting',
    async (action) => {
      await expect(
        action(client, { ...prepared, chainId: 1 }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: Prepared encrypted deposit chain ID does not match client chain.]`,
      )
    },
  )
})

const transactionHash = `0x${'aa'.repeat(32)}` as const

const privateKey = `0x${'01'.repeat(32)}` as const
const publicKey = PublicKey.compress(Secp256k1.getPublicKey({ privateKey }))

const server = Http.createServer(async (req, res) => {
  let body = ''
  for await (const chunk of req) body += chunk
  const request = JSON.parse(body)
  const info = {
    chainId: '0x54e53c33',
    isAccessEnforced: true,
    isGatewayOpen: false,
    sequencers: [sender, recipient],
    tempoBlockNumber: '0x100000000',
    zoneId: '0x3',
    zoneTokens: [Addresses.pathUsd],
  }
  const result = (() => {
    if (request.method === 'zone_getZoneInfo') {
      if (req.url === '/missing-block') {
        const { tempoBlockNumber: _, ...rest } = info
        return rest
      }
      if (req.url === '/single-sequencer') {
        const { sequencers: _, ...rest } = info
        return { ...rest, sequencer: sender }
      }
      return info
    }
    if (request.method === 'eth_chainId')
      return Hex.fromNumber(tempoModerato.id)
    if (request.method === 'eth_blockNumber') return '0x1'
    if (request.method === 'eth_sendTransaction') {
      const transaction = request.params[0]
      const call = transaction.calls[1]
      const decoded = decodeFunctionData({
        abi: Abis.zonePortal,
        data: call.data,
      })
      const from = req.url === '/override' ? recipient : sender
      if (
        transaction.from.toLowerCase() !== from ||
        call.to.toLowerCase() !== prepared.portalAddress.toLowerCase()
      )
        return undefined
      if (decoded.args?.[4] !== from) return undefined
      if (decoded.functionName !== 'depositEncrypted') return undefined
      return transactionHash
    }
    if (request.method === 'eth_getTransactionReceipt')
      return {
        blockHash: zeroHash,
        blockNumber: '0x1',
        contractAddress: null,
        cumulativeGasUsed: '0x1',
        effectiveGasPrice: '0x1',
        from: sender,
        gasUsed: '0x1',
        logs: [],
        logsBloom: `0x${'00'.repeat(256)}`,
        status: req.url === '/reverted' ? '0x0' : '0x1',
        to: prepared.portalAddress,
        transactionHash,
        transactionIndex: '0x0',
        type: '0x76',
      }
    if (request.method === 'eth_call')
      return AbiFunction.encodeResult(
        AbiFunction.fromAbi(multicall3Abi, 'aggregate3'),
        [
          {
            success: true,
            returnData: encodeAbiParameters([{ type: 'uint256' }], [1n]),
          },
          {
            success: true,
            returnData: encodeAbiParameters(
              [{ type: 'bytes32' }, { type: 'uint8' }, { type: 'address' }],
              [
                Hex.fromNumber(publicKey.x, { size: 32 }),
                publicKey.prefix,
                sender,
              ],
            ),
          },
        ],
      )
    return undefined
  })()
  res.setHeader('Content-Type', 'application/json')
  res.end(
    JSON.stringify({
      id: request.id,
      jsonrpc: '2.0',
      ...(result === undefined
        ? { error: { code: -32601, message: 'Method not found' } }
        : { result }),
    }),
  )
})
let url: string
beforeAll(async () => {
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string')
    throw new Error('Missing server address.')
  url = `http://127.0.0.1:${address.port}`
})
afterAll(async () => {
  server.close()
  await once(server, 'close')
})

describe('getZoneInfo', () => {
  test('normalizes the current RPC contract', async () => {
    const client = createClient({ transport: http(url) })
    const info = await Actions.zone.getZoneInfo(client)

    expect(info).toMatchInlineSnapshot(`
      {
        "chainId": 1424309299,
        "isAccessEnforced": true,
        "isGatewayOpen": false,
        "sequencers": [
          "0x0000000000000000000000000000000000000001",
          "0x0000000000000000000000000000000000000002",
        ],
        "tempoBlockNumber": 4294967296n,
        "zoneId": 3,
        "zoneTokens": [
          "0x20c0000000000000000000000000000000000000",
        ],
      }
    `)
    await expect(
      Actions.zone.waitForTempoBlock(client, {
        tempoBlockNumber: 4_294_967_296n,
      }),
    ).resolves.toEqual(info)
  })

  test('preserves single-sequencer responses with an imported block number', async () => {
    const client = createClient({ transport: http(`${url}/single-sequencer`) })
    const info = await Actions.zone.getZoneInfo(client)

    expect(info.sequencers).toMatchInlineSnapshot(`
      [
        "0x0000000000000000000000000000000000000001",
      ]
    `)
  })

  test('requires the imported block number without a deposit-status RPC', async () => {
    const client = createClient({
      transport: http(`${url}/missing-block`, { retryCount: 0 }),
    })

    await expect(
      Actions.zone.getZoneInfo(client),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Zone RPC must return \`tempoBlockNumber\` from \`zone_getZoneInfo\`.]`,
    )
  })
})

test('encrypted recipient preparation matches upstream ECIES decryption', async () => {
  const client = createClient({
    chain: tempoModerato,
    account: sender,
    transport: http(url),
  })
  const result = await Actions.zone.encryptedDeposit.prepare(client, {
    amount: 1n,
    portalAddress: prepared.portalAddress,
    recipient,
    tempoRefundRecipient: sender,
    token: Addresses.pathUsd,
    zoneId: 1,
  })
  const { encrypted, keyIndex, portalAddress } = result
  const prefix = encrypted.ephemeralPubkeyYParity
  if (prefix !== 2 && prefix !== 3)
    throw new Error('Invalid compressed key prefix.')
  const sharedSecret = Secp256k1.getSharedSecret({
    privateKey,
    publicKey: PublicKey.from({
      x: Hex.toBigInt(encrypted.ephemeralPubkeyX),
      prefix,
    }),
    as: 'Bytes',
  })
  const hkdfKey = await crypto.subtle.importKey(
    'raw',
    sharedSecret.slice(1),
    'HKDF',
    false,
    ['deriveKey'],
  )
  const key = await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new TextEncoder().encode('ecies-aes-key'),
      info: Hex.toBytes(
        Hex.concat(
          portalAddress,
          Hex.fromNumber(keyIndex, { size: 32 }),
          encrypted.ephemeralPubkeyX,
          sender,
        ),
      ) as BufferSource,
    },
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  )
  const plaintext = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: Hex.toBytes(encrypted.nonce) as BufferSource,
      tagLength: 128,
    },
    key,
    Hex.toBytes(
      Hex.concat(encrypted.ciphertext, encrypted.tag),
    ) as BufferSource,
  )

  expect(Hex.fromBytes(new Uint8Array(plaintext))).toEqual(
    Hex.concat(recipient, zeroHash, `0x${'00'.repeat(12)}`),
  )
  expect(result.sender).toMatchInlineSnapshot(
    '"0x0000000000000000000000000000000000000001"',
  )
})

test.each([
  [Zone.internal, 1],
  [Zone.internalTestnet, 3],
  [Zone.a, 6],
  [Zone.b, 7],
] as const)(
  'derives the authorization scope for $0.name',
  async (chain, zoneId) => {
    const client = createClient({
      account: privateKeyToAccount(privateKey),
      chain,
      transport: http(url),
    })
    const { token } = await Actions.zone.signAuthorizationToken(client, {
      issuedAt: 1,
      expiresAt: 2,
      store: Store.memory(),
    })
    const authentication = ZoneRpcAuthentication.deserialize(token)

    expect(authentication.zoneId).toEqual(zoneId)
    expect(authentication.chainId).toEqual(chain.id)
  },
)

test('encrypts ordinary parameters and defaults recipients to the account', async () => {
  const client = createClient({
    account: sender,
    chain: tempoModerato,
    transport: http(url),
  })
  const hash = await Actions.zone.encryptedDeposit(client, {
    amount: 1n,
    token: Addresses.pathUsd,
    zoneId: 1,
  })

  expect(hash).toEqual(transactionHash)
})

test('encrypts ordinary parameters and returns a confirmed receipt', async () => {
  const client = createClient({
    account: sender,
    chain: tempoModerato,
    transport: http(url),
  })
  const result = await Actions.zone.encryptedDepositSync(client, {
    amount: 1n,
    token: Addresses.pathUsd,
    zoneId: 1,
    timeout: 1_000,
    pollingInterval: 10,
  })

  expect(result.receipt.status).toMatchInlineSnapshot('"success"')
  expect(result.receipt.transactionHash).toEqual(transactionHash)
})

test.each([false, true] as const)(
  'preserves Sync revert handling for prepared=%s',
  async (usePrepared) => {
    const client = createClient({
      account: sender,
      chain: tempoModerato,
      transport: http(`${url}/reverted`),
    })
    const parameters = {
      ...(usePrepared
        ? prepared
        : ({ amount: 1n, token: Addresses.pathUsd, zoneId: 1 } as const)),
      pollingInterval: 10,
      timeout: 1_000,
    }

    await expect(
      Actions.zone.encryptedDepositSync(client, parameters),
    ).rejects.toThrow('reverted')
    await expect(
      Actions.zone.encryptedDepositSync(client, {
        ...parameters,
        throwOnReceiptRevert: true,
      }),
    ).rejects.toThrow('reverted')
    const { receipt } = await Actions.zone.encryptedDepositSync(client, {
      ...parameters,
      throwOnReceiptRevert: false,
    })

    expect(receipt.status).toMatchInlineSnapshot('"reverted"')
  },
)

test.each(deposits)(
  'uses an explicit matching account for a prepared deposit',
  async (action) => {
    const client = createClient({
      account: sender,
      chain: tempoModerato,
      transport: http(`${url}/override`),
    })
    const result = await action(client, {
      ...prepared,
      account: recipient,
      sender: recipient,
      tempoRefundRecipient: recipient,
    })

    expect(
      typeof result === 'string' ? result : result.receipt.transactionHash,
    ).toEqual(transactionHash)
  },
)

test.each(['0x', `0x${'11'.repeat(33)}`] as const)(
  'rejects a memo with a non-protocol length',
  async (memo) => {
    const client = createClient({
      chain: tempoModerato,
      account: sender,
      transport: http(url),
    })

    await expect(
      Actions.zone.encryptedDeposit.prepareRecipient(client, {
        memo,
        recipient,
        zoneId: 1,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Deposit memo must be 32 bytes.]`,
    )
  },
)

test('binds deposit preparation helpers on the client', async () => {
  const client = createClient({
    account: sender,
    chain: tempoModerato,
    transport: http(url),
  }).extend(tempoActions())
  const parameters = {
    amount: 1n,
    recipient,
    sender,
    tempoRefundRecipient: sender,
    token: Addresses.pathUsd,
    zoneId: 1,
  } as const satisfies Actions.zone.encryptedDeposit.prepare.Args
  const prepared = await client.zone.encryptedDeposit.prepare(parameters)
  const preparedRecipient =
    await client.zone.encryptedDeposit.prepareRecipient(parameters)
  const hash = await client.zone.encryptedDeposit(prepared)
  const { receipt } = await client.zone.encryptedDepositSync({
    ...prepared,
    pollingInterval: 10,
    timeout: 1_000,
  })

  expect(prepared.sender).toEqual(sender)
  expect(preparedRecipient.sender).toEqual(sender)
  expect(preparedRecipient.encrypted.ciphertext).toHaveLength(130)
  expect(hash).toEqual(transactionHash)
  expect(receipt.transactionHash).toEqual(transactionHash)
})
