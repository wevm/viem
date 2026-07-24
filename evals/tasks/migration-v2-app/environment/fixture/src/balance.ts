import { formatEther } from 'viem'

import { publicClient } from './client.js'

export async function getEthBalance(address: `0x${string}`) {
  const wei = await publicClient.getBalance({ address })
  return { wei, ether: formatEther(wei) }
}
