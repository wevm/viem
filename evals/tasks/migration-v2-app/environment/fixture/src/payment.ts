import { parseEther } from 'viem'

import { client } from './client.js'

export async function sendPayment(to: `0x${string}`, amountEther: string) {
  const hash = await client.sendTransaction({
    to,
    value: parseEther(amountEther),
  })
  return client.waitForTransactionReceipt({ hash })
}
