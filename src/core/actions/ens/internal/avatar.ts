import * as Abi from 'ox/Abi'
import type * as Address from 'ox/Address'

import type * as Client from '../../../Client.js'
import { BaseError } from '../../../Errors.js'
import * as Json from '../../../../utils/Json.js'
import { read } from '../../contract/read.js'

/** Gateway URL overrides for resolving offchain asset URIs. */
export type AssetGatewayUrls = {
  arweave?: string | undefined
  ipfs?: string | undefined
}

type UriItem = {
  uri: string
  isOnChain: boolean
  isEncoded: boolean
}

const networkRegex =
  /(?<protocol>https?:\/\/[^/]*|ipfs:\/|ipns:\/|ar:\/)?(?<root>\/)?(?<subpath>ipfs\/|ipns\/)?(?<target>[\w\-.]+)(?<subtarget>\/.*)?/
const ipfsHashRegex =
  /^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})(\/(?<target>[\w\-.]+))?(?<subtarget>\/.*)?$/
const base64Regex = /^data:([a-zA-Z\-/+]*);base64,([^"].*)/
const dataURIRegex = /^data:([a-zA-Z\-/+]*)?(;[a-zA-Z0-9].*?)?(,)/

const erc721TokenUriAbi = /*#__PURE__*/ Abi.from([
  'function tokenURI(uint256 tokenId) view returns (string)',
])
const erc1155UriAbi = /*#__PURE__*/ Abi.from([
  'function uri(uint256 _id) view returns (string)',
])

/** Resolves an ENS avatar record (plain URI or CAIP-22/29 NFT URI) to an image URI. */
export async function parseAvatarRecord(
  client: Client.Client,
  options: {
    gatewayUrls?: AssetGatewayUrls | undefined
    record: string
  },
): Promise<string> {
  const { gatewayUrls, record } = options
  if (/eip155:/i.test(record))
    return parseNftAvatarUri(client, { gatewayUrls, record })
  return parseAvatarUri({ gatewayUrls, uri: record })
}

async function parseNftAvatarUri(
  client: Client.Client,
  options: {
    gatewayUrls?: AssetGatewayUrls | undefined
    record: string
  },
): Promise<string> {
  const { gatewayUrls, record } = options

  const nft = parseNftUri(record)
  const nftUri = await getNftTokenUri(client, { nft })
  const {
    uri: resolvedNftUri,
    isOnChain,
    isEncoded,
  } = resolveAvatarUri({ gatewayUrls, uri: nftUri })

  // Onchain metadata: decode and resolve its image.
  if (
    isOnChain &&
    (resolvedNftUri.includes('data:application/json;base64,') ||
      resolvedNftUri.startsWith('{'))
  ) {
    const encodedJson = isEncoded
      ? atob(resolvedNftUri.replace('data:application/json;base64,', ''))
      : resolvedNftUri

    const decoded = JSON.parse(encodedJson)
    return parseAvatarUri({ gatewayUrls, uri: getJsonImage(decoded) })
  }

  let uriTokenId = nft.tokenId
  if (nft.namespace === 'erc1155')
    uriTokenId = uriTokenId.replace('0x', '').padStart(64, '0')

  return getMetadataAvatarUri({
    gatewayUrls,
    uri: resolvedNftUri.replace(/(?:0x)?{id}/, uriTokenId),
  })
}

/** @internal */
export function resolveAvatarUri(options: {
  gatewayUrls?: AssetGatewayUrls | undefined
  uri: string
}): UriItem {
  const { gatewayUrls, uri } = options

  const isEncoded = base64Regex.test(uri)
  if (isEncoded) return { uri, isOnChain: true, isEncoded }

  const ipfsGateway = getGateway(gatewayUrls?.ipfs, 'https://ipfs.io')
  const arweaveGateway = getGateway(gatewayUrls?.arweave, 'https://arweave.net')

  const networkRegexMatch = uri.match(networkRegex)
  const {
    protocol,
    subpath,
    target,
    subtarget = '',
  } = networkRegexMatch?.groups || {}

  const isIPNS = protocol === 'ipns:/' || subpath === 'ipns/'
  const isIPFS =
    protocol === 'ipfs:/' || subpath === 'ipfs/' || ipfsHashRegex.test(uri)

  if (uri.startsWith('http') && !isIPNS && !isIPFS) {
    let replacedUri = uri
    if (gatewayUrls?.arweave)
      replacedUri = uri.replace(/https:\/\/arweave.net/g, gatewayUrls.arweave)
    return { uri: replacedUri, isOnChain: false, isEncoded: false }
  }

  if ((isIPNS || isIPFS) && target)
    return {
      uri: `${ipfsGateway}/${isIPNS ? 'ipns' : 'ipfs'}/${target}${subtarget}`,
      isOnChain: false,
      isEncoded: false,
    }

  if (protocol === 'ar:/' && target)
    return {
      uri: `${arweaveGateway}/${target}${subtarget || ''}`,
      isOnChain: false,
      isEncoded: false,
    }

  let parsedUri = uri.replace(dataURIRegex, '')
  if (parsedUri.startsWith('<svg'))
    parsedUri = `data:image/svg+xml;base64,${btoa(parsedUri)}`

  if (parsedUri.startsWith('data:') || parsedUri.startsWith('{'))
    return {
      uri: parsedUri,
      isOnChain: true,
      isEncoded: false,
    }

  throw new EnsAvatarUriResolutionError({ uri })
}

/** @internal */
export async function parseAvatarUri(options: {
  gatewayUrls?: AssetGatewayUrls | undefined
  uri: string
}): Promise<string> {
  const { gatewayUrls, uri } = options

  const { uri: resolvedUri, isOnChain } = resolveAvatarUri({ gatewayUrls, uri })
  if (isOnChain) return resolvedUri

  const isImage = await isImageUri(resolvedUri)
  if (isImage) return resolvedUri

  throw new EnsAvatarUriResolutionError({ uri })
}

/** @internal */
export function getJsonImage(data: unknown): string {
  if (
    typeof data !== 'object' ||
    data === null ||
    (!('image' in data) && !('image_url' in data) && !('image_data' in data))
  )
    throw new EnsAvatarInvalidMetadataError({ data })

  const metadata = data as {
    image?: string
    image_url?: string
    image_data?: string
  }
  return (metadata.image || metadata.image_url || metadata.image_data)!
}

/** @internal */
export async function getMetadataAvatarUri(options: {
  gatewayUrls?: AssetGatewayUrls | undefined
  uri: string
}): Promise<string> {
  const { gatewayUrls, uri } = options
  try {
    const res = await fetch(uri).then((res) => res.json())
    return await parseAvatarUri({
      gatewayUrls,
      uri: getJsonImage(res),
    })
  } catch {
    throw new EnsAvatarUriResolutionError({ uri })
  }
}

async function isImageUri(uri: string) {
  try {
    const res = await fetch(uri, { method: 'HEAD' })
    if (res.status === 200)
      return res.headers.get('content-type')?.startsWith('image/')
    return false
  } catch (error) {
    // Non-CORS network failures are terminal.
    if (
      typeof error === 'object' &&
      typeof (error as { response?: unknown }).response !== 'undefined'
    )
      return false
    if (!Object.hasOwn(globalThis, 'Image')) return false
    // In browsers a CORS failure can still be a valid image; probe via Image.
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = uri
    })
  }
}

