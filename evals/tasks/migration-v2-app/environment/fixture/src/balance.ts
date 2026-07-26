import { formatEther } from 'viem'

import { client } from './client.js'

export async function getEthBalance(address: `0x${string}`) {
  const wei = await client.getBalance({ address })
  return { wei, ether: formatEther(wei) }
}
