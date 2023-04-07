import { describe, expect, test } from 'vitest'

import { accounts, publicClient } from '../../_test/index.js'
import { celo } from '../../chains.js'
import { createPublicClient, http } from '../../clients/index.js'
import { numberToHex, parseEther, parseGwei } from '../../utils/index.js'

import { call } from './call.js'

const wagmiContractAddress = '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'
const name4bytes = '0x06fdde03'
const mint4bytes = '0x1249c58b'
const mintWithParams4bytes = '0xa0712d68'
const fourTwenty =
  '00000000000000000000000000000000000000000000000000000000000001a4'

const sourceAccount = accounts[0]

test('default', async () => {
  const { data } = await call(publicClient, {
    data: name4bytes,
    account: sourceAccount.address,
    to: wagmiContractAddress,
  })
  expect(data).toMatchInlineSnapshot(
    '"0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000"',
  )
})

test('custom formatter', async () => {
  const client = createPublicClient({
    chain: celo,
    transport: http(),
  })

  const { data } = await call(client, {
    gatewayFee: numberToHex(1n),
    data: name4bytes,
    account: sourceAccount.address,
    to: wagmiContractAddress,
  })
  expect(data).toBeUndefined()
})

test('zero data', async () => {
  const { data } = await call(publicClient, {
    data: mint4bytes,
    account: sourceAccount.address,
    to: wagmiContractAddress,
  })
  expect(data).toMatchInlineSnapshot('undefined')
})

test('args: blockNumber', async () => {
  const { data } = await call(publicClient, {
    blockNumber: 15564164n,
    data: `${mintWithParams4bytes}${fourTwenty}`,
    account: sourceAccount.address,
    to: wagmiContractAddress,
  })
  expect(data).toMatchInlineSnapshot('undefined')
})

describe('errors', () => {
  test('fee cap too high', async () => {
    await expect(() =>
      call(publicClient, {
        data: `${mintWithParams4bytes}${fourTwenty}`,
        account: sourceAccount.address,
        to: wagmiContractAddress,
        maxFeePerGas: 2n ** 256n - 1n + 1n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

      Raw Call Arguments:
        from:          0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:            0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
        data:          0xa0712d6800000000000000000000000000000000000000000000000000000000000001a4
        maxFeePerGas:  115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei

      Version: viem@1.0.2"
    `)
  })

  // TODO: Fix anvil error reason
  test('gas too low', async () => {
    await expect(() =>
      call(publicClient, {
        data: `${mintWithParams4bytes}${fourTwenty}`,
        account: sourceAccount.address,
        to: wagmiContractAddress,
        gas: 100n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "An internal error was received.

      URL: http://localhost
      Request body: {\\"method\\":\\"eth_call\\",\\"params\\":[{\\"from\\":\\"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266\\",\\"data\\":\\"0xa0712d6800000000000000000000000000000000000000000000000000000000000001a4\\",\\"gas\\":\\"0x64\\",\\"to\\":\\"0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2\\"},\\"latest\\"]}
       
      Raw Call Arguments:
        from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
        data:  0xa0712d6800000000000000000000000000000000000000000000000000000000000001a4
        gas:   100

      Details: EVM error OutOfGas
      Version: viem@1.0.2"
    `)
  })

  // TODO: Fix anvil error (should throw gas too high)
  test.skip('gas too high', async () => {
    await expect(() =>
      call(publicClient, {
        account: sourceAccount.address,
        to: accounts[0].address,
        value: 1n,
        gas: 100_000_000_000_000_000n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot()
  })

  // TODO: Fix anvil – this should fail
  test.skip('gas fee is less than block base fee', async () => {
    await expect(() =>
      call(publicClient, {
        account: sourceAccount.address,
        to: accounts[0].address,
        value: 1n,
        maxFeePerGas: 1n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot()
  })

  // TODO: Fix anvil – this should fail
  test.skip('nonce too low', async () => {
    await expect(() =>
      call(publicClient, {
        account: sourceAccount.address,
        to: accounts[0].address,
        value: 1n,
        nonce: 0,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot()
  })

  // TODO: Fix anvil – this should fail with reason
  test('insufficient funds', async () => {
    await expect(() =>
      call(publicClient, {
        account: sourceAccount.address,
        to: accounts[0].address,
        value: parseEther('100000'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "Execution reverted for an unknown reason.

      Raw Call Arguments:
        from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:     0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        value:  100000 ETH

      Details: execution reverted
      Version: viem@1.0.2"
    `)
  })

  test('maxFeePerGas less than maxPriorityFeePerGas', async () => {
    await expect(
      call(publicClient, {
        data: `${mintWithParams4bytes}${fourTwenty}`,
        account: sourceAccount.address,
        to: wagmiContractAddress,
        maxFeePerGas: parseGwei('20'),
        maxPriorityFeePerGas: parseGwei('22'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "The provided tip (\`maxPriorityFeePerGas\` = 22 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 20 gwei).

      Raw Call Arguments:
        from:                  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:                    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
        data:                  0xa0712d6800000000000000000000000000000000000000000000000000000000000001a4
        maxFeePerGas:          20 gwei
        maxPriorityFeePerGas:  22 gwei

      Version: viem@1.0.2"
    `)
  })

  test('contract revert (contract error)', async () => {
    await expect(
      call(publicClient, {
        data: `${mintWithParams4bytes}${fourTwenty}`,
        account: sourceAccount.address,
        to: wagmiContractAddress,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      "Execution reverted for an unknown reason.

      Raw Call Arguments:
        from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
        data:  0xa0712d6800000000000000000000000000000000000000000000000000000000000001a4

      Details: execution reverted: Token ID is taken
      Version: viem@1.0.2"
    `,
    )
  })

  test('contract revert (insufficient params)', async () => {
    await expect(
      call(publicClient, {
        data: mintWithParams4bytes,
        account: sourceAccount.address,
        to: wagmiContractAddress,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "Execution reverted for an unknown reason.

      Raw Call Arguments:
        from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
        data:  0xa0712d68

      Details: execution reverted
      Version: viem@1.0.2"
    `)
  })
})
