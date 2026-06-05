import type { Address } from 'abitype'
import type { Hex } from 'ox/Hex'
import type { Account } from '../../accounts/types.js'
import type { ReadContractReturnType } from '../../actions/public/readContract.js'
import { readContract } from '../../actions/public/readContract.js'
import type { WriteContractReturnType } from '../../actions/wallet/writeContract.js'
import { writeContract } from '../../actions/wallet/writeContract.js'
import { writeContractSync } from '../../actions/wallet/writeContractSync.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { TransactionReceipt } from '../../types/transaction.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type { ReadParameters, WriteParameters } from '../internal/types.js'

type FeatureRegistryFunction = Extract<
  (typeof Abis.featureRegistry)[number],
  { type: 'function' }
>['name']
type ReadFeatureRegistryFunction = Extract<
  (typeof Abis.featureRegistry)[number],
  { type: 'function'; stateMutability: 'view' }
>['name']

async function readFeatureRegistry<
  functionName extends ReadFeatureRegistryFunction,
  chain extends Chain | undefined,
>(
  client: Client<Transport, chain>,
  parameters: ReadParameters | undefined,
  functionName: functionName,
  args?: readonly unknown[],
) {
  return readContract(client, {
    ...parameters,
    address: Addresses.featureRegistry,
    abi: Abis.featureRegistry,
    functionName,
    args,
  } as never) as Promise<
    ReadContractReturnType<typeof Abis.featureRegistry, functionName, never>
  >
}

function writeFeatureRegistry<
  action extends typeof writeContract | typeof writeContractSync,
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  action: action,
  client: Client<Transport, chain, account>,
  parameters: WriteParameters<chain, account>,
  functionName: FeatureRegistryFunction,
  args?: readonly unknown[],
): Promise<ReturnType<action>> {
  return action(client, {
    ...parameters,
    address: Addresses.featureRegistry,
    abi: Abis.featureRegistry,
    functionName,
    args,
  } as never) as never
}

export async function getOwner<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getOwner.Parameters = {},
): Promise<getOwner.ReturnValue> {
  return readFeatureRegistry(client, parameters, 'owner')
}

export declare namespace getOwner {
  export type Parameters = ReadParameters
  export type ReturnValue = ReadContractReturnType<
    typeof Abis.featureRegistry,
    'owner',
    never
  >
  export type ErrorType = BaseErrorType
}

export async function getActivationQuorum<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getActivationQuorum.Parameters = {},
): Promise<getActivationQuorum.ReturnValue> {
  return readFeatureRegistry(client, parameters, 'activationQuorum')
}

export declare namespace getActivationQuorum {
  export type Parameters = ReadParameters
  export type ReturnValue = ReadContractReturnType<
    typeof Abis.featureRegistry,
    'activationQuorum',
    never
  >
  export type ErrorType = BaseErrorType
}

export async function getFeaturesTip<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getFeaturesTip.Parameters = {},
): Promise<getFeaturesTip.ReturnValue> {
  return readFeatureRegistry(client, parameters, 'featuresTip')
}

export declare namespace getFeaturesTip {
  export type Parameters = ReadParameters
  export type ReturnValue = ReadContractReturnType<
    typeof Abis.featureRegistry,
    'featuresTip',
    never
  >
  export type ErrorType = BaseErrorType
}

export async function getScheduledFeaturesTip<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getScheduledFeaturesTip.Parameters = {},
): Promise<getScheduledFeaturesTip.ReturnValue> {
  return readFeatureRegistry(client, parameters, 'scheduledFeaturesTip')
}

export declare namespace getScheduledFeaturesTip {
  export type Parameters = ReadParameters
  export type ReturnValue = ReadContractReturnType<
    typeof Abis.featureRegistry,
    'scheduledFeaturesTip',
    never
  >
  export type ErrorType = BaseErrorType
}

export async function getValidatorSupportedFeaturesTip<
  chain extends Chain | undefined,
>(
  client: Client<Transport, chain>,
  parameters: getValidatorSupportedFeaturesTip.Parameters,
): Promise<getValidatorSupportedFeaturesTip.ReturnValue> {
  const { validator, ...rest } = parameters
  return readFeatureRegistry(client, rest, 'validatorSupportedFeaturesTip', [
    validator,
  ])
}

export namespace getValidatorSupportedFeaturesTip {
  export type Parameters = ReadParameters & Args
  export type Args = {
    validator: Address
  }
  export type ReturnValue = ReadContractReturnType<
    typeof Abis.featureRegistry,
    'validatorSupportedFeaturesTip',
    never
  >
  export type ErrorType = BaseErrorType
}

