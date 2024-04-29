import type { Address } from 'abitype'
import { getTransactionCount } from '../../../actions/public/getTransactionCount.js'
import { writeContract } from '../../../actions/wallet/writeContract.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type {
  Account,
  GetAccountParameter,
  PrivateKeyAccount,
} from '../../../types/account.js'
import type { Chain, GetChainParameter } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import { parseAccount } from '../../../utils/accounts.js'
import { isAddressEqual } from '../../../utils/address/isAddressEqual.js'
import { getAction } from '../../../utils/getAction.js'
import { keccak256 } from '../../../utils/hash/keccak256.js'
import { hexToSignature } from '../../../utils/signature/hexToSignature.js'
import { signAuthMessage } from '../actions/signAuthMessage.js'
import { invokerAbi } from '../constants/abis.js'
import type { InvokerCoder } from './coders/defineInvokerCoder.js'

export type InvokerExecuteParameters<
  account extends Account | undefined = Account | undefined,
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  args = unknown,
> = {
  args: args
  authority: Account | Address
  signature: Hex
} & GetAccountParameter<account> &
  GetChainParameter<chain, chainOverride>

export type InvokerSignParameters<
  account extends Account | undefined = Account | undefined,
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  args = unknown,
> = {
  args: args
  authority: PrivateKeyAccount
} & GetAccountParameter<account, Account | Address, false> &
  GetChainParameter<chain, chainOverride>

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
        account: account_ = client.account,
        authority: authority_,
        args,
        chain = client.chain,
        signature,
      } = parameters
      const account = parseAccount(account_!)
      const authority = parseAccount(authority_!)

      const execData = await coder.toExecData(args, {
        authority: authority.address,
        client,
        invokerAddress: address,
      })

      const { r, s, yParity } = hexToSignature(signature)
      return getAction(
        client,
        writeContract,
        'writeContract',
      )({
        abi: invokerAbi,
        address,
        account,
        chain,
        functionName: 'execute',
        args: [execData, { signer: authority.address, r, s, yParity }],
      })
    },
    async sign(parameters) {
      const {
        account: account_ = client.account,
        args,
        authority,
        chain = client.chain,
      } = parameters
      const account = parseAccount(account_!)
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
        nonce: isAddressEqual(authority.address, account.address)
          ? nonce + 1
          : nonce,
      })
      return signature
    },
  }
}
