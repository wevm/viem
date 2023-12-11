import { expect, test } from 'vitest'
import { accounts } from '../../../../test/src/constants.js'
import { optimismClient } from '../../../../test/src/opStack.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { getTransactionReceipt, mine } from '../../../actions/index.js'
import {
  http,
  createClient,
  decodeEventLog,
  parseEther,
} from '../../../index.js'
import { goerli } from '../../index.js'
import { l2ToL1MessagePasserAbi } from '../abis.js'
import { baseGoerli } from '../chains.js'
import { buildInitiateWithdrawal } from './buildInitiateWithdrawal.js'
import { initiateWithdrawal } from './initiateWithdrawal.js'

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

test.only('e2e (goerli)', async () => {
  const account = privateKeyToAccount(
    process.env.VITE_ACCOUNT_PRIVATE_KEY as `0x${string}`,
  )

  const client_baseGoerli = createClient({
    account,
    chain: baseGoerli,
    transport: http(),
  })
  const client_goerli = createClient({
    account,
    chain: goerli,
    transport: http(),
  })

  const request = await buildInitiateWithdrawal(client_goerli, {
    to: account.address,
    value: 69n,
  })

  const hash = await initiateWithdrawal(client_baseGoerli, request)
  expect(hash).toBeDefined()

  console.log('l2 hash', hash)
})
