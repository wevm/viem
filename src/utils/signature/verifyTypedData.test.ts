import type { Address } from 'abitype'
import { expect, test } from 'vitest'

import { accounts, typedData } from '~test/src/constants.js'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { signTypedData } from '../../actions/index.js'
import { verifyTypedData } from './verifyTypedData.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  expect(
    await verifyTypedData({
      ...typedData.basic,
      address: accounts[0].address,
      primaryType: 'Mail',
      signature:
        '0x32f3d5975ba38d6c2fba9b95d5cbed1febaa68003d3d588d51f2de522ad54117760cfc249470a75232552e43991f53953a3d74edf6944553c6bef2469bb9e5921b',
    }),
  ).toBeTruthy()

  expect(
    await verifyTypedData({
      ...typedData.complex,
      address: accounts[0].address,
      primaryType: 'Mail',
      signature:
        '0xc4d8bcda762d35ea79d9542b23200f46c2c1899db15bf929bbacaf609581db0831538374a01206517edd934e474212a0f1e2d62e9a01cd64f1cf94ea2e0988491c',
    }),
  ).toBeTruthy()
})

test('https://github.com/wevm/viem/issues/2306', async () => {
  const typedData = (address: Address) =>
    ({
      types: {
        WalletData: [{ name: 'address', type: 'address' }],
      },
      message: {
        address,
      },
      primaryType: 'WalletData',
    }) as const

  const address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
  const nonChecksumAddress = address.toLowerCase() as `0x${string}`
  const invalidChecksumAddress = address.replace('f', 'F') as `0x${string}`

  // ✅ Successfully signs with valid checksum address.
  const signature = await signTypedData(client, {
    ...typedData(address),
    account: address,
  })

  // ✅ Successfully signs with non-checksum address.
  const signature_2 = await signTypedData(client, {
    ...typedData(nonChecksumAddress),
    account: nonChecksumAddress,
  })
  expect(signature_2).toEqual(signature)

  // ❌ Throws when invalid checksum address provided.
  await expect(() =>
    signTypedData(client, {
      ...typedData(invalidChecksumAddress),
      account: invalidChecksumAddress,
    }),
  ).rejects.toMatchInlineSnapshot(`
    [InvalidAddressError: Address "0xF39Fd6e51aad88F6F4ce6aB8827279cffFb92266" is invalid.

    - Address must be a hex value of 20 bytes (40 hex characters).
    - Address must match its checksum counterpart.

    Version: viem@x.y.z]
  `)

  // ✅ Successfully verifies with valid checksum address.
  expect(
    await verifyTypedData({
      ...typedData(address),
      signature,
      address: address,
    }),
  ).toBeTruthy()

  // ✅ Successfully verifies with non-checksum address.
  expect(
    await verifyTypedData({
      ...typedData(nonChecksumAddress),
      signature,
      address: nonChecksumAddress,
    }),
  ).toBeTruthy()

  // ❌ Throws when invalid checksum address provided.
  await expect(() =>
    verifyTypedData({
      ...typedData(invalidChecksumAddress),
      signature,
      address: invalidChecksumAddress,
    }),
  ).rejects.toMatchInlineSnapshot(`
    [InvalidAddressError: Address "0xF39Fd6e51aad88F6F4ce6aB8827279cffFb92266" is invalid.

    - Address must be a hex value of 20 bytes (40 hex characters).
    - Address must match its checksum counterpart.

    Version: viem@x.y.z]
  `)
})
