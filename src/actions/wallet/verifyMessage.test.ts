import { expect, test } from 'vitest'

import { accounts, walletClient } from '../../_test'
import { getAccount, toHex } from '../../utils'
import { getAccount as getEthersAccount } from '../../ethers'

import { signMessage } from './signMessage'
import { hashMessage, Wallet } from 'ethers@6'
import { verifyMessage } from './verifyMessage'

test('sign message', async () => {
  const data = 'hello world'
  const signature = await signMessage(walletClient!, {
    account: getAccount(accounts[0].address),
    data: data,
  })
  expect(
    verifyMessage(walletClient!, {
      messageHash: toHex(hashMessage(data)),
      signature: signature,
      address: accounts[0].address,
    }),
  ).toBeTruthy()
})

test('sign message ethers', async () => {
  const data = 'hello world'
  const wallet = new Wallet(accounts[0].privateKey)
  const account = getEthersAccount(wallet)
  const signature = await signMessage(walletClient!, {
    account,
    data: data,
  })
  expect(
    verifyMessage(walletClient!, {
      messageHash: toHex(hashMessage(data)),
      signature: signature,
      address: account.address,
    }),
  ).toBeTruthy()
})