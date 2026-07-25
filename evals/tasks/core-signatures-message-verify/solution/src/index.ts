import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
  const message = 'viem evals: prove account ownership'
  const signature = await Account.fromPrivateKey(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ).signMessage({ message })
  const [verified, changedMessage, wrongAddress] = await Promise.all([
    Actions.verifyMessage(client, { address, message, signature }),
    Actions.verifyMessage(client, {
      address,
      message: 'viem evals: prove account 0wnership',
      signature,
    }),
    Actions.verifyMessage(client, {
      address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      message,
      signature,
    }),
  ])
  return { changedMessage, signature, verified, wrongAddress }
}
