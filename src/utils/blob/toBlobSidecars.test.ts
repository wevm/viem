import { expect, test } from 'vitest'
import { blobData, kzg } from '../../../test/src/kzg.js'
import { stringToBytes, stringToHex } from '../index.js'
import { blobsToCommitments } from './blobsToCommitments.js'
import { blobsToProofs } from './blobsToProofs.js'
import { fromBlobs } from './fromBlobs.js'
import { toBlobSidecars } from './toBlobSidecars.js'
import { toBlobs } from './toBlobs.js'

test('args: data', () => {
  const data = stringToHex(blobData)
  const sidecars = toBlobSidecars({
    data,
    kzg,
  })
  const blobs = sidecars.map(({ blob }) => blob)
  expect(
    fromBlobs({
      blobs: blobs,
    }),
  ).toEqual(data)
})

test('args: blobs, commitments, proofs', () => {
  const data = stringToHex(blobData)
  const blobs = toBlobs({ data })
  const commitments = blobsToCommitments({ blobs, kzg })
  const proofs = blobsToProofs({ blobs, commitments, kzg })
  const sidecars = toBlobSidecars({
    blobs,
    commitments,
    proofs,
  })
  const sidecarBlobs = sidecars.map(({ blob }) => blob)
  expect(
    fromBlobs({
      blobs: sidecarBlobs,
    }),
  ).toEqual(data)
  expect(
    sidecars.map(({ commitment, proof }) => ({
      commitment,
      proof,
    })),
  ).toMatchInlineSnapshot(`
    [
      {
        "commitment": "0x93fd6807e033db6b24db5485814f79a98c7e241432e95c2e327042f821f24f4a59315cf4e881205f472e99835729977a",
        "proof": "0x91a6c5d19e50b1b85ae2ef07477160381babf00f0906f5219ce09dee2e00d7d347cb0586d90b491637cdb1715e62d152",
      },
      {
        "commitment": "0xaa9da85a334c2935e670bd44e9b734481fc5ab72859c76f741008a92c2836932af9e60697b6319f3454a141154fcd583",
        "proof": "0xa660592b94033f9c5f7987005fa5d1f84435585ddaaf4b3adc0a198b983f2ae007db73b90067a96ec214b24d7b9820b9",
      },
    ]
  `)
})

test('args: to', () => {
  const data = stringToHex(blobData)
  const sidecars = toBlobSidecars({
    data,
    kzg,
  })
  const blobs = sidecars.map(({ blob }) => blob)
  expect(
    fromBlobs({
      blobs: blobs,
    }),
  ).toEqual(data)
  expect(
    sidecars.map(({ commitment, proof }) => ({
      commitment,
      proof,
    })),
  ).toMatchInlineSnapshot(`
    [
      {
        "commitment": "0x93fd6807e033db6b24db5485814f79a98c7e241432e95c2e327042f821f24f4a59315cf4e881205f472e99835729977a",
        "proof": "0x91a6c5d19e50b1b85ae2ef07477160381babf00f0906f5219ce09dee2e00d7d347cb0586d90b491637cdb1715e62d152",
      },
      {
        "commitment": "0xaa9da85a334c2935e670bd44e9b734481fc5ab72859c76f741008a92c2836932af9e60697b6319f3454a141154fcd583",
        "proof": "0xa660592b94033f9c5f7987005fa5d1f84435585ddaaf4b3adc0a198b983f2ae007db73b90067a96ec214b24d7b9820b9",
      },
    ]
  `)

  const sidecars_bytes = toBlobSidecars({
    data,
    kzg,
    to: 'bytes',
  })
  const blobs_bytes = sidecars_bytes.map(({ blob }) => blob)
  expect(
    fromBlobs({
      blobs: blobs_bytes,
    }),
  ).toEqual(stringToBytes(blobData))
  expect(
    sidecars_bytes.map(({ commitment, proof }) => ({
      commitment,
      proof,
    })),
  ).toMatchInlineSnapshot(`
    [
      {
        "commitment": Uint8Array [
          147,
          253,
          104,
          7,
          224,
          51,
          219,
          107,
          36,
          219,
          84,
          133,
          129,
          79,
          121,
          169,
          140,
          126,
          36,
          20,
          50,
          233,
          92,
          46,
          50,
          112,
          66,
          248,
          33,
          242,
          79,
          74,
          89,
          49,
          92,
          244,
          232,
          129,
          32,
          95,
          71,
          46,
          153,
          131,
          87,
          41,
          151,
          122,
        ],
        "proof": Uint8Array [
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
      },
      {
        "commitment": Uint8Array [
          170,
          157,
          168,
          90,
          51,
          76,
          41,
          53,
          230,
          112,
          189,
          68,
          233,
          183,
          52,
          72,
          31,
          197,
          171,
          114,
          133,
          156,
          118,
          247,
          65,
          0,
          138,
          146,
          194,
          131,
          105,
          50,
          175,
          158,
          96,
          105,
          123,
          99,
          25,
          243,
          69,
          74,
          20,
          17,
          84,
          252,
          213,
          131,
        ],
        "proof": Uint8Array [
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
      },
    ]
  `)

  const sidecars_hex = toBlobSidecars({
    data,
    kzg,
    to: 'hex',
  })
  const blobs_hex = sidecars_hex.map(({ blob }) => blob)
  expect(
    fromBlobs({
      blobs: blobs_hex,
    }),
  ).toEqual(stringToHex(blobData))
  expect(
    sidecars_hex.map(({ commitment, proof }) => ({
      commitment,
      proof,
    })),
  ).toMatchInlineSnapshot(`
    [
      {
        "commitment": "0x93fd6807e033db6b24db5485814f79a98c7e241432e95c2e327042f821f24f4a59315cf4e881205f472e99835729977a",
        "proof": "0x91a6c5d19e50b1b85ae2ef07477160381babf00f0906f5219ce09dee2e00d7d347cb0586d90b491637cdb1715e62d152",
      },
      {
        "commitment": "0xaa9da85a334c2935e670bd44e9b734481fc5ab72859c76f741008a92c2836932af9e60697b6319f3454a141154fcd583",
        "proof": "0xa660592b94033f9c5f7987005fa5d1f84435585ddaaf4b3adc0a198b983f2ae007db73b90067a96ec214b24d7b9820b9",
      },
    ]
  `)
})
