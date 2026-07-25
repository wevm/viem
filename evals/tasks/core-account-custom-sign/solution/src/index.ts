import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { PublicKey, Secp256k1, Signature } from 'viem/utils'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const privateKey =
    '0xf71f379f68c738d29b7a90474497eb9ce74c699bb9ada94bda359f8c2f101263'
  const account = Account.from({
    publicKey: PublicKey.toHex(Secp256k1.getPublicKey({ privateKey })),
    sign: ({ hash }) =>
      Signature.toHex(Secp256k1.sign({ payload: hash, privateKey })),
  })
  return Actions.transaction.sendSync(client, {
    account,
    to: '0x4242424242424242424242424242424242424242',
    value: 1_000_000_000_000_000_000n,
  })
}
