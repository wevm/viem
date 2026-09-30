import * as Address from 'ox/Address'
import * as P256 from 'ox/P256'
import * as Secp256k1 from 'ox/Secp256k1'
import {
  type Abi,
  type Address as AddressType,
  decodeFunctionData,
  encodeAbiParameters,
  erc20Abi,
  type Hex as HexType,
  http,
  parseAbi,
  parseTransaction,
  zeroAddress,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import {
  deployContract,
  estimateGas,
  getBalance,
  getTransaction,
  getTransactionCount,
  prepareTransactionRequest,
  readContract,
  sendTransaction,
  sendTransactionSync,
  signTransaction,
  waitForTransactionReceipt,
} from 'viem/actions'
import { Frame } from 'viem/frames'
import { beforeAll, describe, expect, test } from 'vitest'
import * as contracts from '~contracts/generated.js'
import { accounts, getClient } from '~test/frames/config.js'
import { rpcUrl } from '~test/frames/prool.js'
import * as FrameSponsorship from './internal/sponsorship.js'

const client = getClient({ account: accounts[0] })
const privateKey = `0x${'02'.padStart(64, '0')}` as HexType

async function deploy(
  contract: { abi: Abi; bytecode: { object: HexType } },
  args: readonly unknown[] = [],
) {
  const hash = await deployContract(client, {
    abi: contract.abi,
    bytecode: contract.bytecode.object,
    args,
    gas: 10_000_000n,
  })
  const receipt = await waitForTransactionReceipt(client, { hash })
  expect(receipt.status).toBe('success')
  return receipt.contractAddress!
}

for (const scheme of ['secp256k1', 'p256', 'arbitrary'] as const)
  describe(`fee: ${scheme}`, () => {
    let token: AddressType
    let payer: AddressType
    let verifier: AddressType
    const curve = scheme === 'p256' ? P256 : Secp256k1
    const publicKey = curve.getPublicKey({ privateKey })
    const signer = Address.fromPublicKey(publicKey)

    beforeAll(async () => {
      token = await deploy(contracts.FrameToken, [accounts[0].address])
      const pricing = await deploy(contracts.FrameFixedQuote)
      verifier = await deploy(contracts.FrameSignatureVerifier, [
        Address.fromPublicKey(Secp256k1.getPublicKey({ privateKey })),
      ])
      payer = await deploy(contracts.FeePayer, [
        (() => {
          if (scheme === 'arbitrary') return 0n
          if (scheme === 'p256') return 2n
          return 1n
        })(),
        scheme === 'arbitrary' ? zeroAddress : signer,
        scheme === 'arbitrary' ? verifier : zeroAddress,
        pricing,
      ])
      await waitForTransactionReceipt(client, {
        hash: await sendTransaction(client, { to: payer, value: 10n ** 18n }),
      })
    })

    test('prepares sponsorship through frame helpers', async () => {
      const methods: string[] = []
      const client = getClient({
        account: accounts[0],
        transport: http(rpcUrl, {
          onFetchRequest: async (request) => {
            const body = await request.clone().json()
            methods.push(body.method)
          },
        }),
      })

      const sponsor = (() => {
        if (scheme === 'arbitrary')
          return {
            scheme,
            verifier,
            sign: async (options: { hash: HexType }) => {
              const { hash } = options

              const signature = Secp256k1.sign({ payload: hash, privateKey })
              return encodeAbiParameters(
                [{ type: 'uint256' }, { type: 'uint256' }, { type: 'uint8' }],
                [signature.r, signature.s, signature.yParity],
              )
            },
          }

        if (scheme === 'p256')
          return {
            scheme,
            signer,
            publicKey,
            sign: async (options: { hash: HexType }) => {
              const { hash } = options
              return P256.sign({ payload: hash, privateKey })
            },
          }

        return privateKeyToAccount(privateKey)
      })()

      const request = {
        frames: [
          Frame.fee({ payer: sponsor, contractAddress: payer, token: token }),
          Frame.calls([{ to: accounts[1].address }]),
        ],
        maxFeePerGas: 2_000_000_000n,
        maxPriorityFeePerGas: 1n,
      }
      if (scheme === 'arbitrary') {
        await expect(
          prepareTransactionRequest(client, request),
        ).rejects.toThrow('EIP-8141 VERIFY frame failed')
        return
      }

      const prepared = await prepareTransactionRequest(client, request)
      expect(methods).toMatchInlineSnapshot(`
        [
          "eth_fillTransaction",
          "eth_call",
          "eth_fillTransaction",
        ]
      `)

      methods.length = 0
      const repeated = await prepareTransactionRequest(client, prepared)
      expect(repeated.frames).toEqual(prepared.frames)
      expect(methods).toEqual([])

      const before = await readContract(client, {
        address: token,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [payer],
      })
      const payment = decodeFunctionData({
        abi: erc20Abi,
        data: prepared.frames![2]!.data!,
      })
      if (payment.functionName !== 'transfer')
        throw new Error('Expected a reimbursement transfer.')
      const serialized = await signTransaction(client, prepared)
      const transaction = parseTransaction(serialized)
      if (transaction.type !== 'eip8141')
        throw new Error('Expected a frame transaction.')
      expect(payment.args[1] * 500_000_000n).toBeGreaterThanOrEqual(
        FrameSponsorship.getGas(transaction) * prepared.maxFeePerGas!,
      )
      expect(
        await estimateGas(client, {
          ...transaction,
          prepare: false,
        }),
      ).toBe(FrameSponsorship.getGas(transaction))

      const ethBefore = await getBalance(client, { address: payer })
      const receipt = await sendTransactionSync(client, prepared)
      expect(receipt.status).toMatchInlineSnapshot('"success"')
      expect(receipt.payer?.toLowerCase()).toBe(payer.toLowerCase())
      expect(
        await readContract(client, {
          address: token,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [payer],
        }),
      ).toBe(before + payment.args[1])
      expect(payment.args[1] * 500_000_000n).toBeGreaterThanOrEqual(
        ethBefore - (await getBalance(client, { address: payer })),
      )
      const direct = await sendTransactionSync(client, {
        ...request,
        dataSuffix: '0x1234',
      })
      expect(direct.status).toMatchInlineSnapshot('"success"')
    })
  })

describe('fee: default payer', () => {
  test('uses the sender for payment approval and reimburses the contract', async () => {
    const token = await deploy(contracts.FrameToken, [accounts[0].address])
    const pricing = await deploy(contracts.FrameFixedQuote)
    const payer = await deploy(contracts.FeePayer, [
      1n,
      accounts[0].address,
      zeroAddress,
      pricing,
    ])
    await waitForTransactionReceipt(client, {
      hash: await sendTransaction(client, { to: payer, value: 10n ** 18n }),
    })

    const methods: string[] = []
    const wallet = getClient({
      account: accounts[0],
      transport: http(rpcUrl, {
        onFetchRequest: async (request) => {
          methods.push((await request.clone().json()).method)
        },
      }),
    })
    const prepared = await prepareTransactionRequest(wallet, {
      frames: [
        Frame.fee({ contractAddress: payer, token }),
        Frame.calls([{ to: accounts[1].address }]),
      ],
    })
    expect(methods).toEqual([
      'eth_fillTransaction',
      'eth_call',
      'eth_fillTransaction',
    ])
    expect(prepared.signatures!.map((signature) => signature.signer)).toEqual([
      accounts[0].address,
      accounts[0].address,
    ])
    const reimbursement = decodeFunctionData({
      abi: erc20Abi,
      data: prepared.frames[2]!.data!,
    })
    if (reimbursement.functionName !== 'transfer')
      throw new Error('Expected a reimbursement transfer.')

    const receipt = await sendTransactionSync(wallet, prepared)
    expect(receipt.status).toBe('success')
    expect(
      await readContract(wallet, {
        address: token,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [payer],
      }),
    ).toBe(reimbursement.args[1])
  })
})

describe('fee: reimbursement', () => {
  let token: AddressType
  let payer: AddressType

  beforeAll(async () => {
    token = await deploy(contracts.FrameToken, [accounts[0].address])
    const pricing = await deploy(contracts.FrameFixedQuote)
    payer = await deploy(contracts.FeePayer, [
      1n,
      accounts[1].address,
      zeroAddress,
      pricing,
    ])
    await waitForTransactionReceipt(client, {
      hash: await sendTransaction(client, { to: payer, value: 10n ** 18n }),
    })
  })

  test('quotes reimbursement independently of call batches and data suffixes', async () => {
    const request = {
      frames: [
        Frame.fee({ payer: accounts[1], contractAddress: payer, token: token }),
        Frame.calls([{ to: accounts[1].address }, { to: accounts[1].address }]),
      ],
      dataSuffix: '0x1234' as const,
    }
    const prepared = await prepareTransactionRequest(client, request)
    const payment = decodeFunctionData({
      abi: erc20Abi,
      data: prepared.frames![2]!.data!,
    })
    if (payment.functionName !== 'transfer')
      throw new Error('Expected a reimbursement transfer.')

    const approval = decodeFunctionData({
      abi: parseAbi(['function pay(address token, uint256 amount)']),
      data: prepared.frames![1]!.data!,
    })
    expect(approval.args[0].toLowerCase()).toBe(token.toLowerCase())
    expect(approval.args[1]).toBe(payment.args[1])
    expect(payment.args[0].toLowerCase()).toBe(payer.toLowerCase())
    expect(payment.args[1]).toBeGreaterThan(0n)
    expect(prepared.frames![2]!.data!.length).toBe(138)
    expect(
      prepared.frames!.slice(2).map((frame) => {
        const { mode, flags } = frame
        return {
          mode,
          flags,
        }
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "flags": undefined,
          "mode": "sender",
        },
        {
          "flags": "atomicBatch",
          "mode": "sender",
        },
        {
          "flags": undefined,
          "mode": "sender",
        },
      ]
    `)

    const senderBefore = await readContract(client, {
      address: token,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [accounts[0].address],
    })
    const payerBefore = await readContract(client, {
      address: token,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [payer],
    })
    const receipt = await sendTransactionSync(client, prepared)

    expect(receipt.status).toMatchInlineSnapshot('"success"')
    const transaction = await getTransaction(client, {
      hash: receipt.transactionHash,
    })
    const reimbursement = decodeFunctionData({
      abi: erc20Abi,
      data: transaction.frames![2]!.data!,
    })
    if (reimbursement.functionName !== 'transfer')
      throw new Error('Expected a reimbursement transfer.')

    expect(reimbursement.args[0].toLowerCase()).toBe(payer.toLowerCase())
    expect(transaction.frames![2]!.data!.length).toBe(138)
    expect(
      decodeFunctionData({
        abi: parseAbi(['function pay(address token, uint256 amount)']),
        data: transaction.frames![1]!.data!,
      }).args[1],
    ).toBe(reimbursement.args[1])
    expect(
      transaction.frames!.slice(3).map((frame) => {
        const { data } = frame
        return data
      }),
    ).toMatchInlineSnapshot(`
        [
          "0x1234",
          "0x1234",
        ]
      `)

    expect(
      await readContract(client, {
        address: token,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [accounts[0].address],
      }),
    ).toBe(senderBefore - reimbursement.args[1])
    expect(
      await readContract(client, {
        address: token,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [payer],
      }),
    ).toBe(payerBefore + reimbursement.args[1])
  })

  test('requotes when the actual transfer needs a larger gas budget', async () => {
    const token = await deploy(contracts.FrameVariableCostToken, [
      accounts[0].address,
    ])
    const methods: string[] = []
    const client = getClient({
      account: accounts[0],
      transport: http(rpcUrl, {
        onFetchRequest: async (request) => {
          methods.push((await request.clone().json()).method)
        },
      }),
    })
    const prepared = await prepareTransactionRequest(client, {
      frames: [
        Frame.fee({ payer: accounts[1], contractAddress: payer, token: token }),
      ],
    })
    expect(methods).toMatchInlineSnapshot(`
      [
        "eth_fillTransaction",
        "eth_call",
        "eth_fillTransaction",
        "eth_call",
        "eth_fillTransaction",
      ]
    `)

    const payment = decodeFunctionData({
      abi: erc20Abi,
      data: prepared.frames![2]!.data!,
    })
    if (payment.functionName !== 'transfer')
      throw new Error('Expected a reimbursement transfer.')

    const receipt = await sendTransactionSync(client, prepared)
    expect(receipt.status).toBe('success')
    expect(
      await readContract(client, {
        address: token,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [payer],
      }),
    ).toBe(payment.args[1])
  })

  test('rejects insufficient token balances before broadcasting', async () => {
    const emptyToken = await deploy(contracts.FrameToken, [accounts[1].address])
    const nonce = await getTransactionCount(client, {
      address: accounts[0].address,
    })

    await expect(
      sendTransactionSync(client, {
        frames: [
          Frame.fee({
            payer: accounts[1],
            contractAddress: payer,
            token: emptyToken,
          }),
        ],
      }),
    ).rejects.toThrow()

    expect(
      await getTransactionCount(client, { address: accounts[0].address }),
    ).toBe(nonce)
    expect(
      await readContract(client, {
        address: emptyToken,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [payer],
      }),
    ).toBe(0n)
  })
})
