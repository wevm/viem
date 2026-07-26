import { Value } from 'viem/utils'

import { client } from './client.js'

export async function getEthBalance(address: `0x${string}`) {
  const wei = await client.address.getBalance({ address })
  return { wei, ether: Value.formatEther(wei) }
}
