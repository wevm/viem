import { describe, expect, test, vi } from 'vitest'

import { accounts, forkBlockNumber, forkUrl } from '~test/src/constants.js'
import { publicClient, testClient, walletClient } from '~test/src/utils.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { parseGwei } from '../../utils/unit/parseGwei.js'
import { reset } from '../test/reset.js'

import { estimateGas } from './estimateGas.js'
import * as getBlock from './getBlock.js'

const wethContractAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

test('estimates gas', async () => {
  expect(
    await estimateGas(publicClient, {
      to: accounts[1].address,
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('falls back to wallet client account', async () => {
  expect(
    await estimateGas(walletClient, {
      account: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: account', async () => {
  expect(
    await estimateGas(publicClient, {
      account: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: blockNumber', async () => {
  await reset(testClient, {
    blockNumber: forkBlockNumber,
    jsonRpcUrl: forkUrl,
  })
  expect(
    await estimateGas(publicClient, {
      blockNumber: forkBlockNumber,
      account: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: data', async () => {
  expect(
    await estimateGas(publicClient, {
      data: '0x00000000000000000000000000000000000000000000000004fefa17b7240000',
      account: accounts[0].address,
      to: wethContractAddress,
    }),
  ).toMatchInlineSnapshot('26040n')
})

test('args: gasPrice', async () => {
  expect(
    await estimateGas(publicClient, {
      account: accounts[0].address,
      to: accounts[1].address,
      gasPrice: parseGwei('33'),
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: nonce', async () => {
  expect(
    await estimateGas(publicClient, {
      account: accounts[0].address,
      to: accounts[1].address,
      nonce: 69,
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: maxFeePerGas', async () => {
  expect(
    await estimateGas(publicClient, {
      account: accounts[0].address,
      to: accounts[1].address,
      maxFeePerGas: parseGwei('33'),
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: maxPriorityFeePerGas', async () => {
  expect(
    await estimateGas(publicClient, {
      account: accounts[0].address,
      to: accounts[1].address,
      maxPriorityFeePerGas: parseGwei('2'),
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: gas', async () => {
  expect(
    await estimateGas(publicClient, {
      account: accounts[0].address,
      to: accounts[1].address,
      gas: parseGwei('2'),
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: blobs', async () => {
  expect(
    await estimateGas(publicClient, {
      account: accounts[0].address,
      to: accounts[1].address,
      blobs: ['0x123'],
      maxFeePerBlobGas: parseGwei('20'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

describe('local account', () => {
  test('default', async () => {
    expect(
      await estimateGas(publicClient, {
        account: privateKeyToAccount(accounts[0].privateKey),
        to: accounts[1].address,
        value: parseEther('1'),
      }),
    ).toMatchInlineSnapshot('21000n')
  })

  test('args: data', async () => {
    expect(
      await estimateGas(publicClient, {
        data: '0x00000000000000000000000000000000000000000000000004fefa17b7240000',
        account: privateKeyToAccount(accounts[0].privateKey),
        to: wethContractAddress,
      }),
    ).toMatchInlineSnapshot('26040n')
  })

  test('args: gasPrice (on chain w/ block.baseFeePerGas)', async () => {
    expect(
      await estimateGas(publicClient, {
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
      await estimateGas(publicClient, {
        account: privateKeyToAccount(accounts[0].privateKey),
        to: accounts[1].address,
        gasPrice: parseGwei('33'),
        value: parseEther('1'),
      }),
    ).toMatchInlineSnapshot('21000n')
  })

  test('args: maxFeePerGas (on eip1559)', async () => {
    expect(
      await estimateGas(publicClient, {
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
      estimateGas(publicClient, {
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

      Version: viem@1.0.2]
    `)
  })

  test('args: gas', async () => {
    expect(
      await estimateGas(publicClient, {
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
      estimateGas(publicClient, {
        account: accounts[0].address,
        to: accounts[1].address,
        value: parseEther('1'),
        maxFeePerGas: 2n ** 256n - 1n + 1n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [EstimateGasExecutionError: The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

      Estimate Gas Arguments:
        from:          0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:            0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:         1 ETH
        maxFeePerGas:  115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei

      Version: viem@1.0.2]
    `)
  })

  test('tip higher than fee cap', async () => {
    await expect(() =>
      estimateGas(publicClient, {
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

      Version: viem@1.0.2]
    `,
    )
  })
})
