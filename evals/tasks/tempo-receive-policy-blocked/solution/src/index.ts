import type { Client } from 'viem'
import { Abis, Actions } from 'viem/tempo'
import { AbiEvent, type Address, type Hex } from 'viem/utils'

const pathUsd = '0x20c0000000000000000000000000000000000000'

export async function setBlockingPolicy(client: Client.Client) {
  const { receipt } = await Actions.receivePolicy.setSync(client, {
    claimer: 'sender',
    senderPolicyId: 'reject-all',
  })
  return { receipt }
}

export async function sendTokens(
  client: Client.Client,
  options: sendTokens.Options,
) {
  const { amount, to } = options
  const { receipt } = await Actions.token.transferSync(client, {
    amount: { decimals: 6, formatted: amount },
    to,
    token: pathUsd,
  })
  const [blocked] = AbiEvent.extractLogs(
    Abis.receivePolicyGuard,
    receipt.logs,
    {
      eventName: 'TransferBlocked',
      strict: true,
    },
  )
  if (!blocked) throw new Error('transfer was not blocked')
  return { claimReceipt: blocked.args.receipt, receipt }
}

export async function getBlockedAmount(
  client: Client.Client,
  options: getBlockedAmount.Options,
) {
  return Actions.receivePolicy.getBlockedBalance(client, {
    receipt: options.claimReceipt,
  })
}

export async function claimBlockedFunds(
  client: Client.Client,
  options: claimBlockedFunds.Options,
) {
  const { claimReceipt, to } = options
  const { receipt } = await Actions.receivePolicy.claimSync(client, {
    receipt: claimReceipt,
    to,
  })
  return { receipt }
}

export declare namespace claimBlockedFunds {
  type Options = {
    claimReceipt: Hex.Hex
    to: Address.Address
  }
}

export declare namespace getBlockedAmount {
  type Options = {
    claimReceipt: Hex.Hex
  }
}

export declare namespace sendTokens {
  type Options = {
    amount: string
    to: Address.Address
  }
}
