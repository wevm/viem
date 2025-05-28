import { type Address, parseAbi } from 'abitype'
import type { Account } from '../../accounts/types.js'
import { getTransaction } from '../../actions/public/getTransaction.js'
import { getTransactionReceipt } from '../../actions/public/getTransactionReceipt.js'
import { readContract } from '../../actions/public/readContract.js'
import {
  type SendTransactionErrorType,
  type SendTransactionParameters,
  type SendTransactionReturnType,
  sendTransaction,
} from '../../actions/wallet/sendTransaction.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { zeroHash } from '../../constants/bytes.js'
import { AccountNotFoundError } from '../../errors/account.js'
import { ClientChainNotConfiguredError } from '../../errors/chain.js'
import type { TransactionReceiptNotFoundErrorType } from '../../errors/transaction.js'
import type { GetAccountParameter } from '../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import type { Hex } from '../../types/misc.js'
import type { UnionEvaluate, UnionOmit } from '../../types/utils.js'
import {
  type FormattedTransactionRequest,
  decodeAbiParameters,
  decodeFunctionData,
  encodeAbiParameters,
  encodeFunctionData,
  isAddressEqual,
  parseAccount,
} from '../../utils/index.js'
import { bootloaderFormalAddress } from '../constants/address.js'
import {
  CannotClaimSuccessfulDepositError,
  type CannotClaimSuccessfulDepositErrorType,
  L2BridgeNotFoundError,
  type L2BridgeNotFoundErrorType,
  LogProofNotFoundError,
  type LogProofNotFoundErrorType,
} from '../errors/bridge.js'
import type { ChainEIP712 } from '../types/chain.js'
import type { BridgeContractAddresses } from '../types/contract.js'
import type { ZksyncTransactionReceipt } from '../types/transaction.js'
import { undoL1ToL2Alias } from '../utils/bridge/undoL1ToL2Alias.js'
import { getDefaultBridgeAddresses } from './getDefaultBridgeAddresses.js'
import { getLogProof } from './getLogProof.js'

export type ClaimFailedDepositParameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  chainL2 extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  accountL2 extends Account | undefined = Account | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = UnionEvaluate<
  UnionOmit<FormattedTransactionRequest<_derivedChain>, 'data' | 'to' | 'from'>
> &
  Partial<GetChainParameter<chain, chainOverride>> &
  Partial<GetAccountParameter<account>> & {
    /** L2 client. */
    client: Client<Transport, chainL2, accountL2>
    /** The L2 transaction hash of the failed deposit. */
    depositHash: Hash
  }

export type ClaimFailedDepositReturnType = SendTransactionReturnType

export type ClaimFailedDepositErrorType =
  | SendTransactionErrorType
  | TransactionReceiptNotFoundErrorType
  | CannotClaimSuccessfulDepositErrorType
  | LogProofNotFoundErrorType
  | L2BridgeNotFoundErrorType

/**
 * Withdraws funds from the initiated deposit, which failed when finalizing on L2.
 * If the deposit L2 transaction has failed, it sends an L1 transaction calling `claimFailedDeposit` method of the
 * L1 bridge, which results in returning L1 tokens back to the depositor.
 *
 * @param client - Client to use
 * @param parameters - {@link ClaimFailedDepositParameters}
 * @returns hash - The [Transaction](https://viem.sh/docs/glossary/terms#transaction) hash. {@link ClaimFailedDepositReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { zksync, mainnet } from 'viem/chains'
 * import { claimFailedDeposit, publicActionsL2 } from 'viem/zksync'
 *
 * const client = createPublicClient({
 *     chain: mainnet,
 *     transport: http(),
 * })
 *
 * const clientL2 = createPublicClient({
 *   chain: zksync,
 *   transport: http(),
 * }).extend(publicActionsL2())
 *
 * const account = privateKeyToAccount('0x…')
 *
 * const hash = await claimFailedDeposit(client, {
 *     client: clientL2,
 *     account,
 *     depositHash: <L2_HASH_OF_FAILED_DEPOSIT>,
 * })
 *
 * @example Account Hoisting
 * import { createPublicClient, createWalletClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { zksync, mainnet } from 'viem/chains'
 * import { publicActionsL2 } from 'viem/zksync'
 *
 * const walletClient = createWalletClient({
 *   chain: mainnet,
 *   transport: http(),
 *   account: privateKeyToAccount('0x…'),
 * })
 *
 * const clientL2 = createPublicClient({
 *   chain: zksync,
 *   transport: http(),
 * }).extend(publicActionsL2())
 *
 * const hash = await claimFailedDeposit(walletClient, {
 *     client: clientL2,
 *     depositHash: <L2_HASH_OF_FAILED_DEPOSIT>,
 * })
 */
