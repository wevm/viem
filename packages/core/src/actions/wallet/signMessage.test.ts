import { expect, test } from 'vitest'

import { accounts, walletClient } from '../../../test'

import { signMessage } from './signMessage'

test('default', async () => {
  expect(
    await signMessage(walletClient!, {
      from: accounts[0].address,
      data: '0xdeadbeaf',
    }),
  ).toMatchInlineSnapshot(
    '"0x791703250f789557b30c2ed9066cdc9bfcfba4504583d417b61f07891c4c9ace5fa84cb97062712e6e614c29ad59c610e310123efdb40bd7a9c516ace2084cd01c"',
  )
})
