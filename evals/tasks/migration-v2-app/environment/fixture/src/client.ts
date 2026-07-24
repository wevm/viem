import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

const rpcUrl = 'http://anvil:8545'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(rpcUrl),
})

export function getWalletClient(privateKey: `0x${string}`) {
  return createWalletClient({
    account: privateKeyToAccount(privateKey),
    chain: mainnet,
    transport: http(rpcUrl),
  })
}
