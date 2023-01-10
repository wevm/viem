import { expect, test } from 'vitest'

import { getContractAddress } from './getContractAddress'

test('gets contract address (CREATE)', () => {
  expect(
    getContractAddress({
      from: '0x1a1e021a302c237453d3d45c7b82b19ceeb7e2e6',
      nonce: 0n,
    }),
  ).toMatchInlineSnapshot('"0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2"')

  expect(
    getContractAddress({
      from: '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b',
      nonce: 5n,
    }),
  ).toMatchInlineSnapshot('"0x30b3F7E5B61d6343Af9B4f98Ed92c003d8fc600F"')

  expect(
    getContractAddress({
      from: '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b',
      nonce: 69420n,
    }),
  ).toMatchInlineSnapshot('"0xDf2e056f7062790dF95A472f691670717Ae7b1B6"')
})

test.todo('gets contract address (CREATE2)')
