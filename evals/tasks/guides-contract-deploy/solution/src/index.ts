import { Actions, type Client } from 'viem'
import type { Abi } from 'viem/utils'

export async function deploy<const abi extends Abi.Abi>(
  client: Client.Client,
  options: deploy.Options<abi>,
) {
  const receipt = await Actions.contract.deploySync<
    Client.Client['chain'],
    abi
  >(client, options)
  if (!receipt.contractAddress) throw new Error('contract not deployed')
  return receipt.contractAddress
}

export declare namespace deploy {
  type Options<abi extends Abi.Abi> = Actions.contract.deploySync.Options<abi>
}
