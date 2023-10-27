import { describe, expect, test } from 'vitest'

import { accounts, localHttpUrl } from '~test/src/constants.js'
import type { TransactionRequestBase } from '~viem/index.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { createWalletClient } from '../../../clients/createWalletClient.js'
import { http } from '../../../clients/transports/http.js'
import { parseGwei } from '../../../utils/unit/parseGwei.js'
import { zkSyncTestnet } from '../../index.js'
import { signEip712Transaction as signTransaction } from './signTransaction.js'

const sourceAccount = accounts[0]

const base: TransactionRequestBase = {
  from: '0x0000000000000000000000000000000000000000',
  gas: 21000n,
  nonce: 785,
}

describe('custom (eip712)', () => {
  const walletClient = createWalletClient({
    chain: zkSyncTestnet,
    transport: http(localHttpUrl),
  })

  test('default', async () => {
    expect(
      await signTransaction(walletClient, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        chain: zkSyncTestnet,
        ...base,
        maxFeePerGas: parseGwei('20'),
        maxPriorityFeePerGas: parseGwei('2'),
        paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
        paymasterInput:
          '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
        type: 'eip712',
      }),
    ).toMatchInlineSnapshot(
      '"0x71f8d382031184773594008504a817c800825208808001820118808082011894000000000000000000000000000000000000000080c0b841a8ca2e89b2dafaa9364618fa672ac7418bfb5ff5a7006a2c837bccef6cbabee1761e7f411251ea8bbdb282c7b979f96490ff218cbf246e2538fd06ec707dfcfe1cf85b94fd9ae5ebb0f6656f4b77a0e99dcbc5138d54b0bab8448c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"',
    )
  })
})
