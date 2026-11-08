import { Hex } from 'ox'
import type { Address } from 'ox'
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

/**
 * Deployment bytecode of a contract that emits every call as a log with two
 * topics: calldata words 0 and 1 are the topics, and the rest of the calldata
 * is the log data. Use it to emit logs the test contracts cannot, such as
 * anonymous events.
 */
export const loggerBytecode =
  '0x601580600b6000396000f360403603806040600037602035600035826000a200'

/** Emits a log with two `topics` and `data` from a deployed logger contract. */
export async function emitLog(
  client: Client.Client,
  options: {
    address: Address.Address
    data?: Hex.Hex | undefined
    topics: readonly [Hex.Hex, Hex.Hex]
  },
): Promise<Hex.Hex> {
  const { address, data = '0x', topics } = options
  const hash = await client.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: constants.accounts[0].address,
        to: address,
        data: Hex.concat(...topics, data),
      },
    ],
  })
  await Actions.block.mine(client, { blocks: 1 })
  return hash
}
