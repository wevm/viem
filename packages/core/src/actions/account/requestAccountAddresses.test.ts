import { expect, test } from 'vitest'

import { walletProvider } from '../../../../test/src/utils'
import { InjectedProvider } from '../../providers/wallet/injected'

import { requestAccountAddresses } from './requestAccountAddresses'

test('fetches block number', async () => {
  expect(await requestAccountAddresses(walletProvider! as InjectedProvider))
    .toMatchInlineSnapshot(`
      [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      ]
    `)
})
