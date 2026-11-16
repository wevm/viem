import {
  custom,
  decodeFunctionData,
  encodeErrorResult,
  encodeFunctionResult,
  parseUnits,
  toHex,
  zeroAddress,
  zeroHash,
} from 'viem'
import { Abis } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import { accounts, chain, getClient } from '~test/tempo/config.js'
import * as Account from '../Account.js'
import * as Addresses from '../Addresses.js'
import * as actions from './index.js'

const payer = accounts[0]
const payee = accounts[1]
const token = '0x20c0000000000000000000000000000000000001'

const configurable = Account.fromConfig({
  address: 'infer',
  owners: [accounts[17], accounts[18]],
  salt: toHex(0x116600, { size: 32 }),
  threshold: 2,
})

const commitment = `0x${'ab'.repeat(32)}` as const

type Request = { method: string; params?: any }

/** Client that answers the commitment read and records every request. */
function getMockClient(
  parameters: {
    commitment?: Hex | undefined
    onSend?: (() => unknown) | undefined
  } = {},
) {
  const requests: Request[] = []
  const client = getClient({
    account: payer.address,
    transport: custom({
      async request(request: Request) {
        requests.push(request)
        if (request.method === 'eth_chainId') return toHex(chain.id)
        if (request.method === 'eth_call') {
          // A chain without the precompile answers no data.
          if (parameters.commitment === undefined) return '0x'
          return encodeFunctionResult({
            abi: Abis.configurableAccount,
            functionName: 'getConfigCommitment',
            result: parameters.commitment,
          })
        }
        if (request.method === 'eth_sendTransaction')
          return parameters.onSend?.() ?? `0x${'01'.repeat(32)}`
        throw new Error(`Unexpected request: ${request.method}`)
      },
    }),
  })
  return { client, requests }
}

type Hex = `0x${string}`

/** Decodes the `open` arguments of the recorded transaction. */
function getOpenArgs(requests: readonly Request[]) {
  const request = requests.find(
    (request) => request.method === 'eth_sendTransaction',
  )!
  const { args, functionName } = decodeFunctionData({
    abi: Abis.tip20ChannelReserve,
    data: request.params[0].data,
  })
  expect(functionName).toBe('open')
  const [, , , , salt, authorizedSigner] = args as readonly unknown[]
  return {
    authorizedSigner: authorizedSigner as Hex,
    salt: salt as Hex,
    to: request.params[0].to as Hex,
  }
}

function getReads(requests: readonly Request[]) {
  return requests.filter((request) => request.method === 'eth_call')
}

function revert(errorName: string, args: readonly unknown[]) {
  return () => {
    throw {
      code: 3,
      message: 'execution reverted',
      data: encodeErrorResult({
        abi: Abis.tip20ChannelReserve,
        errorName: errorName as never,
        args: args as never,
      }),
    }
  }
}

describe('getOpenSalt', () => {
  test('behavior: nonzero commitment', async () => {
    const { client, requests } = getMockClient({ commitment })
    await expect(
      actions.channel.getOpenSalt(client, { signer: configurable.address }),
    ).resolves.toBe(commitment)
    const [read] = getReads(requests)
    expect(read!.params[0].to.toLowerCase()).toBe(
      Addresses.configurableAccount.toLowerCase(),
    )
    expect(
      decodeFunctionData({
        abi: Abis.configurableAccount,
        data: read!.params[0].data,
      }).args,
    ).toEqual([configurable.address])
  })

  test('behavior: account signer', async () => {
    const { client } = getMockClient({ commitment })
    await expect(
      actions.channel.getOpenSalt(client, { signer: configurable }),
    ).resolves.toBe(commitment)
  })

  test('behavior: zero commitment', async () => {
    const { client } = getMockClient({ commitment: zeroHash })
    const salt = await actions.channel.getOpenSalt(client, {
      signer: payer.address,
    })
    expect(salt).toMatch(/^0x[0-9a-f]{64}$/)
    expect(salt).not.toBe(zeroHash)
  })

  test('behavior: chain without the precompile', async () => {
    const { client } = getMockClient()
    const salt = await actions.channel.getOpenSalt(client, {
      signer: payer.address,
    })
    expect(salt).toMatch(/^0x[0-9a-f]{64}$/)
    expect(salt).not.toBe(zeroHash)
  })
})

