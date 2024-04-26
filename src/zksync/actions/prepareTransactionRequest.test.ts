import { afterAll, beforeEach, expect, test, vi } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { zkSyncClient } from '~test/src/zksync.js'
import { privateKeyToAccount } from '~viem/accounts/privateKeyToAccount.js'
import type { EIP1193RequestFn } from '~viem/types/eip1193.js'
import type { Hex } from '~viem/types/misc.js'
import * as estimateGas_ from '../../actions/public/estimateGas.js'
import * as prepareTransactionRequest_ from '../../actions/wallet/prepareTransactionRequest.js'
import { toSmartAccount } from '../accounts/toSmartAccount.js'
import { prepareTransactionRequest } from './prepareTransactionRequest.js'

const prepareTransactionRequestSpy = vi
  .spyOn(prepareTransactionRequest_, 'prepareTransactionRequest')
  .mockResolvedValue({
    chainId: 1,
    gas: 21000n,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    type: 'eip1559',
    value: 1000000000000000000n,
  } as any)

const estimateGasSpy = vi
  .spyOn(estimateGas_, 'estimateGas')
  .mockResolvedValue(25000n)

const client = zkSyncClient
const account = privateKeyToAccount(accounts[0].privateKey)

beforeEach(() => {
  prepareTransactionRequestSpy.mockClear()
  estimateGasSpy.mockClear()
})

afterAll(() => {
  prepareTransactionRequestSpy.mockRestore()
  estimateGasSpy.mockRestore()
})

test('default', async () => {
  client.request = (async ({ method, params }) => {
    if (method === 'eth_getCode') return '0x'
    return zkSyncClient.request({ method, params } as any)
  }) as EIP1193RequestFn

  await prepareTransactionRequest(client, {
    account,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: 1000000000000000000n,
  })
  expect(prepareTransactionRequestSpy).toHaveBeenCalledOnce()
  expect(estimateGasSpy).toHaveBeenCalledTimes(0)
})

test('default with smart account', async () => {
  client.request = (async ({ method, params }) => {
    if (method === 'eth_getCode') return '0x'
    return zkSyncClient.request({ method, params } as any)
  }) as EIP1193RequestFn

  const smartAccount = toSmartAccount({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    account: accounts[0].address,
    sign: async (payload: Hex) => {
      return payload
    },
  })

  await prepareTransactionRequest(client, {
    account: smartAccount,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: 1000000000000000000n,
  })
  expect(prepareTransactionRequestSpy).toHaveBeenCalledOnce()
  expect(estimateGasSpy).toHaveBeenCalledTimes(0)
})

test('smart account with contract address', async () => {
  client.request = (async ({ method, params }) => {
    if (method === 'eth_getCode') return '0x492184902819482184921'
    return zkSyncClient.request({ method, params } as any)
  }) as EIP1193RequestFn

  const smartAccount = toSmartAccount({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    account: accounts[0].address,
    sign: async (payload: Hex) => {
      return payload
    },
  })
  await prepareTransactionRequest(client, {
    account: smartAccount,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: 1000000000000000000n,
  })
  expect(prepareTransactionRequestSpy).toHaveBeenCalledOnce()
  expect(estimateGasSpy).toHaveBeenCalledWith(client, {
    account: smartAccount.walletAccount,
    to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    value: 1000000000000000000n,
  })
})

test('smart account with contract address and without wallet for estimate gas', async () => {
  client.request = (async ({ method, params }) => {
    if (method === 'eth_getCode') return '0x492184902819482184921'
    return zkSyncClient.request({ method, params } as any)
  }) as EIP1193RequestFn

  const smartAccount = toSmartAccount({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    sign: async (payload: Hex) => {
      return payload
    },
  })

  try {
    await prepareTransactionRequest(client, {
      account: smartAccount,
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      value: 1000000000000000000n,
    })

    throw new Error('Expected an error to be thrown')
  } catch (e) {
    expect(e).toMatchInlineSnapshot(
      '[Error: The account cannot be used to estimate gas costs because the address is not a valid wallet address, and addressAccount is absent from the smart account.]',
    )
    expect(prepareTransactionRequestSpy).toHaveBeenCalledTimes(0)
    expect(estimateGasSpy).toHaveBeenCalledTimes(0)
  }
})
