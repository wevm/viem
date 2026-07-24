import { Actions, type Client } from 'viem'
import { Abi, type Address } from 'viem/utils'

const eip5267Abi = Abi.from([
  'function eip712Domain() view returns (bytes1 fields, string name, string version, uint256 chainId, address verifyingContract, bytes32 salt, uint256[] extensions)',
])

export async function getSigningDomain(
  client: Client.Client,
  options: getSigningDomain.Options,
) {
  // Named multi-output results decode to an object keyed by output names.
  const { name, version, chainId } = await Actions.contract.read(client, {
    abi: eip5267Abi,
    address: options.token,
    functionName: 'eip712Domain',
  })
  return { name, version, chainId }
}

export declare namespace getSigningDomain {
  type Options = {
    token: Address.Address
  }
}
