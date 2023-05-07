import type { PublicClient } from '../../clients/createPublicClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'
import type { AssetGatewayUrls } from '../../types/ens.js'
import type { Prettify } from '../../types/utils.js'
import { parseAvatarRecord } from '../../utils/ens/avatar/parseAvatarRecord.js'

import { type GetEnsTextParameters, getEnsText } from './getEnsText.js'

export type GetEnsAvatarParameters = Prettify<
  Omit<GetEnsTextParameters, 'key'> & {
    /** Gateway urls to resolve IPFS and/or Arweave assets. */
    gatewayUrls?: AssetGatewayUrls
  }
>

export type GetEnsAvatarReturnType = string | null

/**
 * Gets the avatar of an ENS name.
 *
 * - Docs: https://viem.sh/docs/ens/actions/getEnsAvatar.html
 * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/ens
 *
 * Calls [`getEnsText`](https://viem.sh/docs/ens/actions/getEnsText.html) with `key` set to `'avatar'`.
 *
 * Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsAddress`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize.html) function for this.
 *
 * @param client - Client to use
 * @param parameters - {@link GetEnsAvatarParameters}
 * @returns Avatar URI or `null` if not found. {@link GetEnsAvatarReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getEnsAvatar, normalize } from 'viem/ens'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const ensAvatar = await getEnsAvatar(client, {
 *   name: normalize('wagmi-dev.eth'),
 * })
 * // 'https://ipfs.io/ipfs/Qma8mnp6xV3J2cRNf3mTth5C8nV11CAnceVinc3y8jSbio'
 */
export async function getEnsAvatar<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  {
    blockNumber,
    blockTag,
    gatewayUrls,
    name,
    universalResolverAddress,
  }: GetEnsAvatarParameters,
): Promise<GetEnsAvatarReturnType> {
  const record = await getEnsText(client, {
    blockNumber,
    blockTag,
    key: 'avatar',
    name,
    universalResolverAddress,
  })
  if (!record) return null
  try {
    return await parseAvatarRecord(client, { record, gatewayUrls })
  } catch {
    return null
  }
}
