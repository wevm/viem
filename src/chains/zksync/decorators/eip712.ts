import type { Address } from 'abitype'
import { sendTransaction } from '~viem/actions/wallet/sendTransaction.js'
import type {
  Chain,
  PrepareTransactionRequestParameterType,
  PrepareTransactionRequestParameters,
  PrepareTransactionRequestReturnType,
  SendTransactionParameters,
  SendTransactionReturnType,
  SignTransactionParameters,
  SignTransactionReturnType,
} from '~viem/index.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import { prepareTransactionRequest } from '../actions/prepareTransactionRequest.js'
import { signTransaction } from '../actions/signTransaction.js'
import type { ChainEIP712 } from '../types.js'

export type Eip712Actions<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account,
> = {
  prepareTransactionRequest<
    TParameterType extends PrepareTransactionRequestParameterType,
    TAccountOverride extends Account | Address | undefined = undefined,
    TChainOverride extends Chain | undefined = undefined,
  >(
    client: Client<Transport, TChain, TAccount>,
    argsIncoming: PrepareTransactionRequestParameters<
      TChain,
      TAccount,
      TChainOverride,
      TAccountOverride,
      TParameterType
    >,
  ): Promise<
    PrepareTransactionRequestReturnType<
      TChain,
      TAccount,
      TChainOverride,
      TAccountOverride,
      TParameterType
    >
  >

  sendTransaction: <TChainOverride extends Chain | undefined>(
    args: SendTransactionParameters<TChain, TAccount, TChainOverride>,
  ) => Promise<SendTransactionReturnType>

  signTransaction: <TChainOverride extends Chain | undefined>(
    args: SignTransactionParameters<TChain, TAccount, TChainOverride>,
  ) => Promise<SignTransactionReturnType>
}

export function eip712Actions<
  TTransport extends Transport,
  TChain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  TAccount extends Account | undefined = Account | undefined,
>(
  client: Client<TTransport, TChain, TAccount>,
): Eip712Actions<TChain, TAccount> {
  return {
    async prepareTransactionRequest(args) {
      return prepareTransactionRequest(client, args as any)
    },
    async sendTransaction(args) {
      return sendTransaction(client, args)
    },
    async signTransaction(args) {
      return signTransaction(client, args as any)
    },
  }
}