describe('open', () => {
  const args = {
    deposit: parseUnits('1', 6),
    payee: payee.address,
    token,
  } as const

  test('default: random salt without a configurable signer', async () => {
    const { client, requests } = getMockClient({ commitment })
    await actions.channel.open(client, args)
    expect(getReads(requests)).toHaveLength(0)
    const { authorizedSigner, salt, to } = getOpenArgs(requests)
    expect(to.toLowerCase()).toBe(Addresses.tip20ChannelReserve.toLowerCase())
    expect(authorizedSigner).toBe(zeroAddress)
    expect(salt).toMatch(/^0x[0-9a-f]{64}$/)
    expect(salt).not.toBe(commitment)
  })

  test('behavior: address signer keeps a random salt', async () => {
    const { client, requests } = getMockClient({ commitment })
    await actions.channel.open(client, {
      ...args,
      authorizedSigner: configurable.address,
    })
    expect(getReads(requests)).toHaveLength(0)
    const { authorizedSigner, salt } = getOpenArgs(requests)
    expect(authorizedSigner).toBe(configurable.address)
    expect(salt).not.toBe(commitment)
  })

  test('behavior: configurable signer defaults salt to its commitment', async () => {
    const { client, requests } = getMockClient({ commitment })
    await actions.channel.open(client, {
      ...args,
      authorizedSigner: configurable,
    })
    expect(getReads(requests)).toHaveLength(1)
    const { authorizedSigner, salt } = getOpenArgs(requests)
    expect(authorizedSigner).toBe(configurable.address)
    expect(salt).toBe(commitment)
  })

  test('behavior: configurable signer without a commitment', async () => {
    const { client, requests } = getMockClient({ commitment: zeroHash })
    await actions.channel.open(client, {
      ...args,
      authorizedSigner: configurable,
    })
    const { salt } = getOpenArgs(requests)
    expect(salt).toMatch(/^0x[0-9a-f]{64}$/)
    expect(salt).not.toBe(zeroHash)
  })

  test('behavior: zero authorized signer means the payer signs', async () => {
    const { client, requests } = getMockClient({ commitment })
    await actions.channel.open(client, {
      ...args,
      authorizedSigner: zeroAddress,
    })
    expect(getReads(requests)).toHaveLength(0)
    expect(getOpenArgs(requests).authorizedSigner).toBe(zeroAddress)
  })

  test('behavior: explicit salt wins', async () => {
    const salt = `0x${'cd'.repeat(32)}` as const
    const { client, requests } = getMockClient({ commitment })
    await actions.channel.open(client, {
      ...args,
      authorizedSigner: configurable,
      salt,
    })
    expect(getReads(requests)).toHaveLength(0)
    expect(getOpenArgs(requests).salt).toBe(salt)
  })

  test('behavior: call makes no request', () => {
    const [, , , , salt] = actions.channel.open.call(args).args
    expect(salt).toMatch(/^0x[0-9a-f]{64}$/)
    const [, , , , explicit] = actions.channel.open.call({
      ...args,
      salt: commitment,
    }).args
    expect(explicit).toBe(commitment)
  })

  test('error: salt not signer commitment', async () => {
    const { client } = getMockClient({
      onSend: revert('SaltNotSignerCommitment', [
        configurable.address,
        commitment,
      ]),
    })
    const error = await actions.channel
      .open(client, { ...args, authorizedSigner: configurable, salt: zeroHash })
      .catch((error) => error)
    expect(error).toBeInstanceOf(
      actions.channel.ChannelSaltNotSignerCommitmentError,
    )
    expect({
      commitment: error.commitment,
      hints: error.hints,
      name: error.name,
      shortMessage: error.shortMessage,
      signer: error.signer,
    }).toMatchInlineSnapshot(`
      {
        "commitment": "0xabababababababababababababababababababababababababababababababab",
        "hints": [
          "Open the channel with the signer's configuration commitment as its salt, or omit the salt to default to it.",
        ],
        "name": "ChannelSaltNotSignerCommitmentError",
        "shortMessage": "The channel salt must be the configuration commitment 0xabababababababababababababababababababababababababababababababab of signer 0xA0B29fcc33c0270fAE99db75fACB8711cA6c10E4.",
        "signer": "0xA0B29fcc33c0270fAE99db75fACB8711cA6c10E4",
      }
    `)
  })
})

describe('topUp', () => {
  test('error: signer config changed', async () => {
    const { client } = getMockClient({
      onSend: revert('SignerConfigChanged', [configurable.address]),
    })
    const error = await actions.channel
      .topUp(client, {
        additionalDeposit: 1n,
        channel: {
          authorizedSigner: configurable.address,
          expiringNonceHash: zeroHash,
          payee: payee.address,
          payer: payer.address,
          salt: commitment,
          token,
        },
      })
      .catch((error) => error)
    expect(error).toBeInstanceOf(
      actions.channel.ChannelSignerConfigChangedError,
    )
    expect({
      hints: error.hints,
      name: error.name,
      shortMessage: error.shortMessage,
      signer: error.signer,
    }).toMatchInlineSnapshot(`
      {
        "hints": [
          "The signer's owners changed after the channel opened. Close the channel and open a new one to add funds.",
        ],
        "name": "ChannelSignerConfigChangedError",
        "shortMessage": "The configuration of signer 0xA0B29fcc33c0270fAE99db75fACB8711cA6c10E4 changed since the channel opened.",
        "signer": "0xA0B29fcc33c0270fAE99db75fACB8711cA6c10E4",
      }
    `)
  })
})
