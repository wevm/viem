import { describe, expect, test, vi } from 'vitest'

import * as publicActions from './index.js'
import {
  accounts,
  initialBlockNumber,
  publicClient,
  testClient,
} from '../../_test/index.js'
import { parseEther, parseGwei } from '../../utils/index.js'
import { reset } from '../test/index.js'
import { estimateGas } from './estimateGas.js'
import { privateKeyToAccount } from '../../accounts/index.js'

const wethContractAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

test('estimates gas', async () => {
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
    blockNumber: BigInt(parseInt(process.env.VITE_ANVIL_BLOCK_NUMBER!)),
    jsonRpcUrl: process.env.VITE_ANVIL_FORK_URL,
  })
  expect(
    await estimateGas(publicClient, {
      blockNumber: initialBlockNumber,
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
  ).toMatchInlineSnapshot('26145n')
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
    ).toMatchInlineSnapshot('26064n')
  })

  test('args: gasPrice (on eip1559)', async () => {
    await expect(() =>
      estimateGas(publicClient, {
        account: privateKeyToAccount(accounts[0].privateKey),
        to: accounts[1].address,
        gasPrice: parseGwei('33'),
        value: parseEther('1'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "Chain does not support legacy \`gasPrice\`.

      Estimate Gas Arguments:
        from:      0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        to:        0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:     1 ETH
        gasPrice:  33 gwei

      Version: viem@1.0.2"
    `)
  })

  test('args: gasPrice (on legacy)', async () => {
    vi.spyOn(publicActions, 'getBlock').mockResolvedValueOnce({
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
    vi.spyOn(publicActions, 'getBlock').mockResolvedValueOnce({
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
      "Chain does not support EIP-1559 fees.

      Estimate Gas Arguments:
        from:          0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        to:            0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:         1 ETH
        maxFeePerGas:  33 gwei

      Version: viem@1.0.2"
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
  test('no account', async () => {
    await expect(() =>
      // @ts-expect-error
      estimateGas(publicClient, {
        to: accounts[1].address,
        value: parseEther('1'),
        maxFeePerGas: 2n ** 256n - 1n + 1n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "Could not find an Account to execute with this Action.
      Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the WalletClient.

      Docs: https://viem.sh/docs/actions/public/estimateGas.html#account
      Version: viem@1.0.2"
    `)
  })

  test('fee cap too high', async () => {
    await expect(() =>
      estimateGas(publicClient, {
        account: accounts[0].address,
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
        account: accounts[0].address,
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
