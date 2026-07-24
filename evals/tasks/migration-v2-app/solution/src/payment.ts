import { Value } from 'viem/utils'

import { getWalletClient, publicClient } from './client.js'

export async function sendPayment(
  privateKey: `0x${string}`,
  to: `0x${string}`,
  amountEther: string,
) {
  const walletClient = getWalletClient(privateKey)
  const hash = await walletClient.transaction.send({
    to,
    value: Value.fromEther(amountEther),
  })
  return publicClient.transaction.waitForReceipt({ hash }).receipt
}