function getGateway(custom: string | undefined, defaultGateway: string) {
  if (!custom) return defaultGateway
  if (custom.endsWith('/')) return custom.slice(0, -1)
  return custom
}

type ParsedNft = {
  chainId: number
  namespace: string
  contractAddress: Address.Address
  tokenId: string
}

/** @internal */
export function parseNftUri(value: string): ParsedNft {
  let uri = value
  // Parse valid NFT spec (CAIP-22/CAIP-29).
  // https://github.com/ChainAgnostic/CAIPs/tree/master/CAIPs
  if (uri.startsWith('did:nft:'))
    uri = uri.replace('did:nft:', '').replace(/_/g, '/')

  const [reference, assetNamespace, tokenId] = uri.split('/')
  const [eipNamespace, chainId] = reference!.split(':')
  const [ercNamespace, contractAddress] = (assetNamespace ?? '').split(':')

  if (!eipNamespace || eipNamespace.toLowerCase() !== 'eip155')
    throw new EnsAvatarInvalidNftUriError({ reason: 'Only EIP-155 supported' })
  if (!chainId)
    throw new EnsAvatarInvalidNftUriError({ reason: 'Chain ID not found' })
  if (!contractAddress)
    throw new EnsAvatarInvalidNftUriError({
      reason: 'Contract address not found',
    })
  if (!tokenId)
    throw new EnsAvatarInvalidNftUriError({ reason: 'Token ID not found' })
  if (!ercNamespace)
    throw new EnsAvatarInvalidNftUriError({ reason: 'ERC namespace not found' })

  return {
    chainId: Number.parseInt(chainId, 10),
    namespace: ercNamespace.toLowerCase(),
    contractAddress: contractAddress as Address.Address,
    tokenId,
  }
}

