import { Value } from 'viem/utils'

import { publicClient } from './client.js'

export async function getEthBalance(address: `0x${string}`) {
  const wei = await publicClient.address.getBalance({ address })
  return { wei, ether: Value.formatEther(wei) }
}
