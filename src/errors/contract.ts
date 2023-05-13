import type { Abi, Address } from 'abitype'

import { parseAccount } from '../accounts/utils/parseAccount.js'
import type { CallParameters } from '../actions/public/call.js'
import { panicReasons } from '../constants/solidity.js'
import type { Chain } from '../types/chain.js'
import type { Hex } from '../types/misc.js'
import {
  type DecodeErrorResultReturnType,
  decodeErrorResult,
} from '../utils/abi/decodeErrorResult.js'
import { formatAbiItem } from '../utils/abi/formatAbiItem.js'
import { formatAbiItemWithArgs } from '../utils/abi/formatAbiItemWithArgs.js'
import { getAbiItem } from '../utils/abi/getAbiItem.js'
import { formatEther } from '../utils/unit/formatEther.js'
import { formatGwei } from '../utils/unit/formatGwei.js'

import { BaseError } from './base.js'
import { prettyPrint } from './transaction.js'
import { getContractAddress } from './utils.js'

export class CallExecutionError extends BaseError {
  override cause: BaseError

  override name = 'CallExecutionError'

  constructor(
    cause: BaseError,
    {
      account: account_,
      docsPath,
      chain,
      data,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      value,
    }: CallParameters & { chain?: Chain; docsPath?: string },
  ) {
    const account = account_ ? parseAccount(account_) : undefined
    const prettyArgs = prettyPrint({
      from: account?.address,
      to,
      value:
        typeof value !== 'undefined' &&
        `${formatEther(value)} ${chain?.nativeCurrency.symbol || 'ETH'}`,
      data,
      gas,
      gasPrice:
        typeof gasPrice !== 'undefined' && `${formatGwei(gasPrice)} gwei`,
      maxFeePerGas:
        typeof maxFeePerGas !== 'undefined' &&
        `${formatGwei(maxFeePerGas)} gwei`,
      maxPriorityFeePerGas:
        typeof maxPriorityFeePerGas !== 'undefined' &&
        `${formatGwei(maxPriorityFeePerGas)} gwei`,
      nonce,
    })

    super(cause.shortMessage, {
      cause,
      docsPath,
      metaMessages: [
        ...(cause.metaMessages ? [...cause.metaMessages, ' '] : []),
        'Raw Call Arguments:',
        prettyArgs,
      ].filter(Boolean) as string[],
    })
    this.cause = cause
  }
}

export class ContractFunctionExecutionError extends BaseError {
  abi: Abi
  args?: unknown[]
  override cause: BaseError
  contractAddress?: Address
  formattedArgs?: string
  functionName: string
  sender?: Address

  override name = 'ContractFunctionExecutionError'

  constructor(
    cause: BaseError,
    {
      abi,
      args,
      contractAddress,
      docsPath,
      functionName,
      sender,
    }: {
      abi: Abi
      args?: any
      contractAddress?: Address
      docsPath?: string
      functionName: string
      sender?: Address
    },
  ) {
    const abiItem = getAbiItem({ abi, args, name: functionName })
    const formattedArgs = abiItem
      ? formatAbiItemWithArgs({
          abiItem,
          args,
          includeFunctionName: false,
          includeName: false,
        })
      : undefined
    const functionWithParams = abiItem
      ? formatAbiItem(abiItem, { includeName: true })
      : undefined

    const prettyArgs = prettyPrint({
      address: contractAddress && getContractAddress(contractAddress),
      function: functionWithParams,
      args:
        formattedArgs &&
        formattedArgs !== '()' &&
        `${[...Array(functionName?.length ?? 0).keys()]
          .map(() => ' ')
          .join('')}${formattedArgs}`,
      sender,
    })

    super(
      cause.shortMessage ||
        `An unknown error occurred while executing the contract function "${functionName}".`,
      {
        cause,
        docsPath,
        metaMessages: [
          ...(cause.metaMessages ? [...cause.metaMessages, ' '] : []),
          'Contract Call:',
          prettyArgs,
        ].filter(Boolean) as string[],
      },
    )
    this.abi = abi
    this.args = args
    this.cause = cause
    this.contractAddress = contractAddress
    this.functionName = functionName
    this.sender = sender
  }
}

export class ContractFunctionRevertedError extends BaseError {
  override name = 'ContractFunctionRevertedError'

  data?: DecodeErrorResultReturnType
  reason?: string

  constructor({
    abi,
    data,
    functionName,
    message,
  }: { abi: Abi; data?: Hex; functionName: string; message?: string }) {
    let decodedData: DecodeErrorResultReturnType | undefined = undefined
    let metaMessages
    let reason
    if (data && data !== '0x') {
      decodedData = decodeErrorResult({ abi, data })
      const { abiItem, errorName, args: errorArgs } = decodedData
      if (errorName === 'Error') {
        reason = (errorArgs as [string])[0]
      } else if (errorName === 'Panic') {
        const [firstArg] = errorArgs as [number]
        reason = panicReasons[firstArg as keyof typeof panicReasons]
      } else {
        const errorWithParams = abiItem
          ? formatAbiItem(abiItem, { includeName: true })
          : undefined
        const formattedArgs =
          abiItem && errorArgs
            ? formatAbiItemWithArgs({
                abiItem,
                args: errorArgs,
                includeFunctionName: false,
                includeName: false,
              })
            : undefined

        metaMessages = [
          errorWithParams ? `Error: ${errorWithParams}` : '',
          formattedArgs && formattedArgs !== '()'
            ? `       ${[...Array(errorName?.length ?? 0).keys()]
                .map(() => ' ')
                .join('')}${formattedArgs}`
            : '',
        ]
      }
    } else if (message) reason = message

    super(
      reason && reason !== 'execution reverted'
        ? [
            `The contract function "${functionName}" reverted with the following reason:`,
            reason,
          ].join('\n')
        : `The contract function "${functionName}" reverted.`,
      {
        metaMessages,
      },
    )

    this.reason = reason
    this.data = decodedData
  }
}

export class ContractFunctionZeroDataError extends BaseError {
  override name = 'ContractFunctionZeroDataError'
  constructor({ functionName }: { functionName: string }) {
    super(`The contract function "${functionName}" returned no data ("0x").`, {
      metaMessages: [
        'This could be due to any of the following:',
        `  - The contract does not have the function "${functionName}",`,
        '  - The parameters passed to the contract function may be invalid, or',
        '  - The address is not a contract.',
      ],
    })
  }
}

export class RawContractError extends BaseError {
  code = 3
  override name = 'RawContractError'

  data?: Hex | { data?: Hex }

  constructor({
    data,
    message,
  }: { data?: Hex | { data?: Hex }; message?: string }) {
    super(message || '')
    this.data = data
  }
}
