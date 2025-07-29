import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import { estimateFee } from '../actions/estimateFee.js'
import type {
  EstimateFeeParameters,
  EstimateFeeReturnType,
} from '../actions/estimateFee.js'
import {
  type EstimateGasL1ToL2Parameters,
  type EstimateGasL1ToL2ReturnType,
  estimateGasL1ToL2,
} from '../actions/estimateGasL1ToL2.js'
import {
  type GetAllBalancesParameters,
  type GetAllBalancesReturnType,
  getAllBalances,
} from '../actions/getAllBalances.js'
import {
  type GetBaseTokenL1AddressReturnType,
  getBaseTokenL1Address,
} from '../actions/getBaseTokenL1Address.js'
import {
  type GetBlockDetailsParameters,
  type GetBlockDetailsReturnType,
  getBlockDetails,
} from '../actions/getBlockDetails.js'
import {
  type GetBridgehubContractAddressReturnType,
  getBridgehubContractAddress,
} from '../actions/getBridgehubContractAddress.js'
import {
  type GetDefaultBridgeAddressesReturnType,
  getDefaultBridgeAddresses,
} from '../actions/getDefaultBridgeAddresses.js'
import {
  type GetGasPerPubdataReturnType,
  getGasPerPubdata,
} from '../actions/getGasPerPubdata.js'
import {
  type GetL1BatchBlockRangeParameters,
  type GetL1BatchBlockRangeReturnParameters,
  getL1BatchBlockRange,
} from '../actions/getL1BatchBlockRange.js'
import {
  type GetL1BatchDetailsParameters,
  type GetL1BatchDetailsReturnType,
  getL1BatchDetails,
} from '../actions/getL1BatchDetails.js'
import {
  type GetL1BatchNumberReturnType,
  getL1BatchNumber,
} from '../actions/getL1BatchNumber.js'
import {
  type GetL1ChainIdReturnType,
  getL1ChainId,
} from '../actions/getL1ChainId.js'
import {
  type GetL1TokenAddressParameters,
  type GetL1TokenAddressReturnType,
  getL1TokenAddress,
} from '../actions/getL1TokenAddress.js'
import {
  type GetL2TokenAddressParameters,
  type GetL2TokenAddressReturnType,
  getL2TokenAddress,
} from '../actions/getL2TokenAddress.js'
import {
  type GetLogProofParameters,
  type GetLogProofReturnType,
  getLogProof,
} from '../actions/getLogProof.js'
import {
  type GetMainContractAddressReturnType,
  getMainContractAddress,
} from '../actions/getMainContractAddress.js'
import {
  type GetRawBlockTransactionsParameters,
  type GetRawBlockTransactionsReturnType,
  getRawBlockTransactions,
} from '../actions/getRawBlockTransactions.js'
import {
  type GetTestnetPaymasterAddressReturnType,
  getTestnetPaymasterAddress,
} from '../actions/getTestnetPaymasterAddress.js'
import {
  type GetTransactionDetailsParameters,
  type GetTransactionDetailsReturnType,
  getTransactionDetails,
} from '../actions/getTransactionDetails.js'
import type { ChainEIP712 } from '../types/chain.js'

