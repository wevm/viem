import type { Account } from '../accounts/types.js'
import {
  type GetContractReturnType,
  getContract,
} from '../actions/getContract.js'
import type { Client } from '../clients/createClient.js'
import type { Transport } from '../clients/transports/createTransport.js'
import { erc20Abi } from '../constants/abis.js'
import type { ErrorType } from '../errors/utils.js'
import type { Chain } from '../types/chain.js'
import { type UsdcChainId, usdcAddresses } from './usdc.js'

export type GetUsdcContractReturnType<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = GetContractReturnType<
  typeof erc20Abi,
  Client<transport, chain, account>,
  (typeof usdcAddresses)[UsdcChainId]
>

export type GetUsdcContractErrorType = ErrorType

/**
 * Returns a ready-to-use [Contract Instance](https://viem.sh/docs/contract/getContract)
 * for native USDC, resolving the contract address from the client's chain.
 *
 * @example
 * ```ts
 * import { createWalletClient, http, parseUnits } from 'viem'
 * import { base } from 'viem/chains'
 * import { getUsdcContract } from 'viem/stablecoins'
 *
 * const client = createWalletClient({ account, chain: base, transport: http() })
 * const usdc = getUsdcContract(client)
 *
 * const balance = await usdc.read.balanceOf([account.address])
 * const hash = await usdc.write.transfer([recipient, parseUnits('10', 6)])
 * ```
 */
export function getUsdcContract<
  transport extends Transport,
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<transport, chain, account>,
): GetUsdcContractReturnType<transport, chain, account> {
  const chainId = client.chain?.id
  const address = usdcAddresses[chainId as UsdcChainId]
  if (!address)
    throw new Error(
      `Native USDC is not available on chain "${chainId ?? 'unknown'}". ` +
        'See https://developers.circle.com/stablecoins/usdc-contract-addresses for supported chains.',
    )
  return getContract({
    abi: erc20Abi,
    address,
    client,
  }) as GetUsdcContractReturnType<transport, chain, account>
}
