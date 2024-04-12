import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import {
  type GetAllBalancesParameters,
  type GetAllBalancesReturnType,
  getAllBalances,
} from '../actions/getAllBalances.js'
import {
  type BlockDetails,
  type GetBlockDetailsParameters,
  getBlockDetails,
} from '../actions/getBlockDetails.js'
import {
  type BridgeContractsReturnType,
  getDefaultBridgeAddresses,
} from '../actions/getBridgeContracts.js'
import {
  type GetL1BatchBlockRangeParameters,
  type GetL1BatchBlockRangeReturnParameters,
  getL1BatchBlockRange,
} from '../actions/getL1BatchBlockRange.js'
import {
  type BatchDetails,
  type GetL1BatchDetailsParameters,
  getL1BatchDetails,
} from '../actions/getL1BatchDetails.js'
import { getL1BatchNumber } from '../actions/getL1BatchNumber.js'
import { getL1ChainId } from '../actions/getL1ChainId.js'
import { getMainContractAddress } from '../actions/getMainContractAddress.js'
import {
  type GetRawBlockTransactionParameters,
  type RawBlockTransaction,
  getRawBlockTransaction,
} from '../actions/getRawBlockTransaction.js'
import { getTestnetPaymasterAddress } from '../actions/getTestnetPaymasterAddress.js'

export type PublicActionsL2<> = {
  /**
   * Returns Testnet Paymaster Address.
   *
   * @returns The Address. {@link Address}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zkSyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zkSyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const address = await client.getTestnetPaymasterAddress();
   */
  getTestnetPaymasterAddress: () => Promise<Address>

  /**
   * Returns the Chain Id of underlying L1 network.
   *
   * @returns number
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zkSyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zkSyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const chainId = await client.getL1ChainId();
   */

  getL1ChainId: () => Promise<number>

  /**
   * Returns the address of a Main zkSync Contract.
   *
   * @returns The Address. {@link Address}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zkSyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zkSyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const address = await client.getMainContractAddress();
   */
  getMainContractAddress: () => Promise<Address>

  /**
   * Returns the address of a Main zkSync Contract.
   *
   * @returns The Addresses of L1/L2 default bridges. {@link BridgeContractsReturnType}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zkSyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zkSyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const addresses = await client.getDefaultBridgeAddresses();
   */
  getDefaultBridgeAddresses: () => Promise<BridgeContractsReturnType>

  /**
   * Returns all known balances for a given account.
   *
   * @returns The balances for a given account. {@link GetAllBalancesReturnType}
   * @param args - {@link GetAllBalancesParameters}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zkSyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zkSyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const balances = await client.getAllBalances({address:"0x36615Cf349d7F6344891B1e7CA7C72883F5dc049"});
   */
  getAllBalances: (
    args: GetAllBalancesParameters,
  ) => Promise<GetAllBalancesReturnType>

  /**
   * Returns data of transactions in a block.
   *
   * @returns data of transactions {@link RawBlockTransaction}
   * @param args - {@link GetRawBlockTransactionParameters}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zkSyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zkSyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const rawTx = await client.getRawBlockTransaction({number:1});
   */
  getRawBlockTransaction: (
    args: GetRawBlockTransactionParameters,
  ) => Promise<RawBlockTransaction>

  /**
   * Returns additional zkSync-specific information about the L2 block.
   *
   * @returns zkSync-specific information about the L2 block {@link BlockDetails}
   * @param args - {@link GetBlockDetailsParameters}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zkSyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zkSyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const blockDetails = await client.getBlockDetails({number:1});
   */
  getBlockDetails: (args: GetBlockDetailsParameters) => Promise<BlockDetails>

  /**
   * Returns data pertaining to a given batch.
   *
   * @returns data pertaining to a given batch {@link BatchDetails}
   * @param args - {@link GetL1BatchDetailsParameters}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zkSyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zkSyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const batchDetails = await client.getL1BatchDetails({number:1});
   */
  getL1BatchDetails: (
    args: GetL1BatchDetailsParameters,
  ) => Promise<BatchDetails>

  /**
   * Returns the range of blocks contained within a batch given by batch number.
   *
   * @returns range of blocks contained withing a batch {@link GetL1BatchBlockRangeReturnParameters}
   * @param args - {@link GetL1BatchBlockRangeParameters}
   *
   * @example
   * import { createPublicClient, http } from 'viem'
   * import { zkSyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zkSyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const batchBlockRange = await client.getL1BatchBlockRange({number:1});
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
   * import { zkSyncLocalNode } from 'viem/chains'
   * import { publicActionsL2 } from 'viem/zksync'
   *
   * const client = createPublicClient({
   *   chain: zkSyncLocalNode,
   *   transport: http(),
   * }).extend(publicActionsL2())
   *
   * const latestNumber = await client.getL1BatchNumber({number:1});
   */
  getL1BatchNumber: () => Promise<number>
}

export function publicActionsL2() {
  return <TTransport extends Transport>(
    client: Client<TTransport>,
  ): PublicActionsL2 => {
    return {
      getTestnetPaymasterAddress: () => getTestnetPaymasterAddress(client),
      getL1ChainId: () => getL1ChainId(client),
      getMainContractAddress: () => getMainContractAddress(client),
      getDefaultBridgeAddresses: () => getDefaultBridgeAddresses(client),
      getAllBalances: (args) => getAllBalances(client, args),
      getRawBlockTransaction: (args) => getRawBlockTransaction(client, args),
      getBlockDetails: (args) => getBlockDetails(client, args),
      getL1BatchDetails: (args) => getL1BatchDetails(client, args),
      getL1BatchBlockRange: (args) => getL1BatchBlockRange(client, args),
      getL1BatchNumber: () => getL1BatchNumber(client),
    }
  }
}
