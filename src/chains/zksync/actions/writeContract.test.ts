import { expect, test } from 'vitest'

import { greeterContract } from '~test/src/abis.js'
import { accounts } from '~test/src/constants.js'
import { privateKeyToAccount } from '~viem/accounts/privateKeyToAccount.js'
import { simulateContract } from '../../../actions/public/simulateContract.js'
import { createWalletClient } from '../../../clients/createWalletClient.js'
import { http } from '../../../clients/transports/http.js'
import { zkSyncTestnet } from '../index.js'

import { writeContract } from './writeContract.js'

test('writeContract on ZkSync with EIP712', async () => {
  const walletClient = createWalletClient({
    chain: zkSyncTestnet,
    transport: http(zkSyncTestnet.rpcUrls.default.http[0]),
  })
  const { request } = await simulateContract(walletClient, {
    ...greeterContract,
    account: privateKeyToAccount(accounts[0].privateKey),
    functionName: 'setGreeting',
    args: ['Viem ZkSync works!'],
    maxFeePerGas: 250000000n,
    maxPriorityFeePerGas: 0n,
    paymaster: '0xFD9aE5ebB0F6656f4b77a0E99dCbc5138d54b0BA',
    paymasterInput:
      '0x8c5a344500000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
    type: 'eip712',
    gasPerPubdata: 50000n,
  })
  expect(await writeContract(walletClient, request)).toBeDefined()
})
