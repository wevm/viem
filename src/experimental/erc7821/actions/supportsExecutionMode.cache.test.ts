import { expect, test, vi } from 'vitest'

import type { Address } from '../../../accounts/index.js'
import * as readContract from '../../../actions/public/readContract.js'

import { supportsExecutionMode } from './supportsExecutionMode.js'

const toAddress = (value: number) =>
  `0x${value.toString(16).padStart(40, '0')}` as Address

test('behavior: caches per client uid', async () => {
  const spy = vi
    .spyOn(readContract, 'readContract')
    .mockResolvedValue(true as any)
  const address = toAddress(1)

  await supportsExecutionMode({ uid: 'client-a' } as any, { address })
  await supportsExecutionMode({ uid: 'client-a' } as any, { address })
  await supportsExecutionMode({ uid: 'client-b' } as any, { address })

  expect(spy).toHaveBeenCalledTimes(2)
})

test('behavior: evicts old responses for high-cardinality keys', async () => {
  const spy = vi
    .spyOn(readContract, 'readContract')
    .mockResolvedValue(true as any)
  const client = { uid: 'lru-client' } as any
  const firstAddress = toAddress(100_000)

  for (let i = 0; i < 8_193; i++) {
    await supportsExecutionMode(client, { address: toAddress(100_000 + i) })
  }

  await supportsExecutionMode(client, { address: firstAddress })

  expect(spy).toHaveBeenCalledTimes(8_194)
})
