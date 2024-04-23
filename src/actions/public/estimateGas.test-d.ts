import { test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { estimateGas } from './estimateGas.js'

const client = anvilMainnet.getClient()

test('legacy', () => {
  estimateGas(client, {
    account: '0x',
    gasPrice: 0n,
  })

  // @ts-expect-error
  estimateGas(client, {
    account: '0x',
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  estimateGas(client, {
    account: '0x',
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
  // @ts-expect-error
  estimateGas(client, {
    account: '0x',
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
})

test('eip1559', () => {
  estimateGas(client, {
    account: '0x',
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  estimateGas(client, {
    account: '0x',
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  estimateGas(client, {
    account: '0x',
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip1559',
  })
  // @ts-expect-error
  estimateGas(client, {
    account: '0x',
    gasPrice: 0n,
    type: 'eip1559',
  })
})

test('eip2930', () => {
  estimateGas(client, {
    account: '0x',
    accessList: [],
    gasPrice: 0n,
  })

  // @ts-expect-error
  estimateGas(client, {
    account: '0x',
    accessList: [],
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  estimateGas(client, {
    account: '0x',
    accessList: [],
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
  // @ts-expect-error
  estimateGas(client, {
    account: '0x',
    accessList: [],
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
})
