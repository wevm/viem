import { expect, test } from 'vitest'

import type { Address } from 'abitype'
import {
  getTransactionReceipt,
  waitForTransactionReceipt,
} from '~viem/actions/index.js'
import { sendTransaction } from '~viem/zksync/actions/sendTransaction.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { zkSyncChainL2, zkSyncChainL3 } from '../../../chains/index.js'
import { createClient } from '../../../clients/createClient.js'
import { http } from '../../../clients/transports/http.js'
import { publicActionsL2 } from '../../decorators/publicL2.js'
import { getClaimFailedDepositArgs } from './claimFailedDeposit.js'

const account = privateKeyToAccount(
  '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110',
)

const clientL2 = createClient({
  chain: zkSyncChainL2,
  transport: http(),
  account,
}).extend(publicActionsL2())

const clientL3 = createClient({
  chain: zkSyncChainL3,
  transport: http(),
  account,
}).extend(publicActionsL2())

test('claim deposit fee - ETH', async () => {
  const x = await getClaimFailedDepositArgs(clientL2, {
    depositHash:
      '0xd6a5d4da88ee0d96306468e957dbdfc2b3901b944c702c4c4f1695d8c86c15ca',
  })

  const hash = await sendTransaction(clientL2, x)

  await waitForTransactionReceipt(clientL2, { hash })

  expect(
    await getTransactionReceipt(clientL2, {
      hash,
    }),
  ).toBeDefined()
})

test('claim deposit fee - ETH', async () => {
  const args = await getClaimFailedDepositArgs(clientL2, {
    depositHash:
      '0xd6a5d4da88ee0d96306468e957dbdfc2b3901b944c702c4c4f1695d8c86c15ca',
  })

  const hash = await sendTransaction(clientL2, args)

  await waitForTransactionReceipt(clientL2, { hash })

  expect(
    await getTransactionReceipt(clientL2, {
      hash,
    }),
  ).toBeDefined()
})

test('should throw an error when trying to claim successful deposit', async () => {
  const args = await getClaimFailedDepositArgs(clientL2, {
    depositHash:
      '0xd6a5d4da88ee0d96306468e957dbdfc2b3901b944c702c4c4f1695d8c86c15ca',
  })

  const hash = await sendTransaction(clientL2, args)

  await waitForTransactionReceipt(clientL2, { hash })

  expect(
    await getTransactionReceipt(clientL2, {
      hash,
    }),
  ).toBeDefined()
})

test('should throw an error when trying to claim successful deposit', async () => {
  const args = await getClaimFailedDepositArgs(clientL3, {
    depositHash:
      '0xd6a5d4da88ee0d96306468e957dbdfc2b3901b944c702c4c4f1695d8c86c15ca',
  })

  const hash = await sendTransaction(clientL3, args)

  await waitForTransactionReceipt(clientL3, { hash })

  expect(
    await getTransactionReceipt(clientL3, {
      hash,
    }),
  ).toBeDefined()
})
