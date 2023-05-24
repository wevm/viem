import { test } from 'vitest'

import { wagmiContractConfig } from '../../_test/abis.js'
import { accounts } from '../../_test/constants.js'
import {
  publicClient,
  walletClient,
  walletClientWithAccount,
} from '../../_test/utils.js'
import { estimateContractGas } from './estimateContractGas.js'

test('publicClient', () => {
  estimateContractGas(publicClient, {
    ...wagmiContractConfig,
    functionName: 'mint',
    args: [69420n],
    account: accounts[0].address,
  })
})

test('wallet client without account', () => {
  estimateContractGas(walletClient, {
    ...wagmiContractConfig,
    functionName: 'mint',
    args: [69420n],
    account: accounts[0].address,
  })
})

test('wallet client with account', () => {
  estimateContractGas(walletClientWithAccount, {
    ...wagmiContractConfig,
    functionName: 'mint',
    args: [69420n],
  })
})
