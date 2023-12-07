import { expect, test } from 'vitest'
import { accounts } from '../../../../test/src/constants.js'
import { optimismClient } from '../../../../test/src/opStack.js'
import { getTransactionReceipt, mine } from '../../../actions/index.js'
import { decodeEventLog, parseEther } from '../../../index.js'
import { l2ToL1MessagePasserAbi } from '../abis.js'
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
