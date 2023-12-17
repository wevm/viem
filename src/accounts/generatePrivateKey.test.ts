import { secp256k1 } from '@noble/curves/secp256k1'
import { expect } from 'chai'
import { it, vi } from 'vitest'

import type { Hex } from '~viem/index.js'
import { generatePrivateKey } from './generatePrivateKey.js'

it('should generate random private key', () => {
  const hex: Hex =
    '0xb4eb3c48376e1dc6e236c2004aea6f70d598de97825d15b7e97eaf89057ff9b9'

  vi.spyOn(secp256k1.utils, 'randomPrivateKey').mockImplementationOnce(() =>
    Uint8Array.from(
      Buffer.from(
        hex.slice(2), // skip 0x
        'hex',
      ),
    ),
  )

  expect(generatePrivateKey()).to.be.eq(hex)
})
