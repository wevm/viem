import {
  createPublicClient,
  createWalletClient,
  formatEther,
  http,
  parseEther,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

const rpcUrl = 'http://anvil:8545'

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(rpcUrl),
})

export async function getEthBalance(address: `0x${string}`): Promise<string> {
  const balance = await publicClient.getBalance({ address })
  return formatEther(balance)
}

export async function sendPayment(
  privateKey: `0x${string}`,
  to: `0x${string}`,
  amountEther: string,
) {
  const account = privateKeyToAccount(privateKey)
  const walletClient = createWalletClient({
    account,
    chain: mainnet,
    transport: http(rpcUrl),
  })
  const hash = await walletClient.sendTransaction({
    to,
    value: parseEther(amountEther),
  })
  return publicClient.waitForTransactionReceipt({ hash })
}

export async function getLatestBlockNumber(): Promise<bigint> {
  return publicClient.getBlockNumber()
}
