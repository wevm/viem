import type { PublicClient, Transport } from '../../../clients'
import type { Chain } from '../../../types'
import {
  AvatarData,
  fetchNftTokenUri,
  fetchOffchainData,
  Gateways,
  getJsonImage,
  parseNFT,
  parseOnChainUri,
  resolveAvatarURI,
} from './utils'

export async function getAvatarMetadata<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  avatarURI: string,
  gateways: Gateways | undefined,
): Promise<AvatarData> {
  // test case-insensitive in case of uppercase records
  if (!/eip155:/i.test(avatarURI)) {
    // if not an NFT URI, resolve the URI and return the data
    return parseOnChainUri(avatarURI, gateways)
  }

  // parse NFT URI into properties
  const nft = parseNFT(avatarURI)
  // fetch tokenURI from the NFT contract
  const nftUri = await fetchNftTokenUri(client, nft)
  // resolve the URI from the fetched tokenURI
  const {
    uri: resolvedNftUri,
    isOnChain,
    isEncoded,
  } = resolveAvatarURI(nftUri, gateways)

  // if the resolved URI is on chain, return the data
  if (isOnChain) {
    const encodedJson = isEncoded
      ? // if it is encoded, decode it
        Buffer.from(
          resolvedNftUri.replace('data:application/json;base64,', ''),
          'base64',
        ).toString()
      : // if it isn't encoded assume it is a JSON string, but it could be anything (it will error if it is)
        resolvedNftUri
    const decoded = JSON.parse(encodedJson)

    return {
      type: 'nft',
      uri: getJsonImage(decoded),
    }
  }

  let urlTokenId = nft.tokenID

  if (nft.namespace === 'erc1155') {
    urlTokenId = urlTokenId.replace('0x', '').padStart(64, '0')
  }

  // fetch the off-chain data from the resolved URI and return
  return fetchOffchainData(resolvedNftUri.replace(/(?:0x)?{id}/, urlTokenId))
}
