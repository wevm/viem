import type { Abi } from 'abitype'

import type { CallParameters } from '../actions/index.js'
import { panicReasons } from '../constants/index.js'
import type { Address, Chain, Hex } from '../types/index.js'
import {
  decodeErrorResult,
  formatAbiItem,
  formatAbiItemWithArgs,
  formatEther,
  formatGwei,
  getAbiItem,
  parseAccount,
} from '../utils/index.js'
import type { DecodeErrorResultReturnType } from '../utils/index.js'
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
    }: CallParameters & {
      chain?: Chain | undefined
      docsPath?: string | undefined
    },
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
  args?: unknown[] | undefined
  override cause: BaseError
  contractAddress?: Address | undefined
  formattedArgs?: string | undefined
  functionName: string
  sender?: Address | undefined

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
      args?: any | undefined
      contractAddress?: Address | undefined
      docsPath?: string | undefined
      functionName: string
      sender?: Address | undefined
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

  data?: DecodeErrorResultReturnType | undefined
  reason?: string | undefined

  constructor({
    abi,
    data,
    functionName,
    message,
  }: {
    abi: Abi
    data?: Hex | undefined
    functionName: string
    message?: string | undefined
  }) {
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
      } else if (errorArgs) {
        const errorWithParams = abiItem
          ? formatAbiItem(abiItem, { includeName: true })
          : undefined
        const formattedArgs = abiItem
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

  data?: Hex | undefined

  constructor({
    data,
    message,
  }: { data?: Hex | undefined; message?: string | undefined }) {
    super(message || '')
    this.data = data
  }
}
