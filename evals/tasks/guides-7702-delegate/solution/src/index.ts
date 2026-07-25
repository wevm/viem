import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({
  account: Account.fromPrivateKey(
    '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  ),
  chain: mainnet,
  pollingInterval: 100,
  transport: http('http://anvil:8545'),
})

const bytecode = '0x69602a60005260206000f3600052600a6016f3'

export async function example() {
  const receipt = await Actions.contract.deploySync(client, {
    abi: [],
    bytecode,
  })
  const delegate = receipt.contractAddress
  if (!delegate) throw new Error('delegate not deployed')

  const authorization = await Actions.wallet.signAuthorization(client, {
    address: delegate,
    executor: 'self',
  })
  await Actions.transaction.sendSync(client, {
    authorizationList: [authorization],
    to: client.account.address,
    type: 'eip7702',
  })

  const delegation = await Actions.address.getDelegation(client, {
    address: client.account.address,
  })
  return { delegate, delegation }
}
