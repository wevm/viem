import type { Client } from 'viem'
import { Actions, VirtualAddress, VirtualMaster } from 'viem/tempo'
import type { Address, Hex } from 'viem/utils'

export async function registerMasterAddress(
  client: Client.Client,
  options: registerMasterAddress.Options,
) {
  const account = client.account
  if (!account) throw new Error('account is required')
  const mined = await VirtualMaster.mineSaltAsync({
    address: account.address,
    start: options.saltStart,
  })
  if (!mined) throw new Error('no valid salt found')
  return Actions.virtualAddress.registerMasterSync(client, {
    salt: mined.salt,
  })
}

export function deriveVirtualAddress(options: deriveVirtualAddress.Options) {
  return VirtualAddress.from(options)
}

export async function resolveVirtualAddress(
  client: Client.Client,
  options: resolveVirtualAddress.Options,
) {
  return Actions.virtualAddress.resolve(client, options)
}

export declare namespace deriveVirtualAddress {
  type Options = {
    masterId: Hex.Hex
    userTag: Hex.Hex
  }
}

export declare namespace registerMasterAddress {
  type Options = {
    saltStart: bigint
  }
}

export declare namespace resolveVirtualAddress {
  type Options = {
    address: Address.Address
  }
}