export async function getFeaturesTipSupport<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: getFeaturesTipSupport.Parameters,
): Promise<getFeaturesTipSupport.ReturnValue> {
  const { featuresTip, ...rest } = parameters
  return readFeatureRegistry(client, rest, 'featuresTipSupport', [featuresTip])
}

export namespace getFeaturesTipSupport {
  export type Parameters = ReadParameters & Args
  export type Args = {
    featuresTip: bigint
  }
  export type ReturnValue = ReadContractReturnType<
    typeof Abis.featureRegistry,
    'featuresTipSupport',
    never
  >
  export type ErrorType = BaseErrorType
}

export async function hasFeaturesTipQuorum<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: hasFeaturesTipQuorum.Parameters,
): Promise<hasFeaturesTipQuorum.ReturnValue> {
  const { featuresTip, ...rest } = parameters
  return readFeatureRegistry(client, rest, 'hasFeaturesTipQuorum', [
    featuresTip,
  ])
}

export namespace hasFeaturesTipQuorum {
  export type Parameters = ReadParameters & Args
  export type Args = {
    featuresTip: bigint
  }
  export type ReturnValue = ReadContractReturnType<
    typeof Abis.featureRegistry,
    'hasFeaturesTipQuorum',
    never
  >
  export type ErrorType = BaseErrorType
}

export async function setSupportedFeaturesTip<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: setSupportedFeaturesTip.Parameters<chain, account>,
): Promise<setSupportedFeaturesTip.ReturnValue> {
  const { publicKey, featuresTip, ...rest } = parameters
  return writeFeatureRegistry(
    writeContract,
    client,
    rest as never,
    'setSupportedFeaturesTip',
    [publicKey, featuresTip],
  )
}

export namespace setSupportedFeaturesTip {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args
  export type Args = {
    publicKey: Hex
    featuresTip: bigint
  }
  export type ReturnValue = WriteContractReturnType
  export type ErrorType = BaseErrorType
}

export async function scheduleFeaturesTip<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: scheduleFeaturesTip.Parameters<chain, account>,
): Promise<scheduleFeaturesTip.ReturnValue> {
  const { featuresTip, activationEpoch, ...rest } = parameters
  return writeFeatureRegistry(
    writeContract,
    client,
    rest as never,
    'scheduleFeaturesTip',
    [featuresTip, activationEpoch],
  )
}

export namespace scheduleFeaturesTip {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args
  export type Args = {
    featuresTip: bigint
    activationEpoch: bigint
  }
  export type ReturnValue = WriteContractReturnType
  export type ErrorType = BaseErrorType
}

export async function activateScheduledFeaturesTip<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: activateScheduledFeaturesTip.Parameters<chain, account>,
): Promise<activateScheduledFeaturesTip.ReturnValue> {
  const { currentEpoch, ...rest } = parameters
  return writeFeatureRegistry(
    writeContract,
    client,
    rest as never,
    'activateScheduledFeaturesTip',
    [currentEpoch],
  )
}

export namespace activateScheduledFeaturesTip {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args
  export type Args = {
    currentEpoch: bigint
  }
  export type ReturnValue = WriteContractReturnType
  export type ErrorType = BaseErrorType
}

export async function cancelScheduledFeaturesTip<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: cancelScheduledFeaturesTip.Parameters<chain, account>,
): Promise<cancelScheduledFeaturesTip.ReturnValue> {
  return writeFeatureRegistry(
    writeContract,
    client,
    parameters,
    'cancelScheduledFeaturesTip',
  )
}

export namespace cancelScheduledFeaturesTip {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account>
  export type ReturnValue = WriteContractReturnType
  export type ErrorType = BaseErrorType
}

export async function scheduleFeaturesTipSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: scheduleFeaturesTipSync.Parameters<chain, account>,
): Promise<scheduleFeaturesTipSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const { featuresTip, activationEpoch, ...writeParameters } = rest
  const receipt = await writeFeatureRegistry(
    writeContractSync,
    client,
    { ...writeParameters, throwOnReceiptRevert } as never,
    'scheduleFeaturesTip',
    [featuresTip, activationEpoch],
  )
  return { receipt }
}

export namespace scheduleFeaturesTipSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = scheduleFeaturesTip.Parameters<chain, account>
  export type ReturnValue = {
    receipt: TransactionReceipt
  }
}
