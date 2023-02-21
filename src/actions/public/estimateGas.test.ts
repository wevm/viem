import { describe, expect, test } from 'vitest'

import {
  accounts,
  initialBlockNumber,
  publicClient,
  testClient,
} from '../../_test'
import { parseEther, parseGwei } from '../../utils'
import { reset } from '../test'
import { estimateGas } from './estimateGas'

const wethContractAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

test('estimates gas', async () => {
  expect(
    await estimateGas(publicClient, {
      from: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: blockNumber', async () => {
  await reset(testClient, {
    blockNumber: BigInt(parseInt(process.env.VITE_ANVIL_BLOCK_NUMBER!)),
    jsonRpcUrl: process.env.VITE_ANVIL_FORK_URL,
  })
  expect(
    await estimateGas(publicClient, {
      blockNumber: initialBlockNumber,
      from: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: data', async () => {
  expect(
    await estimateGas(publicClient, {
      data: '0x00000000000000000000000000000000000000000000000004fefa17b7240000',
      from: accounts[0].address,
      to: wethContractAddress,
    }),
  ).toMatchInlineSnapshot('26145n')
})

test('args: gasPrice', async () => {
  expect(
    await estimateGas(publicClient, {
      from: accounts[0].address,
      to: accounts[1].address,
      gasPrice: parseGwei('33'),
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: nonce', async () => {
  expect(
    await estimateGas(publicClient, {
      from: accounts[0].address,
      to: accounts[1].address,
      nonce: 69,
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: maxFeePerGas', async () => {
  expect(
    await estimateGas(publicClient, {
      from: accounts[0].address,
      to: accounts[1].address,
      maxFeePerGas: parseGwei('33'),
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: maxPriorityFeePerGas', async () => {
  expect(
    await estimateGas(publicClient, {
      from: accounts[0].address,
      to: accounts[1].address,
      maxPriorityFeePerGas: parseGwei('2'),
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: gas', async () => {
  expect(
    await estimateGas(publicClient, {
      from: accounts[0].address,
      to: accounts[1].address,
      gas: parseGwei('2'),
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

describe('errors', () => {
  test('fee cap too high', async () => {
    await expect(() =>
      estimateGas(publicClient, {
        from: accounts[0].address,
        to: accounts[1].address,
        value: parseEther('1'),
        maxFeePerGas: 2n ** 256n - 1n + 1n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

      Estimate Gas Arguments:
        from:          0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:            0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:         1 ETH
        maxFeePerGas:  115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei

      Version: viem@1.0.2"
    `)
  })

  test('tip higher than fee cap', async () => {
    await expect(() =>
      estimateGas(publicClient, {
        from: accounts[0].address,
        to: accounts[1].address,
        value: parseEther('1'),
        maxPriorityFeePerGas: parseGwei('11'),
        maxFeePerGas: parseGwei('10'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      "The provided tip (\`maxPriorityFeePerGas\` = 11 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 10 gwei).

      Estimate Gas Arguments:
        from:                  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:                    0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:                 1 ETH
        maxFeePerGas:          10 gwei
        maxPriorityFeePerGas:  11 gwei

      Version: viem@1.0.2"
    `,
    )
  })
})
