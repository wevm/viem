import { RLP } from '@ethereumjs/rlp'
import { encodeRlp } from 'ethers'
import { bench, describe } from 'vitest'

import { bytesToRlp } from './toRlp.js'

const generateBytes = (length: number) => {
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) bytes[i] = i
  return bytes
}

const generateList = (length: number) => {
  const bytes = []
  for (let i = 0; i < length; i++) bytes[i] = generateBytes(i)
  return bytes
}

describe('rlp: prefix === 0xb8', () => {
  const bytes = generateBytes(255)

  bench('viem: `toRlp`', () => {
    bytesToRlp(bytes)
  })

  bench('ethers: `encodeRlp`', () => {
    encodeRlp(bytes as any)
  })

  bench('@ethereumjs/rlp: `RLP.encode`', () => {
    RLP.encode(bytes as any)
  })
})

describe('rlp: prefix === 0xb9', () => {
  const bytes = generateBytes(65_535)

  bench('viem: `toRlp`', () => {
    bytesToRlp(bytes)
  })

  bench('ethers: `encodeRlp`', () => {
    encodeRlp(bytes as any)
  })

  bench('@ethereumjs/rlp: `RLP.encode`', () => {
    RLP.encode(bytes as any)
  })
})

describe('rlp: prefix === 0xba', () => {
  const bytes = generateBytes(16_777_215)

  bench('viem: `toRlp`', () => {
    bytesToRlp(bytes)
  })

  bench.skip('ethers: `encodeRlp`', () => {
    encodeRlp(bytes as any)
  })

  bench('@ethereumjs/rlp: `RLP.encode`', () => {
    RLP.encode(bytes as any)
  })
})

describe('rlp list: prefix === 0xf8', () => {
  const list = generateList(60)

  bench('viem: `toRlp`', () => {
    bytesToRlp(list)
  })

  bench('ethers: `encodeRlp`', () => {
    encodeRlp(list as any)
  })

  bench('@ethereumjs/rlp: `RLP.encode`', () => {
    RLP.encode(list as any)
  })
})

describe('rlp list: prefix === 0xf8 (recursive)', () => {
  const list = [
    generateList(4),
    [generateList(8), [generateList(3), generateBytes(1)]],
    [
      generateList(10),
      [
        generateList(5),
        generateBytes(2),
        [generateList(10), [generateList(20)]],
      ],
    ],
  ]

  bench('viem: `toRlp`', () => {
    bytesToRlp(list)
  })

  bench('ethers: `encodeRlp`', () => {
    encodeRlp(list as any)
  })

  bench('@ethereumjs/rlp: `RLP.encode`', () => {
    RLP.encode(list as any)
  })
})

describe.skip('rlp: tx (2048kB - prefix: 0xfa)', () => {
  const list = [
    generateBytes(1),
    generateBytes(4),
    generateBytes(8),
    generateBytes(8),
    generateBytes(4),
    generateBytes(20),
    generateBytes(8),
    generateBytes(2_048_000),
  ]

  bench('viem: `toRlp`', () => {
    bytesToRlp(list)
  })

  bench('ethers: `encodeRlp`', () => {
    encodeRlp(list as any)
  })

  bench('@ethereumjs/rlp: `RLP.encode`', () => {
    RLP.encode(list as any)
  })
})
