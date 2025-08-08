import type { Address } from 'abitype'

export type BridgeContractAddresses = {
  erc20L1: Address
  sharedL1: Address
  sharedL2: Address
  l1Nullifier: Address | undefined
  l1NativeTokenVault: Address | undefined
}

export type ContractDeploymentType =
  | 'create'
  | 'create2'
  | 'createAccount'
  | 'create2Account'
  | undefined