/** @internal */
export async function getNftTokenUri(
  client: Client.Client,
  options: { nft: ParsedNft },
): Promise<string> {
  const { nft } = options
  if (nft.namespace === 'erc721')
    return (await read(client, {
      abi: erc721TokenUriAbi,
      address: nft.contractAddress,
      args: [BigInt(nft.tokenId)],
      functionName: 'tokenURI',
    } as never)) as string
  if (nft.namespace === 'erc1155')
    return (await read(client, {
      abi: erc1155UriAbi,
      address: nft.contractAddress,
      args: [BigInt(nft.tokenId)],
      functionName: 'uri',
    } as never)) as string
  throw new EnsAvatarUnsupportedNamespaceError({ namespace: nft.namespace })
}

/** Thrown when NFT metadata carries no image property. */
export class EnsAvatarInvalidMetadataError extends BaseError {
  override readonly name = 'EnsAvatarInvalidMetadataError'

  constructor(options: { data: unknown }) {
    super(
      'Unable to extract image from metadata. The metadata may be malformed or invalid.',
      {
        metaMessages: [
          '- Metadata must be a JSON object with at least an `image`, `image_url` or `image_data` property.',
          '',
          `Provided data: ${Json.stringify(options.data)}`,
        ],
      },
    )
  }
}

/** Thrown when an avatar NFT URI is not a valid CAIP-22/29 URI. */
export class EnsAvatarInvalidNftUriError extends BaseError {
  override readonly name = 'EnsAvatarInvalidNftUriError'

  constructor(options: { reason: string }) {
    super(`ENS NFT avatar URI is invalid. ${options.reason}`)
  }
}

/** Thrown when an avatar URI cannot be resolved to a supported image URI. */
export class EnsAvatarUriResolutionError extends BaseError {
  override readonly name = 'EnsAvatarUriResolutionError'

  constructor(options: { uri: string }) {
    super(
      `Unable to resolve ENS avatar URI "${options.uri}". The URI may be malformed, invalid, or does not respond with a valid image.`,
    )
  }
}

/** Thrown when an avatar NFT URI uses an unsupported namespace. */
export class EnsAvatarUnsupportedNamespaceError extends BaseError {
  override readonly name = 'EnsAvatarUnsupportedNamespaceError'

  constructor(options: { namespace: string }) {
    super(
      `ENS NFT avatar namespace "${options.namespace}" is not supported. Must be "erc721" or "erc1155".`,
    )
  }
}