export type PublicActionsL2<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
> = {
  /**
   * Returns the addresses of the default zksync Era bridge contracts on both L1 and L2.
   *
   * @returns The Addresses of the default zksync Era bridge contracts on both L1 and L2. {@link DefaultBridgeAddressesReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zksyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zksyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const addresses = await client.getDefaultBridgeAddresses();
   */
  getDefaultBridgeAddresses: () => Promise<GetDefaultBridgeAddressesReturnType>

  /**
   * Returns Testnet Paymaster Address.
   *
   * @returns The Address. {@link Address}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zksyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zksyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const address = await client.getTestnetPaymasterAddress();
   */
  getTestnetPaymasterAddress: () => Promise<GetTestnetPaymasterAddressReturnType>

  /**
   * Returns the Chain Id of underlying L1 network.
   *
   * @returns number
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zksyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zksyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const chainId = await client.getL1ChainId();
   */

  getL1ChainId: () => Promise<GetL1ChainIdReturnType>

  /**
   * Returns the address of a Main zksync Contract.
   *
   * @returns The Address. {@link Address}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zksyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zksyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const address = await client.getMainContractAddress();
   */
  getMainContractAddress: () => Promise<GetMainContractAddressReturnType>

  /**
   * @deprecated This method has been removed from the node API.
   *
   * Returns all known balances for a given account.
   *
   * @returns The balances for a given account. {@link GetAllBalancesReturnType}
   * @param args - {@link GetAllBalancesParameters}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zksyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zksyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const balances = await client.getAllBalances({account: "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049"});
   */
  getAllBalances: (
    args: GetAllBalancesParameters,
  ) => Promise<GetAllBalancesReturnType>

  /**
   * Returns data of transactions in a block.
   *
   * @returns data of transactions {@link RawBlockTransactions}
   * @param args - {@link GetRawBlockTransactionsParameters}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zksyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zksyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const rawTx = await client.getRawBlockTransaction({number: 1});
   */
  getRawBlockTransaction: (
    args: GetRawBlockTransactionsParameters,
  ) => Promise<GetRawBlockTransactionsReturnType>

  /**
   * Returns additional zksync-specific information about the L2 block.
   *
   * @returns zksync-specific information about the L2 block {@link BaseBlockDetails}
   * @param args - {@link GetBlockDetailsParameters}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zksyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zksyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const blockDetails = await client.getBlockDetails({number: 1});
   */
  getBlockDetails: (
    args: GetBlockDetailsParameters,
  ) => Promise<GetBlockDetailsReturnType>

  /**
   * Returns data pertaining to a given batch.
   *
   * @returns data pertaining to a given batch {@link BatchDetails}
   * @param args - {@link GetL1BatchDetailsParameters}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zksyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zksyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const batchDetails = await client.getL1BatchDetails({number: 1});
   */
  getL1BatchDetails: (
    args: GetL1BatchDetailsParameters,
  ) => Promise<GetL1BatchDetailsReturnType>

  /**
   * Returns the range of blocks contained within a batch given by batch number.
   *
   * @returns range of blocks contained withing a batch {@link GetL1BatchBlockRangeReturnParameters}
   * @param args - {@link GetL1BatchBlockRangeParameters}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zksyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zksyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const batchBlockRange = await client.getL1BatchBlockRange({number: 1});
   */
  getL1BatchBlockRange: (
    args: GetL1BatchBlockRangeParameters,
  ) => Promise<GetL1BatchBlockRangeReturnParameters>

  /**
   * Returns the latest L1 batch number
   *
   * @returns latest L1 batch number
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zksyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zksyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const latestNumber = await client.getL1BatchNumber({number: 1});
   */
  getL1BatchNumber: () => Promise<GetL1BatchNumberReturnType>

  /**
   * Given a transaction hash, and an index of the L2 to L1 log produced within the transaction, it returns the proof for the corresponding L2 to L1 log.
   *
   * @returns the proof for the corresponding L2 to L1 log.
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zksyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zksyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const proof = await client.getLogProof({txHash: "0x...",index:1});
   */
  getLogProof: (args: GetLogProofParameters) => Promise<GetLogProofReturnType>

  /**
   * Returns data from a specific transaction given by the transaction hash
   *
   * @returns data from a specific transaction given by the transaction hash
   *
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zksyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zksyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const details = await client.getTransactionDetails({txHash: "0x..."});
   */
  getTransactionDetails: (
    args: GetTransactionDetailsParameters,
  ) => Promise<GetTransactionDetailsReturnType>

  /**
   * Returns an estimated Fee for requested transaction.
   *
   * @returns an estimated {@link Fee} for requested transaction.
   * @param args - {@link EstimateFeeParameters}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zksyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zksyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const details = await client.estimateFee({transactionRequest: {...}}});
   */
  estimateFee: (
    args: EstimateFeeParameters<chain, account>,
  ) => Promise<EstimateFeeReturnType>

  /**
   * Returns an estimated gas for L1 to L2 execution.
   *
   * @returns an estimated gas.
   * @param args - {@link EstimateGasL1ToL2Parameters}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zksyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zksyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const details = await client.estimateGasL1ToL2({transactionRequest: {...}}});
   */
  estimateGasL1ToL2: (
    args: EstimateGasL1ToL2Parameters<chain, account>,
  ) => Promise<EstimateGasL1ToL2ReturnType>

  /**
   * Returns the Bridgehub smart contract address.
   *
   * @returns address of the Bridgehub smart contract address.
   *
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zksyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zksyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const address = await client.getBridgehubContractAddress();
   */
  getBridgehubContractAddress: () => Promise<GetBridgehubContractAddressReturnType>

  /**
   * Returns the address of the base L1 token.
   *
   * @returns address of the base L1 token.
   *
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zksyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zksyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const address = await client.getBaseTokenL1Address();
   */
  getBaseTokenL1Address: () => Promise<GetBaseTokenL1AddressReturnType>

  /**
   * Returns the L2 token address equivalent for a L1 token address as they are not equal.
   * ETH address is set to zero address.
   *
   * @remarks Only works for tokens bridged on default ZKsync Era bridges.
   *
   * @param args - {@link GetL2TokenAddressParameters}
   * @returns The L2 token address equivalent for a L1 token address.
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zksync } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zksync,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const address = await client.getL2TokenAddress({token: '0x...'});
   */
  getL2TokenAddress: (
    args: GetL2TokenAddressParameters,
  ) => Promise<GetL2TokenAddressReturnType>

  /**
   * Returns the L1 token address equivalent for a L2 token address as they are not equal.
   * ETH address is set to zero address.
   *
   * @remarks Only works for tokens bridged on default ZKsync Era bridges.
   *
   * @param args - {@link GetL1TokenAddressParameters}
   * @returns The L1 token address equivalent for a L2 token address.
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zksync } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zksync,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const address = await client.getL1TokenAddress({token: '0x...'});
   */
  getL1TokenAddress: (
    args: GetL1TokenAddressParameters,
  ) => Promise<GetL1TokenAddressReturnType>

  /**
   * Returns the scaled gas per pubdata limit for the currently open batch. Available since node version 28.7.0.
   *
   * @returns the scaled gas per pubdata limit for the currently open batch
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zksyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zksyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const gasPerPubdata = await client.getGasPerPubdata();
   */
  getGasPerPubdata: () => Promise<GetGasPerPubdataReturnType>
}

