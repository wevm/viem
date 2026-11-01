import { Instance } from 'prool'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { kzg } from '~test/kzg.js'
import { deploy } from '~test/utils.js'
import { Delegation } from '../../../contracts/generated.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { foundry } from '../../chains/index.js'
import { createTestClient } from '../../clients/createTestClient.js'
import { maxUint256 } from '../../constants/number.js'
import { createPublicClient, createWalletClient, http } from '../../index.js'
import { toBlobs } from '../../utils/blob/toBlobs.js'
import { toHex } from '../../utils/encoding/toHex.js'
import { encodeFunctionData } from '../../utils/index.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { parseGwei } from '../../utils/unit/parseGwei.js'
import { mine } from '../test/mine.js'
import { reset } from '../test/reset.js'
import { setCode } from '../test/setCode.js'
import * as prepareTransactionRequestModule from '../wallet/prepareTransactionRequest.js'
import { sendTransaction } from '../wallet/sendTransaction.js'
import { signAuthorization } from '../wallet/signAuthorization.js'
import { estimateGas } from './estimateGas.js'
import * as getBlock from './getBlock.js'
import { getBlockNumber } from './getBlockNumber.js'
import { getCode } from './getCode.js'
import { getTransactionReceipt } from './getTransactionReceipt.js'

const wethContractAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

const client = anvilMainnet.getClient()

