import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Siwe } from 'viem/utils'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const message = Siwe.createMessage({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    chainId: 1,
    domain: 'example.com',
    nonce: 'foobarbaz12',
    uri: 'https://example.com/login',
    version: '1',
  })
  const signature = await Account.fromPrivateKey(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ).signMessage({ message })
  const signature_other = await Account.fromPrivateKey(
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  ).signMessage({ message })
  const [verified, alteredNonce, wrongSignature] = await Promise.all([
    Actions.verifySiweMessage(client, {
      message,
      nonce: 'foobarbaz12',
      signature,
    }),
    Actions.verifySiweMessage(client, {
      message,
      nonce: 'deadbeef00',
      signature,
    }),
    Actions.verifySiweMessage(client, {
      message,
      nonce: 'foobarbaz12',
      signature: signature_other,
    }),
  ])
  return { alteredNonce, message, signature, verified, wrongSignature }
}
