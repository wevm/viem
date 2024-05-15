import { expect, test } from 'vitest'

import { accounts, address } from '~test/src/constants.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { impersonateAccount } from './impersonateAccount.js'
import { stopImpersonatingAccount } from './stopImpersonatingAccount.js'

const client = anvilMainnet.getClient()

test('impersonates account', async () => {
  await expect(
    sendTransaction(client, {
      account: address.vitalik,
      to: accounts[0].address,
      value: parseEther('1'),
    }),
  ).rejects.toThrowError('No Signer available')

  await expect(
    impersonateAccount(client, { address: address.vitalik }),
  ).resolves.toBeUndefined()

  expect(
    await sendTransaction(client, {
      account: address.vitalik,
      to: accounts[0].address,
      value: parseEther('1'),
    }),
  ).toBeDefined()

  await stopImpersonatingAccount(client, { address: address.vitalik })
})
