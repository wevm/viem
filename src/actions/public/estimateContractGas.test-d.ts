import { test } from 'vitest'

import { baycContractConfig, wagmiContractConfig } from '~test/src/abis.js'
import { accounts } from '~test/src/constants.js'
import { anvilMainnet } from '../../../test/src/anvil.js'

import { estimateContractGas } from './estimateContractGas.js'

const client = anvilMainnet.getClient()
const clientWithAccount = anvilMainnet.getClient({ account: true })

const args = {
  ...wagmiContractConfig,
  functionName: 'mint',
  args: [69420n],
} as const

test('client', () => {
  estimateContractGas(client, {
    ...args,
    account: accounts[0].address,
  })
})

test('client without account', () => {
  estimateContractGas(client, {
    ...args,
    account: accounts[0].address,
  })
})

test('client with account', () => {
  estimateContractGas(clientWithAccount, {
    ...args,
  })
})

test('legacy', () => {
  estimateContractGas(clientWithAccount, {
    ...args,
    gasPrice: 0n,
  })

  // @ts-expect-error
  estimateContractGas(clientWithAccount, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  estimateContractGas(clientWithAccount, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
  // @ts-expect-error
  estimateContractGas(clientWithAccount, {
    ...args,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
})

test('eip1559', () => {
  estimateContractGas(clientWithAccount, {
    ...args,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  estimateContractGas(clientWithAccount, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  estimateContractGas(clientWithAccount, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip1559',
  })
  // @ts-expect-error
  estimateContractGas(clientWithAccount, {
    ...args,
    gasPrice: 0n,
    type: 'eip1559',
  })
})

test('eip2930', () => {
  estimateContractGas(clientWithAccount, {
    ...args,
    accessList: [],
    gasPrice: 0n,
  })

  // @ts-expect-error
  estimateContractGas(clientWithAccount, {
    ...args,
    accessList: [],
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  estimateContractGas(clientWithAccount, {
    ...args,
    accessList: [],
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
  // @ts-expect-error
  estimateContractGas(clientWithAccount, {
    ...args,
    accessList: [],
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
})

test('args: value', () => {
  // payable function
  estimateContractGas(clientWithAccount, {
    abi: baycContractConfig.abi,
    address: '0x',
    functionName: 'mintApe',
    args: [69n],
    value: 5n,
  })

  // payable function (undefined)
  estimateContractGas(clientWithAccount, {
    abi: baycContractConfig.abi,
    address: '0x',
    functionName: 'mintApe',
    args: [69n],
  })

  // nonpayable function
  estimateContractGas(clientWithAccount, {
    abi: baycContractConfig.abi,
    address: '0x',
    functionName: 'approve',
    // @ts-expect-error
    value: 5n,
  })
})
