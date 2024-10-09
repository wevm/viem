import { expect, test } from 'vitest'

import { accounts } from '../../../test/src/constants.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { lineaSepolia } from '../chains.js'
import { estimateGas } from './estimateGas.js'

const client = createClient({
  chain: lineaSepolia,
  transport: http(),
})

test('default', async () => {
  const { baseFeePerGas, gasLimit, priorityFeePerGas } = await estimateGas(
    client,
    {
      account: '0x0000000000000000000000000000000000000000',
      to: '0x0000000000000000000000000000000000000000',
      value: parseEther('0.0001'),
    },
  )
  expect(baseFeePerGas).toBeGreaterThan(0n)
  expect(gasLimit).toBe(21000n)
  expect(priorityFeePerGas).toBeGreaterThan(0n)
})

test('error: insufficient balance', async () => {
  await expect(() =>
    estimateGas(client, {
      account: accounts[0].address,
      to: '0x0000000000000000000000000000000000000000',
      value: parseEther('0.0001'),
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [CallExecutionError: The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.

    This error could arise when the account does not have enough funds to:
     - pay for the total gas fee,
     - pay for the value to send.
     
    The cost of the transaction is calculated as \`gas * gas fee + value\`, where:
     - \`gas\` is the amount of gas needed for transaction to execute,
     - \`gas fee\` is the gas fee,
     - \`value\` is the amount of ether to send to the recipient.
     
    Raw Call Arguments:
      from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      to:     0x0000000000000000000000000000000000000000
      value:  0.0001 ETH

    Details: transaction up-front cost 0x5af31a7dba00 exceeds transaction sender account balance 0x0
    Version: viem@x.y.z]
  `)
})
