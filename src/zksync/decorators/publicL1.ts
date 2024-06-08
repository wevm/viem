import type { Address } from '../../accounts/index.js'
import type { Chain } from '../../chains/index.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Hash } from '../../types/misc.js'
import {
  type ApproveErc20L1Parameters,
  approveErc20L1,
} from '../actions/approveL1Erc20Token.js'
import {
  type GetBaseTokenParameters,
  getBaseToken,
} from '../actions/getBaseToken.js'
import {
  type GetErc20ContractValueParameters,
  getErc20ContractValue,
} from '../actions/getErc20ContractValue.js'
import {
  type GetL1AllowanceParameters,
  type GetL1AllowanceReturnType,
  getL1Allowance,
} from '../actions/getL1Allowance.js'
import {
  type GetL1BalanceParameters,
  type GetL1BalanceReturnType,
  getL1Balance,
} from '../actions/getL1Balance.js'
import {
  type GetL1TokenBalanceParameters,
  type GetL1TokenBalanceReturnType,
  getL1TokenBalance,
} from '../actions/getL1TokenBalance.js'
import {
  type GetL2BridgeAddressParameters,
  getL2BridgeAddress,
} from '../actions/getL2BridgeAddress.js'
import {
  type GetL2TransactionBaseCostParameters,
  getL2TransactionBaseCost,
} from '../actions/getL2TransactionBaseCost.js'
import {
  type L2TransactionRequestDirectParameters,
  requestL2TransactionDirect,
} from '../actions/requestL2TransactionDirect.js'
import {
  type L2TransactionRequestTwoBridgesParameters,
  requestL2TransactionTwoBridges,
} from '../actions/requestL2TransactionTwoBridges.js'
import {
  type SharedBridgeParameters,
  sharedBridge,
} from '../actions/sharedBridge.js'

export type PublicActionsL1<
  TAccount extends Account | undefined = Account | undefined,
  TChain extends Chain | undefined = Chain | undefined,
