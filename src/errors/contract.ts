import { Abi } from 'abitype'
import { panicReasons } from '../constants'
import { Address, Hex } from '../types'
import {
  DecodeErrorResultResponse,
  decodeErrorResult,
  getAbiItem,
  formatAbiItem,
  formatAbiItemWithArgs,
} from '../utils'
import { BaseError } from './base'

export class ContractFunctionExecutionError extends BaseError {
  abi: Abi
  args?: unknown[]
  cause: BaseError
  contractAddress?: Address
  formattedArgs?: string
  functionName: string
  sender?: Address

  name = 'ContractFunctionExecutionError'

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

    super(
      cause.shortMessage ||
        `An unknown error occurred while executing the contract function "${functionName}".`,
      {
        cause,
        docsPath,
        metaMessages: [
          ...(cause.metaMessages ? [...cause.metaMessages, ' '] : []),
          contractAddress &&
            `Contract:  ${
              /* c8 ignore start */
              process.env.TEST
                ? '0x0000000000000000000000000000000000000000'
                : contractAddress
              /* c8 ignore end */
            }`,
          functionWithParams && `Function:  ${functionWithParams}`,
          formattedArgs &&
            formattedArgs !== '()' &&
            `Arguments: ${[...Array(functionName?.length ?? 0).keys()]
              .map(() => ' ')
              .join('')}${formattedArgs}`,
          sender && `Sender:    ${sender}`,
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
  name = 'ContractFunctionRevertedError'

  data?: DecodeErrorResultResponse
  reason?: string

  constructor({
    abi,
    data,
    functionName,
    message,
  }: { abi: Abi; data?: Hex; functionName: string; message?: string }) {
    let decodedData: DecodeErrorResultResponse | undefined = undefined
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
          errorWithParams ? `Error:     ${errorWithParams}` : '',
          formattedArgs && formattedArgs !== '()'
            ? `Arguments: ${[...Array(errorName?.length ?? 0).keys()]
                .map(() => ' ')
                .join('')}${formattedArgs}`
            : '',
        ]
      }
    } else if (message) reason = message

    super(
      reason
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
  name = 'ContractFunctionZeroDataError'
  constructor({ functionName }: { functionName: string }) {
    super(`The contract function "${functionName}" returned no data ("0x").`, {
      metaMessages: [
        'This could be due to any of the following:',
        `- The contract does not have the function "${functionName}",`,
        '- The parameters passed to the contract function may be invalid, or',
        '- The address is not a contract.',
      ],
    })
  }
}

export class RawContractError extends BaseError {
  code = 3
  name = 'RawContractError'

  data?: Hex

  constructor({ data, message }: { data?: Hex; message?: string }) {
    super(message || '')
    this.data = data
  }
}
