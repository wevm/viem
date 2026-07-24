import type { Client } from 'viem'
import { Actions } from 'viem/tempo'
import type { Address } from 'viem/utils'

export async function createToken(
  client: Client.Client,
  options: createToken.Options,
) {
  const { name, symbol } = options
  const { token } = await Actions.token.createSync(client, {
    currency: 'USD',
    name,
    symbol,
  })
  return { token }
}

export async function grantMintRole(
  client: Client.Client,
  options: grantMintRole.Options,
) {
  const { grantee, token } = options
  return Actions.token.grantRolesSync(client, {
    roles: ['issuer'],
    to: grantee,
    token,
  })
}

export async function hasMintRole(
  client: Client.Client,
  options: hasMintRole.Options,
) {
  return Actions.token.hasRole(client, { ...options, role: 'issuer' })
}

export async function mintTokens(
  client: Client.Client,
  options: mintTokens.Options,
) {
  return Actions.token.mintSync(client, options)
}

export async function revokeMintRole(
  client: Client.Client,
  options: revokeMintRole.Options,
) {
  const { grantee, token } = options
  return Actions.token.revokeRolesSync(client, {
    from: grantee,
    roles: ['issuer'],
    token,
  })
}

export declare namespace createToken {
  type Options = {
    name: string
    symbol: string
  }
}

export declare namespace grantMintRole {
  type Options = {
    grantee: Address.Address
    token: Address.Address
  }
}

export declare namespace hasMintRole {
  type Options = {
    account: Address.Address
    token: Address.Address
  }
}

export declare namespace mintTokens {
  type Options = {
    amount: bigint
    to: Address.Address
    token: Address.Address
  }
}

export declare namespace revokeMintRole {
  type Options = {
    grantee: Address.Address
    token: Address.Address
  }
}
