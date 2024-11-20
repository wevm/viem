import { describe, expect, test, vi } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { kzg } from '~test/src/kzg.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { maxUint256 } from '../../constants/number.js'

import { BatchCallDelegation } from '../../../contracts/generated.js'
import { deploy } from '../../../test/src/utils.js'
import { signAuthorization } from '../../experimental/index.js'
import { toBlobs } from '../../utils/blob/toBlobs.js'
import { toHex } from '../../utils/encoding/toHex.js'
import { encodeFunctionData } from '../../utils/index.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { parseGwei } from '../../utils/unit/parseGwei.js'
import { reset } from '../test/reset.js'
import { estimateGas } from './estimateGas.js'
import * as getBlock from './getBlock.js'

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
  const authority = privateKeyToAccount(accounts[1].privateKey)

  const { contractAddress } = await deploy(client, {
    abi: BatchCallDelegation.abi,
    bytecode: BatchCallDelegation.bytecode.object,
  })

  const authorization = await signAuthorization(client, {
    account: authority,
    contractAddress: contractAddress!,
  })

  expect(
    await estimateGas(client, {
      account: accounts[0].address,
      authorizationList: [authorization],
      data: encodeFunctionData({
        abi: BatchCallDelegation.abi,
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

test('error: cannot infer `to` from `authorizationList`', async () => {
  await expect(() =>
    estimateGas(client, {
      account: accounts[0].address,
      authorizationList: [
        {
          chainId: 1,
          nonce: 0,
          contractAddress: '0x0000000000000000000000000000000000000000',
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
    ).toMatchInlineSnapshot('53001n')
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

  test('args: maxFeePerGas (on legacy)', async () => {
    vi.spyOn(getBlock, 'getBlock').mockResolvedValueOnce({
      baseFeePerGas: undefined,
    } as any)

    await expect(() =>
      estimateGas(client, {
        account: privateKeyToAccount(accounts[0].privateKey),
        to: accounts[1].address,
        maxFeePerGas: parseGwei('33'),
        value: parseEther('1'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [EstimateGasExecutionError: Chain does not support EIP-1559 fees.

      Estimate Gas Arguments:
        from:          0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        to:            0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:         1 ETH
        maxFeePerGas:  33 gwei

      Version: viem@x.y.z]
    `)
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
