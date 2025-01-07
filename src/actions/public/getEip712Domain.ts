import type { Address, TypedDataDomain } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import {
  Eip712DomainNotFoundError,
  type Eip712DomainNotFoundErrorType,
} from '../../errors/eip712.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import type { RequiredBy } from '../../types/utils.js'
import { getAction } from '../../utils/getAction.js'
import {
  type ReadContractErrorType,
  type ReadContractParameters,
  readContract,
} from './readContract.js'

export type GetEip712DomainParameters = {
  address: Address
} & Pick<ReadContractParameters, 'factory' | 'factoryData'>

export type GetEip712DomainReturnType = {
  domain: RequiredBy<
    TypedDataDomain,
    'chainId' | 'name' | 'verifyingContract' | 'salt' | 'version'
  >
  fields: Hex
  extensions: readonly bigint[]
}

export type GetEip712DomainErrorType =
  | Eip712DomainNotFoundErrorType
  | ReadContractErrorType
  | ErrorType

/**
 * Reads the EIP-712 domain from a contract, based on the ERC-5267 specification.
 *
 * @param client - A {@link Client} instance.
 * @param parameters - The parameters of the action. {@link GetEip712DomainParameters}
 * @returns The EIP-712 domain, fields, and extensions. {@link GetEip712DomainReturnType}
 *
 * @example
 * ```ts
 * import { createPublicClient, http, getEip712Domain } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const domain = await getEip712Domain(client, {
 *   address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
 * })
 * // {
 * //   domain: {
 * //     name: 'ExampleContract',
 * //     version: '1',
 * //     chainId: 1,
 * //     verifyingContract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
 * //   },
 * //   fields: '0x0f',
 * //   extensions: [],
 * // }
 * ```
 */
export async function getEip712Domain(
  client: Client<Transport>,
  parameters: GetEip712DomainParameters,
): Promise<GetEip712DomainReturnType> {
  const { address, factory, factoryData } = parameters

  try {
    const [
      fields,
      name,
      version,
      chainId,
      verifyingContract,
      salt,
      extensions,
    ] = await getAction(
      client,
      readContract,
      'readContract',
    )({
      abi,
      address,
      functionName: 'eip712Domain',
      factory,
      factoryData,
    })

    return {
      domain: {
        name,
        version,
        chainId: Number(chainId),
        verifyingContract,
        salt,
      },
      extensions,
      fields,
    }
  } catch (e) {
    const error = e as ReadContractErrorType
    if (
      error.name === 'ContractFunctionExecutionError' &&
      error.cause.name === 'ContractFunctionZeroDataError'
    ) {
      throw new Eip712DomainNotFoundError({ address })
    }
    throw error
  }
}

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
