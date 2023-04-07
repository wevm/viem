import { expect, test } from 'vitest'
import { accounts, typedData } from '../../_test/index.js'

import { verifyTypedData } from './verifyTypedData.js'

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
