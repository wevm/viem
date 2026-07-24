import { parseEther } from 'viem'

import { getWalletClient, publicClient } from './client.js'

export async function sendPayment(
  privateKey: `0x${string}`,
  to: `0x${string}`,
  amountEther: string,
) {
  const walletClient = getWalletClient(privateKey)
  const hash = await walletClient.sendTransaction({
    to,
    value: parseEther(amountEther),
  })
  return publicClient.waitForTransactionReceipt({ hash })
}
