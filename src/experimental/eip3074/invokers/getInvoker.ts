import type { Address } from 'abitype'
import {
  type GetTransactionCountErrorType,
  getTransactionCount,
} from '../../../actions/public/getTransactionCount.js'
import {
  type WriteContractErrorType,
  writeContract,
} from '../../../actions/wallet/writeContract.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Account, LocalAccount } from '../../../types/account.js'
import type { Chain, GetChainParameter } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import type { IsUndefined } from '../../../types/utils.js'
import { parseAccount } from '../../../utils/accounts.js'
import {
  type IsAddressEqualErrorType,
  isAddressEqual,
} from '../../../utils/address/isAddressEqual.js'
import { getAction } from '../../../utils/getAction.js'
import {
  type Keccak256ErrorType,
  keccak256,
} from '../../../utils/hash/keccak256.js'
import {
  type ParseSignatureErrorType,
  parseSignature,
} from '../../../utils/signature/parseSignature.js'
import {
  type SignAuthMessageErrorType,
  signAuthMessage,
} from '../actions/signAuthMessage.js'
import { invokerAbi } from '../constants/abis.js'
import type { InvokerCoder } from './coders/defineInvokerCoder.js'

type GetExecutorParameter<
  TAccount extends Account | undefined = Account | undefined,
  TAccountOverride extends Account | Address | undefined = Account | Address,
  TRequired extends boolean = true,
> = IsUndefined<TAccount> extends true
  ? TRequired extends true
    ? { executor: TAccountOverride | Account | Address }
    : { executor?: TAccountOverride | Account | Address | undefined }
  : { executor?: TAccountOverride | Account | Address | undefined }

export type InvokerExecuteParameters<
  account extends Account | undefined = Account | undefined,
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  args = unknown,
> = {
  args: args
  authority: Account | Address
  signature: Hex
} & GetExecutorParameter<account> &
  GetChainParameter<chain, chainOverride>

export type InvokerExecuteErrorType =
  | WriteContractErrorType
  | ParseSignatureErrorType
  | ErrorType

export type InvokerSignParameters<
  account extends Account | undefined = Account | undefined,
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  args = unknown,
> = {
  args: args
  authority: LocalAccount
} & GetExecutorParameter<account, Account | Address, false> &
  GetChainParameter<chain, chainOverride>

export type InvokerSignErrorType =
  | GetTransactionCountErrorType
  | SignAuthMessageErrorType
  | Keccak256ErrorType
  | IsAddressEqualErrorType
  | ErrorType

export type Invoker<
  account extends Account | undefined = Account | undefined,
  chain extends Chain | undefined = Chain | undefined,
  args = unknown,
> = {
  address: Address
  execute<chainOverride extends Chain | undefined = undefined>(
    parameters: InvokerExecuteParameters<account, chain, chainOverride, args>,
  ): Promise<Hex>
  sign<chainOverride extends Chain | undefined = undefined>(
    parameters: InvokerSignParameters<account, chain, chainOverride, args>,
  ): Promise<Hex>
}

export type GetInvokerParameters<
  account extends Account | undefined = Account | undefined,
  chain extends Chain | undefined = Chain | undefined,
  args = unknown,
> = {
  address: Address
  client: Client<Transport, chain, account>
  coder: InvokerCoder<args>
}

export type GetInvokerErrorType = ErrorType

export type InvokerArgs<invoker extends Invoker<any, any, any> = Invoker> =
  invoker extends Invoker<any, any, infer args> ? args : unknown

export function getInvoker<
  account extends Account | undefined,
  chain extends Chain | undefined,
  args,
>(
  parameters: GetInvokerParameters<account, chain, args>,
): Invoker<account, chain, args> {
  const { address, client, coder } = parameters
  return {
    address,
    async execute(parameters) {
      const {
        executor: executor_ = client.account,
        authority: authority_,
        args,
        chain = client.chain,
        signature,
      } = parameters
      const authority = parseAccount(authority_!)
      const executor = parseAccount(executor_!)

      const execData = await coder.toExecData(args, {
        authority: authority.address,
        client,
        invokerAddress: address,
      })

      const { r, s, yParity } = parseSignature(signature)
      return getAction(
        client,
        writeContract,
        'writeContract',
      )({
        abi: invokerAbi,
        address,
        account: executor,
        chain,
        functionName: 'execute',
        args: [execData, { signer: authority.address, r, s, yParity }],
      })
    },
    async sign(parameters) {
      const {
        args,
        authority,
        executor: executor_ = client.account,
        chain = client.chain,
      } = parameters
      const executor = parseAccount(executor_!)
      const [execData, nonce] = await Promise.all([
        await coder.toExecData(args, {
          authority: authority.address,
          client,
          invokerAddress: address,
        }),
        getAction(
          client,
          getTransactionCount,
          'getTransactionCount',
        )({
          address: authority.address,
          blockTag: 'pending',
        }),
      ])
      const signature = await getAction(
        client,
        signAuthMessage,
        'signAuthMessage',
      )({
        account: authority,
        chain,
        commit: keccak256(execData),
        invokerAddress: address,
        nonce: isAddressEqual(authority.address, executor.address)
          ? nonce + 1
          : nonce,
      })
      return signature
    },
  }
}
