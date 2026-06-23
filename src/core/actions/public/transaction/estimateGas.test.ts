import * as Blobs from 'ox/Blobs'
import * as Hex from 'ox/Hex'
import * as Value from 'ox/Value'
import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { kzg } from '~test/kzg.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem'

import { EstimateGasExecutionError } from './estimateGas.js'

const client = anvil.getClient(anvil.mainnet)

const wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const maxUint256 = 2n ** 256n - 1n

const sourceAccount = constants.accounts[0]
const targetAccount = constants.accounts[1]

test('estimates gas', async () => {
  expect(
    await Actions.transaction.estimateGas(client, {
      to: targetAccount.address,
      value: Value.fromEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: account', async () => {
  expect(
    await Actions.transaction.estimateGas(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: Value.fromEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: account (local)', async () => {
  expect(
    await Actions.transaction.estimateGas(client, {
      account: Account.fromPrivateKey(sourceAccount.privateKey),
      to: targetAccount.address,
      value: Value.fromEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: authorizationList', async () => {
  const eoa = Account.fromPrivateKey(targetAccount.privateKey)
  const authorization = await eoa.signAuthorization!({
    address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
    chainId: 1,
    nonce: 0n,
  })

  expect(
    await Actions.transaction.estimateGas(client, {
      account: sourceAccount.address,
      authorizationList: [authorization],
      data: '0xdeadbeef',
    }),
  ).toBeTypeOf('bigint')
})

test('args: blobs (local account)', async () => {
  expect(
    await Actions.transaction.estimateGas(client, {
      account: Account.fromPrivateKey(sourceAccount.privateKey),
      blobs: Blobs.from('0x1234'),
      kzg,
      maxFeePerBlobGas: Value.fromGwei('20'),
      to: targetAccount.address,
    }),
  ).toMatchInlineSnapshot('21001n')
})

test('args: deployment (no `to`)', async () => {
  expect(
    await Actions.transaction.estimateGas(client, {
      account: sourceAccount.address,
      data: generated.Erc721.bytecode.object,
    }),
  ).toBeTypeOf('bigint')
})

test('args: blockNumber', async () => {
  expect(
    await Actions.transaction.estimateGas(client, {
      account: sourceAccount.address,
      blockNumber: anvil.mainnet.forkBlockNumber,
      to: targetAccount.address,
      value: Value.fromEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: data', async () => {
  expect(
    await Actions.transaction.estimateGas(client, {
      account: sourceAccount.address,
      data: '0x00000000000000000000000000000000000000000000000004fefa17b7240000',
      to: wethAddress,
    }),
  ).toMatchInlineSnapshot('26040n')
})

test('args: gas', async () => {
  expect(
    await Actions.transaction.estimateGas(client, {
      account: sourceAccount.address,
      gas: Value.fromGwei('2'),
      to: targetAccount.address,
      value: Value.fromEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: gasPrice', async () => {
  expect(
    await Actions.transaction.estimateGas(client, {
      account: sourceAccount.address,
      gasPrice: Value.fromGwei('33'),
      to: targetAccount.address,
      value: Value.fromEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: maxFeePerGas', async () => {
  expect(
    await Actions.transaction.estimateGas(client, {
      account: sourceAccount.address,
      maxFeePerGas: Value.fromGwei('33'),
      to: targetAccount.address,
      value: Value.fromEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: maxPriorityFeePerGas', async () => {
  expect(
    await Actions.transaction.estimateGas(client, {
      account: sourceAccount.address,
      maxPriorityFeePerGas: Value.fromGwei('2'),
      to: targetAccount.address,
      value: Value.fromEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: nonce', async () => {
  expect(
    await Actions.transaction.estimateGas(client, {
      account: sourceAccount.address,
      nonce: 69,
      to: targetAccount.address,
      value: Value.fromEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: stateOverride', async () => {
  const transferData =
    '0xa9059cbb00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000de0b6b3a7640000'
  const balanceSlot =
    '0xc651ee22c6951bb8b5bd29e8210fb394645a94315fe10eff2cc73de1aa75c137'

  expect(
    await Actions.transaction.estimateGas(client, {
      account: sourceAccount.address,
      data: transferData,
      stateOverride: {
        [wethAddress]: {
          stateDiff: {
            [balanceSlot]: Hex.fromNumber(maxUint256, { size: 32 }),
          },
        },
      },
      to: wethAddress,
    }),
  ).toMatchInlineSnapshot('51594n')
})

describe('errors', () => {
  test('cannot infer `to` from `authorizationList`', async () => {
    await expect(() =>
      Actions.transaction.estimateGas(client, {
        account: sourceAccount.address,
        authorizationList: [
          {
            address: '0x0000000000000000000000000000000000000000',
            chainId: 1,
            nonce: 0n,
            r: '0x0000000000000000000000000000000000000000000000000000000000000000',
            s: '0x0000000000000000000000000000000000000000000000000000000000000000',
            yParity: 0,
          },
        ],
        data: '0xdeadbeef',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [EstimateGasExecutionError: \`to\` is required. Could not infer from \`authorizationList\`

      Estimate Gas Arguments:
        from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        data:  0xdeadbeef

      Details: \`to\` is required. Could not infer from \`authorizationList\`
      Version: viem@2.52.1]
    `)
  })

  test('fee cap too high', async () => {
    await expect(() =>
      Actions.transaction.estimateGas(client, {
        account: sourceAccount.address,
        maxFeePerGas: maxUint256 + 1n,
        to: targetAccount.address,
        value: Value.fromEther('1'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [EstimateGasExecutionError: The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

      Estimate Gas Arguments:
        from:          0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:            0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:         1 ETH
        maxFeePerGas:  115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei

      Details: The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).
      Version: viem@2.52.1]
    `)
  })

  test('aborted request is not wrapped', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(() =>
      Actions.transaction.estimateGas(client, {
        account: sourceAccount.address,
        requestOptions: { signal: controller.signal },
        to: targetAccount.address,
        value: Value.fromEther('1'),
      }),
    ).rejects.toThrowError()
  })

  test('node error (execution reverted)', async () => {
    // Transfer of 1 WETH from an account that holds none reverts on-chain.
    const transferData =
      '0xa9059cbb00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000de0b6b3a7640000'
    await expect(() =>
      Actions.transaction.estimateGas(client, {
        account: targetAccount.address,
        data: transferData,
        to: wethAddress,
      }),
    ).rejects.toThrowError(EstimateGasExecutionError)
  })

  test('tip higher than fee cap', async () => {
    await expect(() =>
      Actions.transaction.estimateGas(client, {
        account: sourceAccount.address,
        maxFeePerGas: Value.fromGwei('10'),
        maxPriorityFeePerGas: Value.fromGwei('11'),
        to: targetAccount.address,
        value: Value.fromEther('1'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [EstimateGasExecutionError: The provided tip (\`maxPriorityFeePerGas\` = 11 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 10 gwei).

      Estimate Gas Arguments:
        from:                  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:                    0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:                 1 ETH
        maxFeePerGas:          10 gwei
        maxPriorityFeePerGas:  11 gwei

      Details: The provided tip (\`maxPriorityFeePerGas\` = 11 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 10 gwei).
      Version: viem@2.52.1]
    `)
  })
})
