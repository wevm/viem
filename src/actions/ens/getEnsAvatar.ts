import type { PublicClient, Transport } from '../../clients'
import type { Chain, Prettify } from '../../types'
import {
  getAvatarMetadata,
  resolveAvatarURI,
  type Gateways,
} from '../../utils/ens'
import {
  getEnsText,
  type GetEnsTextParameters,
  type GetEnsTextReturnType,
} from './getEnsText'

export type GetEnsAvatarParameters = Prettify<
  Omit<GetEnsTextParameters, 'key'> & {
    /** Custom gateways to use */
    gateways?: Gateways
  }
>

export type GetEnsAvatarReturnType = GetEnsTextReturnType

/**
 * @description Gets avatar URI for ENS name.
 *
 * - Calls `resolve(bytes, bytes)` on ENS Universal Resolver Contract.
 * - Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsAddress`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize.html) function for this.
 *
 * @example
 * import { normalize } from 'viem/ens'
 *
 * const twitterRecord = await getEnsAvatar(publicClient, {
 *   name: normalize('wagmi-dev.eth'),
 * })
 * // 'https://ipfs.io/ipfs/Qma8mnp6xV3J2cRNf3mTth5C8nV11CAnceVinc3y8jSbio'
 */
export async function getEnsAvatar<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  { gateways, ...params }: GetEnsAvatarParameters,
): Promise<GetEnsAvatarReturnType> {
  const avatarURI = await getEnsText(client, {
    ...params,
    key: 'avatar',
  })
  if (!avatarURI) return null

  const { type, uri } = await getAvatarMetadata(client, avatarURI, gateways)

  if (type === 'image') {
    // if image, no more processing needed
    return uri
  }

  const { uri: parsedUri } = resolveAvatarURI(uri, gateways)
  if (parsedUri.startsWith('data:') || parsedUri.startsWith('http')) {
    return parsedUri
  }

  if (parsedUri.startsWith('<svg')) {
    // if svg, base64 encode
    return `data:image/svg+xml;base64,${Buffer.from(parsedUri).toString(
      'base64',
    )}`
  }

  // any data that gets to this point is not supported
  return null
}
