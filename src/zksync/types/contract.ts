import type { Address } from 'abitype'

export type BridgeContractAddresses = {
  erc20L1: Address
  sharedL1: Address
  sharedL2: Address
}

export type ContractDeploymentType =
  | 'create'
  | 'create2'
  | 'createAccount'
  | 'create2Account'
  | undefined
