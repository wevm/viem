import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Chain } from '../../../types/chain.js'
import type { AssetGatewayUrls } from '../../../types/ens.js'

import {
  type GetJsonImageErrorType,
  type GetMetadataAvatarUriErrorType,
  type GetNftTokenUriErrorType,
  type ParseAvatarUriErrorType,
  type ParseNftUriErrorType,
  type ResolveAvatarUriErrorType,
  getJsonImage,
  getMetadataAvatarUri,
  getNftTokenUri,
  parseAvatarUri,
  parseNftUri,
  resolveAvatarUri,
} from './utils.js'

export type ParseAvatarRecordErrorType =
  | ParseNftAvatarUriErrorType
  | ParseAvatarUriErrorType
  | ErrorType

export async function parseAvatarRecord<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
  {
    gatewayUrls,
    record,
  }: {
    gatewayUrls?: AssetGatewayUrls
    record: string
  },
): Promise<string> {
  if (/eip155:/i.test(record))
    return parseNftAvatarUri(client, { gatewayUrls, record })
  return parseAvatarUri({ uri: record, gatewayUrls })
}

export type ParseNftAvatarUriErrorType =
  | ParseNftUriErrorType
  | GetNftTokenUriErrorType
  | ResolveAvatarUriErrorType
  | ParseAvatarUriErrorType
  | GetJsonImageErrorType
  | GetMetadataAvatarUriErrorType
  | ErrorType

async function parseNftAvatarUri<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
  {
    gatewayUrls,
    record,
  }: {
    gatewayUrls?: AssetGatewayUrls
    record: string
  },
): Promise<string> {
  // parse NFT URI into properties
  const nft = parseNftUri(record)
  // fetch tokenURI from the NFT contract
  const nftUri = await getNftTokenUri(client, { nft })
  // resolve the URI from the fetched tokenURI
  const {
    uri: resolvedNftUri,
    isOnChain,
    isEncoded,
  } = resolveAvatarUri({ uri: nftUri, gatewayUrls })

  // if the resolved URI is on chain, return the data
  if (
    isOnChain &&
    (resolvedNftUri.includes('data:application/json;base64,') ||
      resolvedNftUri.startsWith('{'))
  ) {
    const encodedJson = isEncoded
      ? // if it is encoded, decode it
        atob(resolvedNftUri.replace('data:application/json;base64,', ''))
      : // if it isn't encoded assume it is a JSON string, but it could be anything (it will error if it is)
        resolvedNftUri

    const decoded = JSON.parse(encodedJson)
    return parseAvatarUri({ uri: getJsonImage(decoded), gatewayUrls })
  }

  let uriTokenId = nft.tokenID
  if (nft.namespace === 'erc1155')
    uriTokenId = uriTokenId.replace('0x', '').padStart(64, '0')

  return getMetadataAvatarUri({
    gatewayUrls,
    uri: resolvedNftUri.replace(/(?:0x)?{id}/, uriTokenId),
  })
}
