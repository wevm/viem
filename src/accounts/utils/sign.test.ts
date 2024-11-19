import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'

import { verifyHash } from '../../utils/signature/verifyHash.js'
import { sign } from './sign.js'

test('default', async () => {
  const signature_1 = await sign({
    hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
    privateKey: accounts[0].privateKey,
  })
  expect(
    await verifyHash({
      address: accounts[0].address,
      hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
      signature: signature_1,
    }),
  ).toBe(true)

  const signature_2 = await sign({
    hash: '0x9a74cb859ad30835ffb2da406423233c212cf6dd78e6c2c98b0c9289568954ae',
    privateKey: accounts[0].privateKey,
  })
  expect(
    await verifyHash({
      address: accounts[0].address,
      hash: '0x9a74cb859ad30835ffb2da406423233c212cf6dd78e6c2c98b0c9289568954ae',
      signature: signature_2,
    }),
  ).toBe(true)
})

test('args: to (hex)', async () => {
  const signature_1 = await sign({
    hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
    privateKey: accounts[0].privateKey,
    to: 'hex',
  })
  expect(
    await verifyHash({
      address: accounts[0].address,
      hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
      signature: signature_1,
    }),
  ).toBe(true)

  const signature_2 = await sign({
    hash: '0x9a74cb859ad30835ffb2da406423233c212cf6dd78e6c2c98b0c9289568954ae',
    privateKey: accounts[0].privateKey,
    to: 'hex',
  })
  expect(
    await verifyHash({
      address: accounts[0].address,
      hash: '0x9a74cb859ad30835ffb2da406423233c212cf6dd78e6c2c98b0c9289568954ae',
      signature: signature_2,
    }),
  ).toBe(true)
})

test('args: to (bytes)', async () => {
  const signature_1 = await sign({
    hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
    privateKey: accounts[0].privateKey,
    to: 'bytes',
  })
  expect(
    await verifyHash({
      address: accounts[0].address,
      hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
      signature: signature_1,
    }),
  ).toBe(true)

  const signature_2 = await sign({
    hash: '0x9a74cb859ad30835ffb2da406423233c212cf6dd78e6c2c98b0c9289568954ae',
    privateKey: accounts[0].privateKey,
    to: 'bytes',
  })
  expect(
    await verifyHash({
      address: accounts[0].address,
      hash: '0x9a74cb859ad30835ffb2da406423233c212cf6dd78e6c2c98b0c9289568954ae',
      signature: signature_2,
    }),
  ).toBe(true)
})
