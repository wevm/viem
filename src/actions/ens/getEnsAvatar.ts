import type { PublicClient, Transport } from '../../clients/index.js'
import type { AssetGatewayUrls, Chain, Prettify } from '../../types/index.js'
import { parseAvatarRecord } from '../../utils/ens/index.js'
import { getEnsText } from './getEnsText.js'
import type { GetEnsTextParameters } from './getEnsText.js'

export type GetEnsAvatarParameters = Prettify<
  Omit<GetEnsTextParameters, 'key'> & {
    /** Custom gateways to use */
    gatewayUrls?: AssetGatewayUrls
  }
>

export type GetEnsAvatarReturnType = string | null

/**
 * @description Gets avatar URI for ENS name.
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
