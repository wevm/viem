import { expect, test } from 'vitest'
import { blobData, kzg } from '../../../test/src/kzg.js'
import type { Kzg } from '../../types/kzg.js'
import type { ByteArray } from '../../types/misc.js'
import { stringToBytes, stringToHex } from '../index.js'
import { blobsToCommitments } from './blobsToCommitments.js'
import { blobsToProofs } from './blobsToProofs.js'
import { toBlobs } from './toBlobs.js'

// Mock KZG with EIP-7594 support
const kzg7594: Kzg = {
  ...kzg,
  computeCellsAndKzgProofs(_blob: ByteArray): [ByteArray[], ByteArray[]] {
    // Mock implementation: generate 2 mock cell proofs for testing
    const mockProof1 = new Uint8Array(48).fill(1)
    const mockProof2 = new Uint8Array(48).fill(2)
    const mockCell1 = new Uint8Array(2048).fill(0xa)
    const mockCell2 = new Uint8Array(2048).fill(0xb)
    return [
      [mockCell1, mockCell2],
      [mockProof1, mockProof2],
    ]
  },
}

test('from hex', () => {
  const blobs = toBlobs({ data: stringToHex(blobData) })
  const commitments = blobsToCommitments({ blobs, kzg })
  expect(blobsToProofs({ blobs, commitments, kzg })).toMatchInlineSnapshot(`
    [
      [
        "0x91a6c5d19e50b1b85ae2ef07477160381babf00f0906f5219ce09dee2e00d7d347cb0586d90b491637cdb1715e62d152",
      ],
      [
        "0xa660592b94033f9c5f7987005fa5d1f84435585ddaaf4b3adc0a198b983f2ae007db73b90067a96ec214b24d7b9820b9",
      ],
    ]
  `)
  expect(
    blobsToProofs({ blobs, commitments, kzg, to: 'bytes' }),
  ).toMatchInlineSnapshot(`
    [
      [
        Uint8Array [
          145,
          166,
          197,
          209,
          158,
          80,
          177,
          184,
          90,
          226,
          239,
          7,
          71,
          113,
          96,
          56,
          27,
          171,
          240,
          15,
          9,
          6,
          245,
          33,
          156,
          224,
          157,
          238,
          46,
          0,
          215,
          211,
          71,
          203,
          5,
          134,
          217,
          11,
          73,
          22,
          55,
          205,
          177,
          113,
          94,
          98,
          209,
          82,
        ],
      ],
      [
        Uint8Array [
          166,
          96,
          89,
          43,
          148,
          3,
          63,
          156,
          95,
          121,
          135,
          0,
          95,
          165,
          209,
          248,
          68,
          53,
          88,
          93,
          218,
          175,
          75,
          58,
          220,
          10,
          25,
          139,
          152,
          63,
          42,
          224,
          7,
          219,
          115,
          185,
          0,
          103,
          169,
          110,
          194,
          20,
          178,
          77,
          123,
          152,
          32,
          185,
        ],
      ],
    ]
  `)
})

test('from bytes', () => {
  const blobs = toBlobs({ data: stringToBytes(blobData) })
  const commitments = blobsToCommitments({ blobs, kzg })
  expect(blobsToProofs({ blobs, commitments, kzg })).toMatchInlineSnapshot(`
    [
      [
        Uint8Array [
          145,
          166,
          197,
          209,
          158,
          80,
          177,
          184,
          90,
          226,
          239,
          7,
          71,
          113,
          96,
          56,
          27,
          171,
          240,
          15,
          9,
          6,
          245,
          33,
          156,
          224,
          157,
          238,
          46,
          0,
          215,
          211,
          71,
          203,
          5,
          134,
          217,
          11,
          73,
          22,
          55,
          205,
          177,
          113,
          94,
          98,
          209,
          82,
        ],
      ],
      [
        Uint8Array [
          166,
          96,
          89,
          43,
          148,
          3,
          63,
          156,
          95,
          121,
          135,
          0,
          95,
          165,
          209,
          248,
          68,
          53,
          88,
          93,
          218,
          175,
          75,
          58,
          220,
          10,
          25,
          139,
          152,
          63,
          42,
          224,
          7,
          219,
          115,
          185,
          0,
          103,
          169,
          110,
          194,
          20,
          178,
          77,
          123,
          152,
          32,
          185,
        ],
      ],
    ]
  `)
  expect(
    blobsToProofs({ blobs, commitments, kzg, to: 'hex' }),
  ).toMatchInlineSnapshot(`
    [
      [
        "0x91a6c5d19e50b1b85ae2ef07477160381babf00f0906f5219ce09dee2e00d7d347cb0586d90b491637cdb1715e62d152",
      ],
      [
        "0xa660592b94033f9c5f7987005fa5d1f84435585ddaaf4b3adc0a198b983f2ae007db73b90067a96ec214b24d7b9820b9",
      ],
    ]
  `)
})

test('EIP-7594: from hex', () => {
  const blobs = toBlobs({ data: stringToHex(blobData) })
  const commitments = blobsToCommitments({ blobs, kzg: kzg7594 })
  const proofs = blobsToProofs({
    blobs,
    commitments,
    kzg: kzg7594,
    blobVersion: '7594',
  })

  // EIP-7594 should produce cell proofs (2 per blob for the mock, 2 blobs = 2 arrays)
  expect(proofs.length).toBe(2) // 2 blobs
  expect(proofs[0].length).toBe(2) // 2 proofs per blob (from mock)
  // Each proof should be a hex string (from hex blobs)
  expect(typeof proofs[0][0]).toBe('string')
  expect(proofs[0][0]).toMatch(/^0x/)
})

test('EIP-7594: from bytes', () => {
  const blobs = toBlobs({ data: stringToBytes(blobData) })
  const commitments = blobsToCommitments({ blobs, kzg: kzg7594 })
  const proofs = blobsToProofs({
    blobs,
    commitments,
    kzg: kzg7594,
    blobVersion: '7594',
    to: 'hex',
  })

  // EIP-7594 should produce cell proofs (2 per blob for the mock, 2 blobs = 2 arrays)
  expect(proofs.length).toBe(2) // 2 blobs
  expect(proofs[0].length).toBe(2) // 2 proofs per blob (from mock)
  expect(typeof proofs[0][0]).toBe('string')
  expect(proofs[0][0]).toMatch(/^0x/)
})

test('EIP-7594: throws error if computeCellsAndKzgProofs not available', () => {
  const blobs = toBlobs({ data: stringToHex(blobData) })
  const commitments = blobsToCommitments({ blobs, kzg })

  // Create a KZG object without computeCellsAndKzgProofs
  const kzgWithout7594: Kzg = {
    blobToKzgCommitment: kzg.blobToKzgCommitment,
    computeBlobKzgProof: kzg.computeBlobKzgProof,
    // No computeCellsAndKzgProofs method
  }

  expect(() =>
    blobsToProofs({
      blobs,
      commitments,
      kzg: kzgWithout7594,
      blobVersion: '7594',
    }),
  ).toThrowError(/does not support computeCellsAndKzgProofs/)
})
