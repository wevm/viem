import { Actions, type Client } from 'viem'
import { mainnet } from 'viem/chains'
import type { Address } from 'viem/utils'
import { usdc } from 'viem/tokens'

export async function approveUsdcSpender(
  client: Client.Client,
  options: approveUsdcSpender.Options,
): Promise<void> {
  const { amount, spender } = options
  await Actions.token.approveSync(client, {
    amount,
    spender,
    token: usdc(mainnet.id).address,
  })
}

export declare namespace approveUsdcSpender {
  type Options = {
    amount: bigint
    spender: Address.Address
  }
}

export async function getUsdcAllowance(
  client: Client.Client,
  options: getUsdcAllowance.Options,
): Promise<bigint> {
  const { owner, spender } = options
  const { amount } = await Actions.token.getAllowance(client, {
    account: owner,
    spender,
    token: usdc(mainnet.id).address,
  })
  return amount
}

export declare namespace getUsdcAllowance {
  type Options = {
    owner: Address.Address
    spender: Address.Address
  }
}

export async function spendUsdcAllowance(
  client: Client.Client,
  options: spendUsdcAllowance.Options,
): Promise<void> {
  const { amount, owner, recipient } = options
  await Actions.token.transferSync(client, {
    amount,
    from: owner,
    to: recipient,
    token: usdc(mainnet.id).address,
  })
}

export declare namespace spendUsdcAllowance {
  type Options = {
    amount: bigint
    owner: Address.Address
    recipient: Address.Address
  }
}
