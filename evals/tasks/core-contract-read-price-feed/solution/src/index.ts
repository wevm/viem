import { Actions, type Client } from 'viem'
import type { Address } from 'viem/utils'
import { priceFeedAbi } from './abi.js'

export function getLatestRound(
  client: Client.Client,
  options: getLatestRound.Options,
) {
  return Actions.contract.read(client, {
    abi: priceFeedAbi,
    address: options.feed,
    functionName: 'latestRoundData',
  })
}

export declare namespace getLatestRound {
  type Options = {
    feed: Address.Address
  }
}