> = {
  /**
   * Returns the amount of approved tokens for a specific L1 bridge.
   *
   * - Docs: https://viem.sh/zksync/actions/getL1Allowance
   *
   * @param client - Client to use
   * @param parameters - {@link AllowanceL1Parameters}
   * @returns The amount of approved tokens for a specific L1 bridge. {@link GetL1AllowanceReturnType}
   *
   * @example
   * import { createPublicClient, custom, parseEther } from 'viem'
   * import { base, mainnet } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(publicActionsL1())
   *
   * const data = await client.getL1Allowance({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   token: '0x5C221E77624690fff6dd741493D735a17716c26B'
   *   bridgeAddress: '0x84DbCC0B82124bee38e3Ce9a92CdE2f943bab60D',
   * })
   *
   * @example
   * // Account Hoisting
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { base, mainnet } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/zksync'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(publicActionsL1())
   *
   * const data = await client.getL1Allowance({
   *   token: '0x5C221E77624690fff6dd741493D735a17716c26B'
   *   bridgeAddress: '0x84DbCC0B82124bee38e3Ce9a92CdE2f943bab60D',
   * })
   */
  getL1Allowance: (
    parameters: GetL1AllowanceParameters<TAccount>,
  ) => Promise<GetL1AllowanceReturnType>
  /**
   * Returns the amount of the ERC20 token the client has on specific address.
   *
   * - Docs: https://viem.sh/zksync/actions/getL1TokenBalance
   *
   * @param client - Client to use
   * @param parameters - {@link GetL1TokenBalanceParameters}
   * @returns The amount of the ERC20 token the client has on specific addresse. {@link GetL1TokenBalanceReturnType}
   *
   * @example
   * import { createPublicClient, custom, parseEther } from 'viem'
   * import { base, mainnet } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(publicActionsL1())
   *
   * const data = await client.getL1TokenBalance({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   token: '0x5C221E77624690fff6dd741493D735a17716c26B'
   * })
   *
   * @example
   * // Account Hoisting
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { base, mainnet } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/zksync'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(publicActionsL1())
   *
   * const data = await client.getL1TokenBalance({
   *   token: '0x5C221E77624690fff6dd741493D735a17716c26B'
   * })
   */
  getL1TokenBalance: (
    parameters: GetL1TokenBalanceParameters<TAccount>,
  ) => Promise<GetL1TokenBalanceReturnType>
  /**
   * Returns the amount of the token held by the account on the L1 network.
   *
   * - Docs: https://viem.sh/zksync/actions/getL1TokenBalance
   *
   * @param client - Client to use
   * @param parameters - {@link BalanceL1Parameters}
   * @returns Returns the amount of the token held by the account on the L1 network. {@link GetL1BalanceReturnType}
   *
   * @example
   * import { createPublicClient, custom, parseEther } from 'viem'
   * import { base, mainnet } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: custom(window.ethereum),
   * }).extend(publicActionsL1())
   *
   * const data = await client.getL1Balance({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'
   * })
   *
   * const data = await client.getL1Balance({
   *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
   *   token: '0x5C221E77624690fff6dd741493D735a17716c26B'
   * })
   *
   * @example
   * // Account Hoisting
   * import { createWalletClient, http } from 'viem'
   * import { privateKeyToAccount } from 'viem/accounts'
   * import { base, mainnet } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/zksync'
   *
   * const client = createWalletClient({
   *   account: privateKeyToAccount('0x…'),
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(publicActionsL1())
   *
   * const data = await client.getL1Balance({})
   *
   * const data = await client.getL1Balance({
   *  token: '0x5C221E77624690fff6dd741493D735a17716c26B'
   * })
   */
  getL1Balance: (
    ...parameters: TAccount extends undefined
      ? [GetL1BalanceParameters<TAccount>]
      : [GetL1BalanceParameters<TAccount>] | []
  ) => Promise<GetL1BalanceReturnType>
  /**
   * Approves spending a specified token amount.
   *
   * @param client - Client to use
   * @param parameters - {@link ApproveErc20L1Parameters}
   * @returns Transaction Hash
   *
   * @example
   * import { createPublicClient } from 'viem'
   * import { base, mainnet } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: mainnet,
   *   transport: http(),
   * }).extend(publicActionsL1())
   *
   * const hash = await client.approveErc20L1({
   *   amount: 100000n,
   *   token: '0x5C221E77624690fff6dd741493D735a17716c26B'
   * })
   *
   */
  approveErc20L1: (
    parameters: ApproveErc20L1Parameters<TChain, TAccount>,
  ) => Promise<Hash>
  /**
   * Returns the address of the baseToken contract.
   *
   * @param client - Client to use
   * @param bridgehubContractAddress - Address of Bridge Hub Contract Address on L1
   * @returns Returns the address of the baseToken contract.
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zkSync } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zkSync,
   *   transport: http(),
   * }).extend(publicActionsL1())
   *
   * const address = await client.getBaseToken(
   *   '0x05b30BE4e32E6dD6eEe2171E0746e987BeCc9b36'
   * )
   *
   *
   */
  getBaseToken: (parameters: GetBaseTokenParameters) => Promise<Address>
  /**
   * Returns the value from erc20 contract based on the function name.
   *
   * @param client - Client to use
   * @param l1TokenAddress - Address of ERC20 token on L1
   * @param functionName - Function on a contract to call
   * @returns Returns the value from erc20 contract based on the function name.
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zkSync } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zkSync,
   *   transport: http(),
   * }).extend(publicActionsL1())
   *
   * const value = await client.getErc20ContractValue({
   *   '0x05b30BE4e32E6dD6eEe2171E0746e987BeCc9b36',
   *   'symbol'
   * })
   *
   *
   */
  getErc20ContractValue: (
    parameters: GetErc20ContractValueParameters,
  ) => Promise<string>
  /**
   * Returns the address of a L2 bridge.
   *
   * @param client - Client to use
   * @param bridgeAddress - Address of Bridge Contract Address on L1
   * @returns Returns the address of a bridge on L2.
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zkSync } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zkSync,
   *   transport: http(),
   * }).extend(publicActionsL1())
   *
   * const value = await client.getL2BridgeAddress(
   *   '0x05b30BE4e32E6dD6eEe2171E0746e987BeCc9b36',
   * )
   *
   *
   */
  getL2BridgeAddress: (
    parameters: GetL2BridgeAddressParameters,
  ) => Promise<Address>

  /**
   * Returns the address of a shared bridge.
   *
   * @param client - Client to use
   * @param bridgeAddress - Address of Bridge Contract Address on L1
   * @returns Returns the address of a shared bridge.
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zkSync } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zkSync,
   *   transport: http(),
   * }).extend(publicActionsL1())
   *
   * const address = await client.sharedBridge(
   *   '0x05b30BE4e32E6dD6eEe2171E0746e987BeCc9b36',
   * )
   *
   *
   */
  sharedBridge: (bridgeAdress: SharedBridgeParameters) => Promise<Address>

  /**
   * Returns the cost of a l2 transaction.
   *
   * @param client - Client to use
   * @param parameters - Parameters for getting the base cost of l2 transaction. {@link L2TransactionBaseCostParameters}
   * @returns Returns the cost of a l2 transaction.
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zkSync } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zkSync,
   *   transport: http(),
   * }).extend(publicActionsL1())
   *
   * const parameters = {
   *   gasPriceForEstimation:1000000n,
   *   l2GasLimit: 100000n,
   *   gasPerPubdataByte: 800n,
   *   bridgehubContractAddress:"0x5C221E77624690fff6dd741493D735a17716c26B",
   * }
   *
   * const baseCost = await client.getL2TransactionBaseCost(parameters);
   *
   */
  getL2TransactionBaseCost: (
    parameters: GetL2TransactionBaseCostParameters,
  ) => Promise<bigint>

  /**
   * Returns the L2 transaction request hash.
   *
   * @param client - Client to use
   * @param parameters - L2 Transaction Request Parameters {@link L2TransactionRequestDirectParameters}
   * @returns Returns the L2 transaction request hash
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zkSync } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zkSync,
   *   transport: http(),
   * }).extend(publicActionsL1())
   *
   * const parameters: L2TransactionRequestDirectParameters = {
   *   bridgehubContractAddress: '0x8E5937cE49C72264a2318163Aa96F9F973A83192',
   *   mintValue: parseUnits('800', 18),
   *   l2Contract: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   *   l2Value: 1n,
   *   l2Calldata: '0x',
   *   l2GasLimit: 10000000n,
   *   l2GasPerPubdataByteLimit: 800n,
   *   factoryDeps: [],
   *   refundRecipient: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
   * }
   *
   * const hash = await client.requestL2TransactionDirect(parameters);
   *
   */
  requestL2TransactionDirect: (
    parameters: L2TransactionRequestDirectParameters,
  ) => Promise<Hash>

  /**
   * Returns the L2 transaction request hash.
   *
   * @param client - Client to use
   * @param parameters - L2 Transaction Request Parameters {@link L2TransactionRequestTwoBridgesParameters}
   * @returns Returns the L2 transaction request hash
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zkSync } from 'viem/chains'
   * import { publicActionsL1 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zkSync,
   *   transport: http(),
   * }).extend(publicActionsL1())
   *
   * const parameters: L2TransactionRequestTwoBridgesParameters = {
   *   bridgehubContractAddress: '0x8E5937cE49C72264a2318163Aa96F9F973A83192',
   *   mintValue: parseUnits('800', 18),
   *   l2Value: 1n,
   *   l2GasLimit: 10000000n,
   *   l2GasPerPubdataByteLimit: BigInt(REQUIRED_L2_GAS_PRICE_PER_PUBDATA),
   *   refundRecipient: accountAddress,
   *   secondBridgeAddress: accountAddress,
   *   secondBridgeValue: 0n,
   *   secondBridgeCalldata: '0x',
   * }
   *
   * const hash = await client.requestL2TransactionTwoBridges(parameters);
   *
   */
  requestL2TransactionTwoBridges: (
    parameters: L2TransactionRequestTwoBridgesParameters,
  ) => Promise<Hash>
}

export function publicActionsL1() {
  return <
    TChain extends Chain | undefined = Chain | undefined,
    TAccount extends Account | undefined = Account | undefined,
  >(
    client: Client<Transport, TChain, TAccount>,
  ): PublicActionsL1<TAccount> => ({
    approveErc20L1: (args) => approveErc20L1(client, args),
    getL1Allowance: (args) => getL1Allowance(client, args),
    getL1TokenBalance: (args) => getL1TokenBalance(client, args),
    // @ts-expect-error
    getL1Balance: (args) => getL1Balance(client, args),
    getBaseToken: (args) => getBaseToken(client, args),
    sharedBridge: (args) => sharedBridge(client, args),
    getErc20ContractValue: (args) => getErc20ContractValue(client, args),
    getL2TransactionBaseCost: (args) => getL2TransactionBaseCost(client, args),
    requestL2TransactionDirect: (args) =>
      requestL2TransactionDirect(client, args),
    getL2BridgeAddress: (args) => getL2BridgeAddress(client, args),
    requestL2TransactionTwoBridges: (args) =>
      requestL2TransactionTwoBridges(client, args),
  })
}
