import { describe, expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { baseZkSyncTestClient } from '~test/src/zksync.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { parseGwei } from '../../../utils/unit/parseGwei.js'
import { zkSyncSepoliaTestnet } from '../index.js'
import { sendTransaction } from './sendTransaction.js'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

describe('sendTransaction', () => {
  test('eip712', async () => {
    // const spy = vi.spyOn(baseZkSyncTestClient, 'request') as MockInstance
    // spy.mockImplementation((request) => transportRequestMock(request))

    expect(
      await sendTransaction(baseZkSyncTestClient, {
        chain: zkSyncSepoliaTestnet,
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
    // spy.mockRestore()
  })
})
