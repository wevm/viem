import type { Address } from 'abitype'
import type {
  PrepareTransactionRequestParameterType,
  PrepareTransactionRequestReturnType,
} from '../../../actions/wallet/prepareTransactionRequest.js'
import type {
  SendTransactionParameters,
  SendTransactionReturnType,
} from '../../../actions/wallet/sendTransaction.js'
import type {
  SignTransactionParameters,
  SignTransactionReturnType,
} from '../../../actions/wallet/signTransaction.js'
import { writeContract } from '../../../actions/wallet/writeContract.js'
import type { Client } from '../../../clients/createClient.js'
import type { WalletActions } from '../../../clients/decorators/wallet.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import {
  type PrepareTransactionRequestParameters,
  prepareTransactionRequest,
} from '../actions/prepareTransactionRequest.js'
import { sendTransaction } from '../actions/sendTransaction.js'
import { signTransaction } from '../actions/signTransaction.js'
import type { ChainEIP712 } from '../types.js'

export type Eip712Actions<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = {
  prepareTransactionRequest<
    parameterType extends PrepareTransactionRequestParameterType,
    accountOverride extends Account | Address | undefined = undefined,
    chainOverride extends Chain | undefined = undefined,
  >(
    args: PrepareTransactionRequestParameters<
      chain,
      account,
      chainOverride,
      accountOverride,
      parameterType
    >,
  ): Promise<
    PrepareTransactionRequestReturnType<
      chain,
      account,
      chainOverride,
      accountOverride,
      parameterType
    >
  >
  sendTransaction: <chainOverride extends Chain | undefined = undefined>(
    args: SendTransactionParameters<chain, account, chainOverride>,
  ) => Promise<SendTransactionReturnType>
  signTransaction: <chainOverride extends Chain | undefined = undefined>(
    args: SignTransactionParameters<chain, account, chainOverride>,
  ) => Promise<SignTransactionReturnType>
  writeContract: WalletActions<chain, account>['writeContract']
}

export function eip712Actions<
  transport extends Transport,
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
>(client: Client<transport, chain, account>): Eip712Actions<chain, account> {
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
    async writeContract(args) {
      return writeContract(Object.assign(client, this), args)
    },
  }
}
