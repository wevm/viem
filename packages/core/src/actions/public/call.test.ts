import { expect, test } from 'vitest'

import { accounts, publicClient } from '../../../test'
import { celo } from '../../chains'
import { createPublicClient, http } from '../../clients'
import { numberToHex, parseGwei } from '../../utils'

import { call } from './call'

const wagmiContractAddress = '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'
const name4bytes = '0x06fdde03'
const mint4bytes = '0x1249c58b'
const mintWithParams4bytes = '0xa0712d68'
const fourTwenty =
  '00000000000000000000000000000000000000000000000000000000000001a4'

const sourceAccount = accounts[0]

test('default', async () => {
  const { data } = await call(publicClient, {
    request: {
      data: name4bytes,
      from: sourceAccount.address,
      to: wagmiContractAddress,
    },
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
    chain: celo,
    request: {
      gatewayFee: numberToHex(1n),
      data: name4bytes,
      from: sourceAccount.address,
      to: wagmiContractAddress,
    },
  })
  expect(data).toBeUndefined()
})

test('zero data', async () => {
  const { data } = await call(publicClient, {
    request: {
      data: mint4bytes,
      from: sourceAccount.address,
      to: wagmiContractAddress,
    },
  })
  expect(data).toMatchInlineSnapshot('undefined')
})

test('args: blockNumber', async () => {
  const { data } = await call(publicClient, {
    blockNumber: 15564164n,
    request: {
      data: `${mintWithParams4bytes}${fourTwenty}`,
      from: sourceAccount.address,
      to: wagmiContractAddress,
    },
  })
  expect(data).toMatchInlineSnapshot('undefined')
})

test('errors: maxFeePerGas less than maxPriorityFeePerGas', async () => {
  await expect(
    call(publicClient, {
      request: {
        data: `${mintWithParams4bytes}${fourTwenty}`,
        from: sourceAccount.address,
        to: wagmiContractAddress,
        maxFeePerGas: parseGwei('20'),
        maxPriorityFeePerGas: parseGwei('22'),
      },
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "Gas values provided are invalid.

    Details: maxFeePerGas cannot be less than maxPriorityFeePerGas
    Version: viem@1.0.2"
  `)
})

test('errors: contract revert (contract error)', async () => {
  await expect(
    call(publicClient, {
      request: {
        data: `${mintWithParams4bytes}${fourTwenty}`,
        from: sourceAccount.address,
        to: wagmiContractAddress,
      },
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "RPC Request failed.

    URL: ws://127.0.0.1:8545/
    Request body: {\\"method\\":\\"eth_call\\",\\"params\\":[{\\"data\\":\\"0xa0712d6800000000000000000000000000000000000000000000000000000000000001a4\\",\\"from\\":\\"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266\\",\\"to\\":\\"0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2\\"},\\"latest\\"]}

    Details: execution reverted: Token ID is taken
    Internal Error: {\\"code\\":3,\\"message\\":\\"execution reverted: Token ID is taken\\",\\"data\\":\\"0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011546f6b656e2049442069732074616b656e000000000000000000000000000000\\"}
    Version: viem@1.0.2"
  `)
})

test('errors: contract revert (insufficient params)', async () => {
  await expect(
    call(publicClient, {
      request: {
        data: mintWithParams4bytes,
        from: sourceAccount.address,
        to: wagmiContractAddress,
      },
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "RPC Request failed.

    URL: ws://127.0.0.1:8545/
    Request body: {\\"method\\":\\"eth_call\\",\\"params\\":[{\\"data\\":\\"0xa0712d68\\",\\"from\\":\\"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266\\",\\"to\\":\\"0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2\\"},\\"latest\\"]}

    Details: execution reverted
    Internal Error: {\\"code\\":3,\\"message\\":\\"execution reverted\\",\\"data\\":\\"0x\\"}
    Version: viem@1.0.2"
  `)
})
