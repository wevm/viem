import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import type * as TypedData from 'ox/TypedData'

import type * as Client from '../../../Client.js'
import { BaseError } from '../../../Errors.js'
import * as ContractError from '../../../ContractError.js'
import type { RequiredBy } from '../../../internal/types.js'
import { read } from './read.js'

/** ERC-5267 `eip712Domain` accessor. */
const abi = [
  {
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      { name: 'fields', type: 'bytes1' },
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
      { name: 'salt', type: 'bytes32' },
      { name: 'extensions', type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

/**
 * Reads the EIP-712 domain from a contract, based on the ERC-5267 specification.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const { domain, extensions, fields } = await Actions.contract.getEip712Domain(client, {
 *   address: '0x57ba3ec8df619d4d243ce439551cce713bb17411',
 * })
 * ```
 */
export async function getEip712Domain(
  client: Client.Client,
  options: getEip712Domain.Options,
): Promise<getEip712Domain.ReturnType> {
  const { address, factory, factoryData } = options

  try {
    const [
      fields,
      name,
      version,
      chainId,
      verifyingContract,
      salt,
      extensions,
    ] = await read(client, {
      abi,
      address,
      factory,
      factoryData,
      functionName: 'eip712Domain',
    })

    return {
      domain: {
        chainId: Number(chainId),
        name,
        salt,
        verifyingContract,
        version,
      },
      extensions,
      fields,
    }
  } catch (error) {
    const err = error as ContractError.ContractFunctionExecutionError
    if (
      err.name === 'ContractFunctionExecutionError' &&
      err.cause?.name === 'ContractFunctionZeroDataError'
    )
      throw new Eip712DomainNotFoundError({ address })
    throw error
  }
}

export declare namespace getEip712Domain {
  type Options = {
    /** Address of the contract to read the EIP-712 domain from. */
    address: Address.Address
    /** Deployment factory address (deployless read via factory). */
    factory?: Address.Address | undefined
    /** Calldata to execute on the factory to deploy the contract. */
    factoryData?: Hex.Hex | undefined
  }

  type ReturnType = {
    /** The EIP-712 domain. */
    domain: RequiredBy<
      TypedData.Domain,
      'chainId' | 'name' | 'salt' | 'verifyingContract' | 'version'
    >
    /** The ERC-5267 extensions. */
    extensions: readonly bigint[]
    /** The ERC-5267 fields bitmap. */
    fields: Hex.Hex
  }

  type ErrorType =
    | Eip712DomainNotFoundError
    | read.ErrorType
    | Errors.GlobalErrorType
}

/** Thrown when a contract does not implement the ERC-5267 `eip712Domain`. */
export class Eip712DomainNotFoundError extends BaseError {
  override readonly name = 'Eip712Domain.NotFoundError'

  constructor({ address }: { address: Address.Address }) {
    super(`No EIP-712 domain found on contract "${address}".`, {
      metaMessages: [
        'Ensure that:',
        `- The contract is deployed at the address "${address}".`,
        '- `eip712Domain()` function exists on the contract.',
        '- `eip712Domain()` function matches signature to ERC-5267 specification.',
      ],
    })
  }
}
