import { JsonRpcProvider, Wallet, formatEther, parseEther } from 'ethers'

const rpcUrl = 'http://anvil:8545'

const provider = new JsonRpcProvider(rpcUrl)

export async function getBalance(address: `0x${string}`): Promise<string> {
  const balance = await provider.getBalance(address)
  return formatEther(balance)
}

export async function sendPayment(
  privateKey: `0x${string}`,
  to: `0x${string}`,
  amountEther: string,
) {
  const wallet = new Wallet(privateKey, provider)
  const tx = await wallet.sendTransaction({
    to,
    value: parseEther(amountEther),
  })
  return tx.wait()
}

export async function getBlockNumber(): Promise<number> {
  return provider.getBlockNumber()
}
