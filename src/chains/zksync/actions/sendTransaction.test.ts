import { describe, expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { baseZkSyncTestClient } from '~test/src/zksync.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { parseGwei } from '../../../utils/unit/parseGwei.js'
import { sendTransaction } from './sendTransaction.js'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

describe('sendTransaction', () => {
  test.skip('normal transaction (non-eip712)', async () => {
    expect(
      await sendTransaction(baseZkSyncTestClient, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        value: parseGwei('1'),
      }),
    ).toMatchInlineSnapshot(
      '"0x15bfe53dcfd7346105837a7a4b9df5b7914423dd4c607635b1fd8d1279990284"',
    )
  })

  // TODO we need to mock the eth_sendRawTransaction and assert that we got the expected payload.
  //      Because anvil does not support eip712, we can't test without mocking the eth_sendRawTransaction.
  test.skip('eip712', async () => {
    expect(
      await sendTransaction(baseZkSyncTestClient, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        maxFeePerGas: parseGwei('25'),
        maxPriorityFeePerGas: parseGwei('1'),
        gas: 158774n,
        value: parseGwei('1'),
        data: '0x01',
        paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
        paymasterInput:
          '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
        type: 'eip712',
        gasPerPubdata: 50000n,
      }),
    ).toBeDefined()
  })
})