export function publicActionsL2() {
  return <
    transport extends Transport = Transport,
    chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
    account extends Account | undefined = Account | undefined,
  >(
    client: Client<transport, chain, account>,
  ): PublicActionsL2<chain, account> => {
    return {
      estimateGasL1ToL2: (args) => estimateGasL1ToL2(client, args),
      getDefaultBridgeAddresses: () => getDefaultBridgeAddresses(client),
      getTestnetPaymasterAddress: () => getTestnetPaymasterAddress(client),
      getL1ChainId: () => getL1ChainId(client),
      getMainContractAddress: () => getMainContractAddress(client),
      getAllBalances: (args) => getAllBalances(client, args),
      getRawBlockTransaction: (args) => getRawBlockTransactions(client, args),
      getBlockDetails: (args) => getBlockDetails(client, args),
      getL1BatchDetails: (args) => getL1BatchDetails(client, args),
      getL1BatchBlockRange: (args) => getL1BatchBlockRange(client, args),
      getL1BatchNumber: () => getL1BatchNumber(client),
      getLogProof: (args) => getLogProof(client, args),
      getTransactionDetails: (args) => getTransactionDetails(client, args),
      estimateFee: (args) => estimateFee(client, args),
      getBridgehubContractAddress: () => getBridgehubContractAddress(client),
      getBaseTokenL1Address: () => getBaseTokenL1Address(client),
      getL2TokenAddress: (args) => getL2TokenAddress(client, args),
      getL1TokenAddress: (args) => getL1TokenAddress(client, args),
      getGasPerPubdata: () => getGasPerPubdata(client),
    }
  }
}
