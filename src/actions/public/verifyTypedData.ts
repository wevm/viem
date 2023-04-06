import type { TypedData } from 'abitype'
import {
  VerifyMessageHashOnchainParameters,
  verifyMessageHashOnChain,
} from './verifyMessage'
import {
  verifyTypedData as offlineVerifyTypedData,
  VerifyTypedDataParameters as OfflineVerifyTypedDataParameters,
  VerifyTypedDataReturnType as OfflineVerifyTypedDataReturnType,
} from '../../utils/signature/verifyTypedData'
import type { Chain } from '../../types'
import type { PublicClient, Transport } from '../../clients'
import { hashTypedData } from '../../utils'

export type VerifyTypedDataParameters<
  TTypedData extends TypedData | { [key: string]: unknown } = TypedData,
  TPrimaryType extends string = string,
> = Omit<VerifyMessageHashOnchainParameters, 'messageHash'> &
  OfflineVerifyTypedDataParameters<TTypedData, TPrimaryType>

export type VerifyTypedDataReturnType = OfflineVerifyTypedDataReturnType

export async function verifyTypedData<TChain extends Chain | undefined,>(
  client: PublicClient<Transport, TChain>,
  {
    address,
    signature,
    message,
    primaryType,
    types,
    domain,
    ...callRequest
  }: VerifyTypedDataParameters,
): Promise<VerifyTypedDataReturnType> {
  const messageHash = hashTypedData({ message, primaryType, types, domain })
  const onChainResult = await verifyMessageHashOnChain(client, {
    address,
    messageHash,
    signature,
    ...callRequest,
  })

  // If the contract does not support ERC1271, we fallback to the offline verification
  if (onChainResult !== null) {
    return onChainResult
  }

  return offlineVerifyTypedData({
    message,
    primaryType,
    types,
    domain,
    address,
    signature,
  })
}
