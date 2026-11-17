// wevm/viem#1053: a function returning a contract instance, not a `const` — the return
// type is inferred at the function boundary.
import { Client, Contract, http, publicActions } from 'viem'
import { mainnet } from 'viem/chains'
import { Abi } from 'viem/utils'

const abi = Abi.from([
  'function getToken() view returns (address tokenAddress)',
])

export function getDeployedContract(client: ReturnType<typeof makeClient>) {
  return Contract.from({
    abi,
    address: '0x0000000000000000000000000000000000000000',
    client,
  })
}

function makeClient() {
  return Client.create({ chain: mainnet, transport: http() }).extend(
    publicActions(),
  )
}
