import type { Address, Hex } from 'ox'
import { Actions, Client } from 'viem'

import * as constants from './constants.js'

export type DeployOptions = {
  /** Contract deployment bytecode (with any constructor args already encoded). */
  bytecode: Hex.Hex
}

/**
 * Deploys a contract to an anvil instance and returns its address.
 *
 * Uses anvil's prefunded, unlocked account via `eth_sendTransaction`, mines a
 * block, then resolves the contract address from the receipt.
 *
 * TODO: switch to the `deployContract` wallet action once wallet actions land.
 */
export async function deploy(
  client: Client.Client,
  options: DeployOptions,
): Promise<{ address: Address.Address; blockNumber: bigint }> {
  const hash = await client.request({
    method: 'eth_sendTransaction',
    params: [{ from: constants.accounts[0].address, data: options.bytecode }],
  })

  await Actions.block.mine(client, { blocks: 1 })

  const { blockNumber, contractAddress } = await Actions.transaction.getReceipt(
    client,
    { hash },
  )
  if (!contractAddress) throw new Error('contract deployment failed.')
  return { address: contractAddress, blockNumber }
}
