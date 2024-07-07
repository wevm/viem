import { describe, expect, test } from 'vitest'
import { bundlerMainnet } from '../../../../test/src/bundler.js'
import {
  getSmartAccounts_06,
  getSmartAccounts_07,
} from '../../../../test/src/smartAccounts.js'
import { estimateUserOperationGas } from './estimateUserOperationGas.js'

const bundlerClient = bundlerMainnet.getBundlerClient()

describe('entryPointVersion: 0.7', async () => {
  const [account] = await getSmartAccounts_07()

  test('default', async () => {
    expect(
      await estimateUserOperationGas(bundlerClient, {
        account,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      }),
    ).toMatchInlineSnapshot(`
      {
        "callGasLimit": 80000n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 51642n,
        "verificationGasLimit": 259060n,
      }
    `)
  })

  test('error: failed init code', async () => {
    await expect(() =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        factory: '0x0000000000000000000000000000000000000000',
        factoryData: '0x',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: Failed to simulate deployment for Smart Account.

      factory: 0x0000000000000000000000000000000000000000
      factoryData: 0x
       
      Request Arguments:
        callData:     0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000
        factory:      0x0000000000000000000000000000000000000000
        factoryData:  0x
        nonce:        0
        sender:       0xE911628bF8428C23f179a07b081325cAe376DE1f
        signature:    0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Details: UserOperation reverted during simulation with reason: AA13 initCode failed or OOG
      Version: viem@x.y.z]
    `)
  })
})

describe('entryPointVersion: 0.6', async () => {
  const [account] = await getSmartAccounts_06()

  test('default', async () => {
    expect(
      await estimateUserOperationGas(bundlerClient, {
        account,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      }),
    ).toMatchInlineSnapshot(`
      {
        "callGasLimit": 80000n,
        "preVerificationGas": 55154n,
        "verificationGasLimit": 258801n,
      }
    `)
  })

  test('error: failed init code', async () => {
    await expect(() =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        initCode: '0x0000000000000000000000000000000000000000deadbeef',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: Failed to simulate deployment for Smart Account.

      initCode: 0x0000000000000000000000000000000000000000deadbeef
       
      Request Arguments:
        callData:          0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000
        initCode:          0x0000000000000000000000000000000000000000deadbeef
        nonce:             0
        paymasterAndData:  0x
        sender:            0x6edf7db791fC4D438D4A683E857B2fE1a84947Ce
        signature:         0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Details: UserOperation reverted during simulation with reason: AA13 initCode failed or OOG
      Version: viem@x.y.z]
    `)
  })
})

test('error: account not defined', async () => {
  await expect(() =>
    estimateUserOperationGas(bundlerClient, {
      // @ts-expect-error
      account: undefined,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [AccountNotFoundError: Could not find an Account to execute with this Action.
    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the WalletClient.

    Version: viem@x.y.z]
  `)
})
