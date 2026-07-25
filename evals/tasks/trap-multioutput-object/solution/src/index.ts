import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Abi } from 'viem/utils'

const abi = Abi.from([
  'function eip712Domain() view returns (bytes1 fields, string name, string version, uint256 chainId, address verifyingContract, bytes32 salt, uint256[] extensions)',
])

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const { chainId, name, version } = await Actions.contract.read(client, {
    abi,
    address: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3',
    functionName: 'eip712Domain',
  })
  return { chainId, name, version }
}