test('estimates gas', async () => {
  expect(
    await estimateGas(client, {
      to: accounts[1].address,
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('falls back to wallet client account', async () => {
  expect(
    await estimateGas(client, {
      account: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: account', async () => {
  expect(
    await estimateGas(client, {
      account: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: authorizationList', async () => {
  const eoa = privateKeyToAccount(accounts[1].privateKey)

  const { contractAddress } = await deploy(client, {
    abi: Delegation.abi,
    bytecode: Delegation.bytecode.object,
  })

  const authorization = await signAuthorization(client, {
    account: eoa,
    contractAddress: contractAddress!,
  })

  expect(
    await estimateGas(client, {
      account: accounts[0].address,
      authorizationList: [authorization],
      data: encodeFunctionData({
        abi: Delegation.abi,
        functionName: 'execute',
        args: [
          [
            {
              data: '0x',
              to: '0x0000000000000000000000000000000000000000',
              value: 1n,
            },
          ],
        ],
      }),
    }),
  ).toBeDefined()
})

test('args: blockNumber', async () => {
  await reset(client, {
    blockNumber: anvilMainnet.forkBlockNumber,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })
  expect(
    await estimateGas(client, {
      blockNumber: anvilMainnet.forkBlockNumber,
      account: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: data', async () => {
  expect(
    await estimateGas(client, {
      data: '0x00000000000000000000000000000000000000000000000004fefa17b7240000',
      account: accounts[0].address,
      to: wethContractAddress,
    }),
  ).toMatchInlineSnapshot('26040n')
})

test('args: gasPrice', async () => {
  expect(
    await estimateGas(client, {
      account: accounts[0].address,
      to: accounts[1].address,
      gasPrice: parseGwei('33'),
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: nonce', async () => {
  expect(
    await estimateGas(client, {
      account: accounts[0].address,
      to: accounts[1].address,
      nonce: 69,
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: maxFeePerGas', async () => {
  expect(
    await estimateGas(client, {
      account: accounts[0].address,
      to: accounts[1].address,
      maxFeePerGas: parseGwei('33'),
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: maxPriorityFeePerGas', async () => {
  expect(
    await estimateGas(client, {
      account: accounts[0].address,
      to: accounts[1].address,
      maxPriorityFeePerGas: parseGwei('2'),
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: gas', async () => {
  expect(
    await estimateGas(client, {
      account: accounts[0].address,
      to: accounts[1].address,
      gas: parseGwei('2'),
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: override', async () => {
  const transferData =
    '0xa9059cbb00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000de0b6b3a7640000'
  const balanceSlot =
    '0xc651ee22c6951bb8b5bd29e8210fb394645a94315fe10eff2cc73de1aa75c137'

  expect(
    await estimateGas(client, {
      data: transferData,
      account: accounts[0].address,
      to: wethContractAddress,
      stateOverride: [
        {
          address: wethContractAddress,
          stateDiff: [
            {
              slot: balanceSlot,
              value: toHex(maxUint256),
            },
          ],
        },
      ],
    }),
  ).toMatchInlineSnapshot('51594n')
})

test('args: prepare', async () => {
  const prepareTransactionRequestSpy = vi.spyOn(
    prepareTransactionRequestModule,
    'prepareTransactionRequest',
  )

  expect(
    await estimateGas(client, {
      account: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
      prepare: false,
    }),
  ).toMatchInlineSnapshot('21000n')

  expect(prepareTransactionRequestSpy).not.toHaveBeenCalled()

  vi.restoreAllMocks()
})

test('error: cannot infer `to` from `authorizationList`', async () => {
  await expect(() =>
    estimateGas(client, {
      account: accounts[0].address,
      authorizationList: [
        {
          address: '0x0000000000000000000000000000000000000000',
          chainId: 1,
          nonce: 0,
        },
      ],
      data: '0xdeadbeef',
    }),
  ).rejects.toMatchInlineSnapshot(`
    [EstimateGasExecutionError: \`to\` is required. Could not infer from \`authorizationList\`

    Estimate Gas Arguments:
      from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      data:  0xdeadbeef

    Version: viem@x.y.z]
  `)
})

describe('local account', () => {
  test('default', async () => {
    expect(
      await estimateGas(client, {
        account: privateKeyToAccount(accounts[0].privateKey),
        to: accounts[1].address,
        value: parseEther('1'),
      }),
    ).toMatchInlineSnapshot('21000n')
  })

  test('args: blobs', async () => {
    expect(
      await estimateGas(client, {
        account: privateKeyToAccount(accounts[0].privateKey),
        blobs: toBlobs({ data: '0x1234' }),
        kzg,
        to: accounts[1].address,
        maxFeePerBlobGas: parseGwei('20'),
      }),
    ).toMatchInlineSnapshot('21001n')
  })

  test('args: data', async () => {
    expect(
      await estimateGas(client, {
        data: '0x00000000000000000000000000000000000000000000000004fefa17b7240000',
        account: privateKeyToAccount(accounts[0].privateKey),
        to: wethContractAddress,
      }),
    ).toMatchInlineSnapshot('26040n')
  })

  test('args: gasPrice (on chain w/ block.baseFeePerGas)', async () => {
    expect(
      await estimateGas(client, {
        account: privateKeyToAccount(accounts[0].privateKey),
        to: accounts[1].address,
        gasPrice: parseGwei('33'),
        value: parseEther('1'),
      }),
    ).toMatchInlineSnapshot('21000n')
  })

  test('args: gasPrice (on legacy)', async () => {
    vi.spyOn(getBlock, 'getBlock').mockResolvedValueOnce({
      baseFeePerGas: undefined,
    } as any)

    expect(
      await estimateGas(client, {
        account: privateKeyToAccount(accounts[0].privateKey),
        to: accounts[1].address,
        gasPrice: parseGwei('33'),
        value: parseEther('1'),
      }),
    ).toMatchInlineSnapshot('21000n')

    vi.restoreAllMocks()
  })

  test('args: maxFeePerGas (on eip1559)', async () => {
    expect(
      await estimateGas(client, {
        account: privateKeyToAccount(accounts[0].privateKey),
        to: accounts[1].address,
        maxFeePerGas: parseGwei('33'),
        value: parseEther('1'),
      }),
    ).toMatchInlineSnapshot('21000n')
  })

  test('args: gas', async () => {
    expect(
      await estimateGas(client, {
        account: privateKeyToAccount(accounts[0].privateKey),
        to: accounts[1].address,
        gas: parseGwei('2'),
        value: parseEther('1'),
      }),
    ).toMatchInlineSnapshot('21000n')
  })
})

describe('errors', () => {
  test('fee cap too high', async () => {
    await expect(() =>
      estimateGas(client, {
        account: accounts[0].address,
        to: accounts[1].address,
        value: parseEther('1'),
        maxFeePerGas: maxUint256 + 1n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [EstimateGasExecutionError: The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

      Estimate Gas Arguments:
        from:          0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:            0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:         1 ETH
        maxFeePerGas:  115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei

      Version: viem@x.y.z]
    `)
  })

  test('tip higher than fee cap', async () => {
    await expect(() =>
      estimateGas(client, {
        account: accounts[0].address,
        to: accounts[1].address,
        value: parseEther('1'),
        maxPriorityFeePerGas: parseGwei('11'),
        maxFeePerGas: parseGwei('10'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [EstimateGasExecutionError: The provided tip (\`maxPriorityFeePerGas\` = 11 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 10 gwei).

      Estimate Gas Arguments:
        from:                  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:                    0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:                 1 ETH
        maxFeePerGas:          10 gwei
        maxPriorityFeePerGas:  11 gwei

      Version: viem@x.y.z]
    `,
    )
  })
})

describe('local account block and state context', () => {
  const url = 'http://127.0.0.1:18547'
  const instance = Instance.anvil({ host: '127.0.0.1', port: 18547 })
  const local = privateKeyToAccount(accounts[0].privateKey)
  const target = '0x1000000000000000000000000000000000000001' as const
  const sstore = '0x600160005500' as const
  const creation = '0x6006600c60003960066000f3600160005500' as const
  const client = createTestClient({
    chain: foundry,
    mode: 'anvil',
    transport: http(url),
  })

  beforeAll(async () => {
    await instance.start()
  })

  afterAll(async () => {
    await instance.stop()
  })

  test('state override', async () => {
    const stateOverride = [{ address: target, code: sstore }]

    const baseline = await estimateGas(client, {
      account: local.address,
      to: target,
    })
    const addressGas = await estimateGas(client, {
      account: local.address,
      to: target,
      stateOverride,
    })

    expect(addressGas).not.toBe(baseline)
    expect(
      await estimateGas(client, {
        account: local,
        to: target,
        stateOverride,
      }),
    ).toBe(addressGas)
    expect(
      await estimateGas(client, {
        account: local,
        to: target,
        stateOverride,
        prepare: false,
      }),
    ).toBe(addressGas)
    expect(
      await estimateGas(client, {
        account: local,
        to: target,
        stateOverride,
        prepare: ['nonce'],
      }),
    ).toBe(addressGas)
    expect(
      await estimateGas(client, {
        account: local,
        to: target,
        blockTag: 'latest',
        stateOverride,
      }),
    ).toBe(addressGas)
    expect(
      await estimateGas(
        createWalletClient({
          account: local,
          chain: foundry,
          transport: http(url),
        }),
        {
          to: target,
          stateOverride,
        },
      ),
    ).toBe(addressGas)
  })

  test('blockNumber zero', async () => {
    const stateOverride = [{ address: target, code: sstore }]

    const baseline = await estimateGas(client, {
      account: local.address,
      to: target,
      blockNumber: 0n,
    })
    const addressGas = await estimateGas(client, {
      account: local.address,
      to: target,
      blockNumber: 0n,
      stateOverride,
    })

    expect(addressGas).not.toBe(baseline)
    expect(
      await estimateGas(client, {
        account: local,
        to: target,
        blockNumber: 0n,
        stateOverride,
      }),
    ).toBe(addressGas)
  })

  test('historical block', async () => {
    await mine(client, { blocks: 1 })
    const historical = await getBlockNumber(client)

    const hash = await sendTransaction(client, {
      account: local,
      data: creation,
    })
    await mine(client, { blocks: 1 })
    const { contractAddress } = await getTransactionReceipt(client, { hash })
    if (!contractAddress) throw new Error('missing contract')

    expect(
      await getCode(client, {
        address: contractAddress,
        blockNumber: historical,
      }),
    ).toBeUndefined()
    expect(await getCode(client, { address: contractAddress })).toBe(sstore)

    const atHistorical = await estimateGas(client, {
      account: local.address,
      to: contractAddress,
      blockNumber: historical,
    })
    const atLatest = await estimateGas(client, {
      account: local.address,
      to: contractAddress,
    })
    const atEarliest = await estimateGas(client, {
      account: local.address,
      to: contractAddress,
      blockTag: 'earliest',
    })

    expect(atHistorical).not.toBe(atLatest)
    expect(
      await estimateGas(client, {
        account: local,
        to: contractAddress,
        blockNumber: historical,
      }),
    ).toBe(atHistorical)
    expect(
      await estimateGas(client, {
        account: local,
        to: contractAddress,
        blockNumber: historical,
        prepare: false,
      }),
    ).toBe(atHistorical)
    expect(
      await estimateGas(client, {
        account: local,
        to: contractAddress,
        blockTag: 'earliest',
      }),
    ).toBe(atEarliest)
  })

  test('state override replaces reverting code', async () => {
    const revertTarget = '0x2000000000000000000000000000000000000002' as const
    await setCode(client, {
      address: revertTarget,
      bytecode: '0x60006000fd',
    })
    const stateOverride = [{ address: revertTarget, code: '0x00' as const }]

    const addressGas = await estimateGas(client, {
      account: local.address,
      to: revertTarget,
      stateOverride,
    })

    expect(
      await estimateGas(client, {
        account: local,
        to: revertTarget,
        stateOverride,
      }),
    ).toBe(addressGas)
  })

  test('chain preparation hook still runs', async () => {
    let prepared = false
    const hooked = createPublicClient({
      chain: {
        ...foundry,
        async prepareTransactionRequest(request) {
          prepared = true
          return request
        },
      },
      transport: http(url),
    })
    const stateOverride = [{ address: target, code: sstore }]
    const addressGas = await estimateGas(client, {
      account: local.address,
      to: target,
      stateOverride,
    })

    expect(
      await estimateGas(hooked, {
        account: local,
        to: target,
        stateOverride,
      }),
    ).toBe(addressGas)
    expect(prepared).toBe(true)
  })

  test('blob versioned hashes with state override', async () => {
    const stateOverride = [{ address: target, code: '0x00' as const }]
    const request = {
      blobs: toBlobs({ data: '0x1234' }),
      kzg,
      maxFeePerBlobGas: parseGwei('20'),
      stateOverride,
      to: target,
    }

    expect(
      await estimateGas(client, {
        ...request,
        account: local,
      }),
    ).toBe(
      await estimateGas(client, {
        ...request,
        account: local.address,
      }),
    )
  })

  test('transfer', async () => {
    const request = {
      to: accounts[1].address,
      value: 1n,
    }

    expect(
      await estimateGas(client, {
        ...request,
        account: local,
      }),
    ).toBe(
      await estimateGas(client, {
        ...request,
        account: local.address,
      }),
    )
  })
})