export async function claimFailedDeposit<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  chainL2 extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  accountL2 extends Account | undefined = Account | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
>(
  client: Client<Transport, chain, account>,
  parameters: ClaimFailedDepositParameters<
    chain,
    account,
    chainOverride,
    chainL2,
    accountL2
  >,
): Promise<ClaimFailedDepositReturnType> {
  const {
    account: account_ = client.account,
    chain: chain_ = client.chain,
    client: l2Client,
    depositHash,
    ...rest
  } = parameters

  const account = account_ ? parseAccount(account_) : client.account
  if (!account)
    throw new AccountNotFoundError({
      docsPath: '/docs/actions/wallet/sendTransaction',
    })
  if (!l2Client.chain) throw new ClientChainNotConfiguredError()

  const receipt = <ZksyncTransactionReceipt>(
    await getTransactionReceipt(l2Client, { hash: depositHash })
  )

  const successL2ToL1LogIndex = receipt.l2ToL1Logs.findIndex(
    (l2ToL1log) =>
      isAddressEqual(<Hex>l2ToL1log.sender, bootloaderFormalAddress) &&
      l2ToL1log.key === depositHash,
  )
  const successL2ToL1Log = receipt.l2ToL1Logs[successL2ToL1LogIndex]
  if (successL2ToL1Log?.value !== zeroHash)
    throw new CannotClaimSuccessfulDepositError({ hash: depositHash })

  const tx = await getTransaction(l2Client, { hash: depositHash })

  // Undo the aliasing, since the Mailbox contract set it as for contract address.
  const l1BridgeAddress = undoL1ToL2Alias(receipt.from)
  const l2BridgeAddress = receipt.to
  if (!l2BridgeAddress) throw new L2BridgeNotFoundError()

  const l1NativeTokenVault = (await getBridgeAddresses(client, l2Client))
    .l1NativeTokenVault

  let depositSender: Hex
  let assetId: Hex
  let assetData: Hex
  try {
    const { args } = decodeFunctionData({
      abi: parseAbi([
        'function finalizeDeposit(address _l1Sender, address _l2Receiver, address _l1Token, uint256 _amount, bytes _data)',
      ]),
      data: tx.input,
    })
    assetData = encodeAbiParameters(
      [{ type: 'uint256' }, { type: 'address' }, { type: 'address' }],
      [args[3], args[1], args[2]],
    )
    assetId = await readContract(client, {
      address: l1NativeTokenVault,
      abi: parseAbi(['function assetId(address token) view returns (bytes32)']),
      functionName: 'assetId',
      args: [args[2]],
    })
    depositSender = args[0]
    if (assetId === zeroHash)
      throw new Error(`Token ${args[2]} not registered in NTV`)
  } catch (_e) {
    const { args } = decodeFunctionData({
      abi: parseAbi([
        'function finalizeDeposit(uint256 _chainId, bytes32 _assetId, bytes _transferData)',
      ]),
      data: tx.input,
    })
    assetId = args[1]
    const transferData = args[2]
    const l1TokenAddress = await readContract(client, {
      address: l1NativeTokenVault,
      abi: parseAbi([
        'function tokenAddress(bytes32 assetId) view returns (address)',
      ]),
      functionName: 'tokenAddress',
      args: [assetId],
    })
    const transferDataDecoded = decodeAbiParameters(
      [
        { type: 'address' },
        { type: 'address' },
        { type: 'address' },
        { type: 'uint256' },
        { type: 'bytes' },
      ],
      transferData,
    )
    assetData = encodeAbiParameters(
      [{ type: 'uint256' }, { type: 'address' }, { type: 'address' }],
      [transferDataDecoded[3], transferDataDecoded[1], l1TokenAddress],
    )
    depositSender = transferDataDecoded[0]
  }

  const proof = await getLogProof(l2Client, {
    txHash: depositHash,
    index: successL2ToL1LogIndex,
  })
  if (!proof)
    throw new LogProofNotFoundError({
      hash: depositHash,
      index: successL2ToL1LogIndex,
    })

  const data = encodeFunctionData({
    abi: parseAbi([
      'function bridgeRecoverFailedTransfer(uint256 _chainId, address _depositSender, bytes32 _assetId, bytes _assetData, bytes32 _l2TxHash, uint256 _l2BatchNumber, uint256 _l2MessageIndex, uint16 _l2TxNumberInBatch, bytes32[] _merkleProof)',
    ]),
    functionName: 'bridgeRecoverFailedTransfer',
    args: [
      BigInt(l2Client.chain.id),
      depositSender,
      assetId,
      assetData,
      depositHash,
      receipt.l1BatchNumber!,
      BigInt(proof.id),
      Number(receipt.l1BatchTxIndex),
      proof.proof,
    ],
  })

  return await sendTransaction(client, {
    chain: chain_,
    account,
    to: l1BridgeAddress,
    data,
    ...rest,
  } as SendTransactionParameters)
}

async function getBridgeAddresses<
  chain extends Chain | undefined,
  chainL2 extends ChainEIP712 | undefined,
>(
  client: Client<Transport, chain>,
  l2Client: Client<Transport, chainL2>,
): Promise<
  BridgeContractAddresses & {
    l1Nullifier: Address
    l1NativeTokenVault: Address
  }
> {
  const addresses = await getDefaultBridgeAddresses(l2Client)
  let l1Nullifier = addresses.l1Nullifier
  let l1NativeTokenVault = addresses.l1NativeTokenVault

  if (!l1Nullifier)
    l1Nullifier = await readContract(client, {
      address: addresses.sharedL1,
      abi: parseAbi(['function L1_NULLIFIER() view returns (address)']),
      functionName: 'L1_NULLIFIER',
      args: [],
    })
  if (!l1NativeTokenVault)
    l1NativeTokenVault = await readContract(client, {
      address: addresses.sharedL1,
      abi: parseAbi(['function nativeTokenVault() view returns (address)']),
      functionName: 'nativeTokenVault',
      args: [],
    })

  return {
    ...addresses,
    l1Nullifier,
    l1NativeTokenVault,
  }
}
