import { expect, test } from 'vitest'
import { accounts } from '../../../../test/src/constants.js'
import { optimismClient } from '../../../../test/src/opStack.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import {
  getTransactionReceipt,
  mine,
  waitForTransactionReceipt,
} from '../../../actions/index.js'
import {
  http,
  createClient,
  decodeEventLog,
  parseEther,
} from '../../../index.js'
import { sepolia } from '../../index.js'
import { l2ToL1MessagePasserAbi } from '../abis.js'
import { optimismSepolia } from '../chains.js'
import { getL2Output, getWithdrawalMessages } from '../index.js'
import { buildInitiateWithdrawal } from './buildInitiateWithdrawal.js'
import { buildProveWithdrawal } from './buildProveWithdrawal.js'
import { initiateWithdrawal } from './initiateWithdrawal.js'
import { waitForL2Output } from './waitForL2Output.js'

test('default', async () => {
  const hash = await initiateWithdrawal(optimismClient, {
    account: accounts[0].address,
    args: {
      data: '0xdeadbeef',
      gas: 21000n,
      to: accounts[0].address,
      value: parseEther('1'),
    },
  })
  expect(hash).toBeDefined()

  await mine(optimismClient, { blocks: 1 })

  const receipt = await getTransactionReceipt(optimismClient, {
    hash,
  })
  expect(receipt).toBeDefined()

  const log = decodeEventLog({
    abi: l2ToL1MessagePasserAbi,
    eventName: 'MessagePassed',
    ...receipt.logs[0],
  })
  const {
    args: { nonce: _, withdrawalHash: __, ...args },
  } = log
  expect(args).toMatchInlineSnapshot(`
    {
      "data": "0xdeadbeef",
      "gasLimit": 21000n,
      "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "target": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "value": 1000000000000000000n,
    }
  `)
})

test.skip('e2e (sepolia)', async () => {
  const account = privateKeyToAccount(
    process.env.VITE_ACCOUNT_PRIVATE_KEY as `0x${string}`,
  )

  const client_opSepolia = createClient({
    account,
    chain: optimismSepolia,
    transport: http(),
  })
  const client_sepolia = createClient({
    account,
    chain: sepolia,
    transport: http(),
  })

  const withdrawalRequest = await buildInitiateWithdrawal(client_sepolia, {
    to: account.address,
    value: 69n,
  })

  const withdrawalHash = await initiateWithdrawal(
    client_opSepolia,
    withdrawalRequest,
  )
  expect(withdrawalHash).toBeDefined()

  const withdrawalReceipt = await waitForTransactionReceipt(client_opSepolia, {
    hash: withdrawalHash,
  })

  await waitForL2Output(client_sepolia, {
    l2BlockNumber: withdrawalReceipt.blockNumber,
    targetChain: client_opSepolia.chain,
  })

  // Extract withdrawal message from the receipt.
  const [message] = getWithdrawalMessages(withdrawalReceipt)

  // Retrieve the L2 output proposal that occurred after the receipt block.
  const output = await getL2Output(client_sepolia, {
    l2BlockNumber: withdrawalReceipt.blockNumber,
    targetChain: client_opSepolia.chain,
  })

  const proveWithdrawalRequest = await buildProveWithdrawal(client_opSepolia, {
    message,
    output,
  })

  console.log(proveWithdrawalRequest)
}, 600000)
