import type { Client } from 'viem'
import { Actions } from 'viem/tempo'
import type { Address } from 'viem/utils'

export async function setupGatedToken(client: Client.Client) {
  const account = client.account
  if (!account) throw new Error('account is required')
  const admin = account.address

  const { token } = await Actions.token.createSync(client, {
    currency: 'USD',
    name: 'Gated USD',
    symbol: 'GUSD',
  })
  await Actions.token.grantRolesSync(client, {
    roles: ['issuer'],
    to: admin,
    token,
  })
  await Actions.token.mintSync(client, {
    amount: 1_000_000_000n,
    to: admin,
    token,
  })

  const { policyId } = await Actions.policy.createSync(client, {
    addresses: [admin],
    admin,
    type: 'whitelist',
  })
  await Actions.token.changeTransferPolicySync(client, { policyId, token })

  return { policyId, token }
}

export async function addMember(
  client: Client.Client,
  options: addMember.Options,
) {
  const { member, policyId } = options
  await Actions.policy.modifyWhitelistSync(client, {
    address: member,
    allowed: true,
    policyId,
  })
}

export async function transferGated(
  client: Client.Client,
  options: transferGated.Options,
) {
  const { receipt } = await Actions.token.transferSync(client, options)
  return { receipt }
}

export declare namespace addMember {
  type Options = {
    member: Address.Address
    policyId: bigint
  }
}

export declare namespace transferGated {
  type Options = {
    amount: bigint
    to: Address.Address
    token: Address.Address
  }
}
