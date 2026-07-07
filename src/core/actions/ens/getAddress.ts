import * as AbiFunction from 'ox/AbiFunction'
import * as Address from 'ox/Address'
import type * as Block from 'ox/Block'
import * as Ens from 'ox/Ens'
import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'

import { getContractAddress } from '../../Chain.js'
import type * as Client from '../../Client.js'
import { BaseError } from '../../Errors.js'
import { read } from '../contract/read.js'
import {
  addressResolverAbi,
  universalResolverResolveAbi,
} from './internal/abis.js'
import { localBatchGatewayUrl } from './internal/batchGateway.js'
import { isNullUniversalResolverError } from './internal/errors.js'
import { packetToBytes } from './internal/packet.js'

/**
 * Gets the address for an ENS name (via the ENS Universal Resolver's
 * `resolveWithGateways`).
 *
 * Names should be [UTS-46 normalized](https://docs.ens.domains/contract-api-reference/name-processing)
 * before lookup — use `Ens.normalize`.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { Ens } from 'viem/utils'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const address = await Actions.ens.getAddress(client, {
 *   name: Ens.normalize('wevm.eth'),
 * })
 * ```
 */
export async function getAddress(
  client: Client.Client,
  options: getAddress.Options,
): Promise<getAddress.ReturnType> {
  const { blockNumber, blockTag, coinType, gatewayUrls, name, strict } = options

  const universalResolverAddress = resolveUniversalResolverAddress(client, {
    address: options.universalResolverAddress,
    blockNumber,
  })

  const tlds = client.chain?.ensTlds
  if (tlds && !tlds.some((tld) => name.endsWith(tld))) return null

  const args =
    coinType != null
      ? ([Ens.namehash(name), coinType] as const)
      : ([Ens.namehash(name)] as const)

  try {
    const addrItem = AbiFunction.fromAbi(addressResolverAbi, 'addr', {
      args: args,
    })

    const [data] = (await read(client, {
      abi: universalResolverResolveAbi,
      address: universalResolverAddress,
      args: [
        Hex.fromBytes(packetToBytes(name)),
        AbiFunction.encodeData(addrItem, args as never),
        gatewayUrls ?? [localBatchGatewayUrl],
      ],
      blockNumber,
      blockTag,
      functionName: 'resolveWithGateways',
    })) as [Hex.Hex, Address.Address]

    if (data === '0x') return null

    const address = decodeAddress({ addrItem, coinType, data })

    if (address === '0x') return null
    if (Hex.trimLeft(address) === '0x00') return null
    return address
  } catch (err) {
    if (strict) throw err
    if (isNullUniversalResolverError(err)) return null
    throw err
  }
}

export declare namespace getAddress {
  type Options = {
    /** ENSIP-9 coin type to resolve the address for. @default 60n (ETH) */
    coinType?: bigint | undefined
    /** Universal Resolver gateway URLs for CCIP-read requests. */
    gatewayUrls?: readonly string[] | undefined
    /** ENS name to resolve. */
    name: string
    /** Whether to throw Universal Resolver errors instead of returning `null`. */
    strict?: boolean | undefined
    /** ENS Universal Resolver address. @default client.chain.contracts.ensUniversalResolver */
    universalResolverAddress?: Address.Address | undefined
  } & (
    | {
        /** The block number to resolve against. */
        blockNumber?: bigint | undefined
        blockTag?: undefined
      }
    | {
        blockNumber?: undefined
        /** The block tag to resolve against. @default 'latest' */
        blockTag?: Block.Tag | undefined
      }
  )

  type ReturnType = Address.Address | null

  type ErrorType = Errors.GlobalErrorType
}

function decodeAddress(options: {
  addrItem: AbiFunction.AbiFunction
  coinType: bigint | undefined
  data: Hex.Hex
}): Address.Address {
  const { addrItem, coinType, data } = options
  try {
    return AbiFunction.decodeResult(addrItem, data) as Address.Address
  } catch (err) {
    if (coinType == null) throw err

    const address = Hex.trimLeft(data)
    if (Hex.size(address) === 20) return Address.checksum(address)

    throw err
  }
}

/** @internal */
export function resolveUniversalResolverAddress(
  client: Client.Client,
  options: {
    address?: Address.Address | undefined
    blockNumber?: bigint | undefined
  },
): Address.Address {
  const { address, blockNumber } = options
  if (address) return address
  if (!client.chain)
    throw new BaseError(
      'Client chain not configured. `universalResolverAddress` is required.',
    )
  return getContractAddress({
    blockNumber,
    chain: client.chain,
    contract: 'ensUniversalResolver',
  })
}
