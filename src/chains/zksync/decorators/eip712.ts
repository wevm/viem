import type { PrepareTransactionRequestReturnType } from '../../../actions/wallet/prepareTransactionRequest.js'
import type { SendTransactionReturnType } from '../../../actions/wallet/sendTransaction.js'
import type { SignTransactionReturnType } from '../../../actions/wallet/signTransaction.js'
import { writeContract } from '../../../actions/wallet/writeContract.js'
import type { Client } from '../../../clients/createClient.js'
import type { WalletActions } from '../../../clients/decorators/wallet.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import {
  type PrepareTransactionRequestParameters,
  prepareTransactionRequest,
} from '../actions/prepareTransactionRequest.js'
import {
  type SendTransactionParameters,
  sendTransaction,
} from '../actions/sendTransaction.js'
import {
  type SignTransactionParameters,
  signTransaction,
} from '../actions/signTransaction.js'
import type { ChainEIP712 } from '../types.js'

export type Eip712Actions<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
> = {
  prepareTransactionRequest: <
    chainOverride extends ChainEIP712 | undefined = undefined,
  >(
    args: PrepareTransactionRequestParameters<chain, account, chainOverride>,
  ) => Promise<
    PrepareTransactionRequestReturnType<chain, account, chainOverride>
  >
  sendTransaction: <chainOverride extends ChainEIP712 | undefined = undefined>(
    args: SendTransactionParameters<chain, account, chainOverride>,
  ) => Promise<SendTransactionReturnType>
  signTransaction: <chainOverride extends ChainEIP712 | undefined = undefined>(
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
    prepareTransactionRequest: (args) =>
      prepareTransactionRequest(client, args as any),
    sendTransaction: (args) => sendTransaction(client, args),
    signTransaction: (args) => signTransaction(client, args as any),
    writeContract: (args) => writeContract(Object.assign(client, this), args),
  }
}
