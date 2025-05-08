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
  ).rejects.toThrowError('exceeds transaction sender account balance')
})
