import type { Client } from 'viem'
import { Actions } from 'viem/tempo'
import type { Address } from 'viem/utils'

export async function addLiquidity(
  client: Client.Client,
  options: addLiquidity.Options,
) {
  const { userToken, validatorToken, validatorTokenAmount } = options
  const account = client.account
  if (!account) throw new Error('account is required')
  const { liquidity, receipt } = await Actions.amm.mintSync(client, {
    to: account.address,
    userTokenAddress: userToken,
    validatorTokenAddress: validatorToken,
    validatorTokenAmount,
  })
  return { liquidity, receipt }
}

export async function getPoolState(
  client: Client.Client,
  options: getPoolState.Options,
) {
  return Actions.amm.getPool(client, options)
}

export async function getLpBalance(
  client: Client.Client,
  options: getLpBalance.Options,
) {
  return Actions.amm.getLiquidityBalance(client, options)
}

export async function removeLiquidity(
  client: Client.Client,
  options: removeLiquidity.Options,
) {
  const account = client.account
  if (!account) throw new Error('account is required')
  const liquidity = await Actions.amm.getLiquidityBalance(client, {
    address: account.address,
    ...options,
  })
  const { receipt } = await Actions.amm.burnSync(client, {
    liquidity,
    to: account.address,
    ...options,
  })
  return { receipt }
}

export declare namespace addLiquidity {
  type Options = {
    userToken: Address.Address
    validatorToken: Address.Address
    validatorTokenAmount: bigint
  }
}

export declare namespace getLpBalance {
  type Options = {
    address: Address.Address
    userToken: Address.Address
    validatorToken: Address.Address
  }
}

export declare namespace getPoolState {
  type Options = {
    userToken: Address.Address
    validatorToken: Address.Address
  }
}

export declare namespace removeLiquidity {
  type Options = {
    userToken: Address.Address
    validatorToken: Address.Address
  }
}
