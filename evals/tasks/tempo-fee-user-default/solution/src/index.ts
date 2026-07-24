import type { Client } from 'viem'
import { Actions } from 'viem/tempo'
import type { Address } from 'viem/utils'

const pathUsd = '0x20c0000000000000000000000000000000000000'

export async function setDefaultFeeToken(
  client: Client.Client,
  options: setDefaultFeeToken.Options,
) {
  return Actions.fee.setUserTokenSync(client, options)
}

export async function getDefaultFeeToken(client: Client.Client) {
  return Actions.fee.getUserToken(client)
}

export async function transferWithDefaultFee(
  client: Client.Client,
  options: transferWithDefaultFee.Options,
) {
  const { amount, to } = options
  return Actions.token.transferSync(client, {
    amount: { decimals: 6, formatted: amount },
    to,
    token: pathUsd,
  })
}

export declare namespace setDefaultFeeToken {
  type Options = {
    token: Address.Address
  }
}

export declare namespace transferWithDefaultFee {
  type Options = {
    amount: string
    to: Address.Address
  }
}
