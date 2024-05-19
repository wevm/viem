import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import { isAddressEqualLite } from '../../utils/address/isAddressEqualLite.js'
import { encodeAbiParameters } from '../../utils/index.js'
import { getErc20ContractValue } from '../actions/getErc20ContractValue.js'
import {
  ETH_ADDRESS_IN_CONTRACTS,
  LEGACY_ETH_ADDRESS,
} from '../constants/number.js'

export async function getERC20DefaultBridgeData<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  clientL1: Client<Transport, TChain, TAccount>,
  l1TokenAddress: Address,
): Promise<Hex> {
  let tokenAddress = l1TokenAddress

  if (isAddressEqualLite(tokenAddress, LEGACY_ETH_ADDRESS)) {
    tokenAddress = ETH_ADDRESS_IN_CONTRACTS
  }

  const name = isAddressEqualLite(tokenAddress, ETH_ADDRESS_IN_CONTRACTS)
    ? 'Ether'
    : await getErc20ContractValue(clientL1, {
        l1TokenAddress: tokenAddress,
        functionName: 'name',
      })

  const symbol = isAddressEqualLite(tokenAddress, ETH_ADDRESS_IN_CONTRACTS)
    ? 'ETH'
    : await getErc20ContractValue(clientL1, {
        l1TokenAddress: tokenAddress,
        functionName: 'symbol',
      })

  const decimals = isAddressEqualLite(tokenAddress, ETH_ADDRESS_IN_CONTRACTS)
    ? 18n
    : BigInt(
        await getErc20ContractValue(clientL1, {
          l1TokenAddress: tokenAddress,
          functionName: 'decimals',
        }),
      )

  const nameBytes = encodeAbiParameters([{ type: 'string' }], [name])
  const symbolBytes = encodeAbiParameters([{ type: 'string' }], [symbol])
  const decimalsBytes = encodeAbiParameters([{ type: 'uint256' }], [decimals])

  return encodeAbiParameters(
    [{ type: 'bytes' }, { type: 'bytes' }, { type: 'bytes' }],
    [nameBytes, symbolBytes, decimalsBytes],
  )
}
