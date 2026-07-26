import { Value } from 'viem/utils'

import { client } from './client.js'

export async function sendPayment(to: `0x${string}`, amountEther: string) {
  return client.transaction.sendSync({
    to,
    value: Value.fromEther(amountEther),
  })
}
