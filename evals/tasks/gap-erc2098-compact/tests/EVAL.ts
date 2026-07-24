import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { fromCompactSignature, toCompactSignature } from '../src/index.ts'

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

// Canonical EIP-2098 test vectors, plus 0/1 recovery-byte variants.
const vectors = [
  {
    serialized:
      '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b907e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea520641b',
    compact:
      '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b907e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
    r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
    s: '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
    yParity: 0,
  },
  {
    serialized:
      '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76139c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f5507931c',
    compact:
      '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76939c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793',
    r: '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76',
    s: '0x139c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793',
    yParity: 1,
  },
  {
    serialized:
      '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b907e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea5206400',
    compact:
      '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b907e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
    r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
    s: '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
    yParity: 0,
  },
  {
    serialized:
      '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76139c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f55079301',
    compact:
      '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76939c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793',
    r: '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76',
    s: '0x139c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793',
    yParity: 1,
  },
] as const

test('converts 65-byte signatures to ERC-2098 compact form', () => {
  for (const vector of vectors)
    expect(
      toCompactSignature({ signature: vector.serialized }).toLowerCase(),
    ).toBe(vector.compact)
})

test('parses compact signatures back to r/s/yParity', () => {
  for (const vector of vectors) {
    const { r, s, yParity } = fromCompactSignature({
      compact: vector.compact,
    })
    expect(r.toLowerCase()).toBe(vector.r)
    expect(s.toLowerCase()).toBe(vector.s)
    expect(yParity).toBe(vector.yParity)
  }
})

test('round trip preserves r/s/yParity', () => {
  for (const vector of vectors) {
    const { r, s, yParity } = fromCompactSignature({
      compact: toCompactSignature({ signature: vector.serialized }),
    })
    expect(r.toLowerCase()).toBe(vector.r)
    expect(s.toLowerCase()).toBe(vector.s)
    expect(yParity).toBe(vector.yParity)
  }
})
