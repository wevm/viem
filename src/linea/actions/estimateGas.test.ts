import { Hex } from 'ox'
import { expect, test } from 'vitest'

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
      account: Hex.random(20),
      to: '0x0000000000000000000000000000000000000000',
      value: parseEther('0.0001'),
    }),
  ).rejects.toThrowError(
    // Linea reports the missing balance as "up-front cost … exceeds …
    // sender account balance" for zero-value calls, and as a Besu
    // "Cannot remove … wei from account" internal error once a non-zero
    // `value` reaches the transfer step.
    /exceeds transaction sender account balance|Cannot remove/,
  )
})

test('args: stateOverride', async () => {
  // Same unfunded-sender call as the test above — the balance override is
  // what lets it succeed.
  const account = Hex.random(20)
  const { baseFeePerGas, gasLimit, priorityFeePerGas } = await estimateGas(
    client,
    {
      account,
      to: '0x0000000000000000000000000000000000000000',
      value: parseEther('0.0001'),
      stateOverride: [
        {
          address: account,
          balance: parseEther('1'),
        },
      ],
    },
  )
  expect(baseFeePerGas).toBeGreaterThan(0n)
  expect(gasLimit).toBe(21000n)
  expect(priorityFeePerGas).toBeGreaterThan(0n)
})
