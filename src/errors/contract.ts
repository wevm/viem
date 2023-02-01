import { Abi } from 'abitype'
import { Address } from '../types'
import { BaseError } from './base'

export class ContractMethodExecutionError extends BaseError {
  abi?: Abi
  args?: unknown[]
  contractAddress?: Address
  formattedArgs?: string
  functionName?: string
  reason?: string
  sender?: Address

  name = 'ContractMethodExecutionError'

  constructor(
    message?: string,
    {
      abi,
      args,
      cause,
      contractAddress,
      formattedArgs,
      functionName,
      functionWithParams,
      sender,
    }: {
      abi?: Abi
      args?: any
      cause?: Error
      contractAddress?: Address
      formattedArgs?: string
      functionName?: string
      functionWithParams?: string
      sender?: Address
    } = {},
  ) {
    super(
      [
        message,
        ' ',
        sender && `Sender:    ${sender}`,
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
          `Arguments: ${[...Array(functionName?.length ?? 0).keys()]
            .map(() => ' ')
            .join('')}${formattedArgs}`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        cause,
      },
    )
    if (message) this.reason = message
    this.abi = abi
    this.args = args
    this.contractAddress = contractAddress
    this.functionName = functionName
    this.sender = sender
  }
}

export class ContractMethodZeroDataError extends BaseError {
  abi?: Abi
  args?: unknown[]
  contractAddress?: Address
  functionName?: string
  functionWithParams?: string

  name = 'ContractMethodZeroDataError'

  constructor({
    abi,
    args,
    cause,
    contractAddress,
    functionName,
    functionWithParams,
  }: {
    abi?: Abi
    args?: any
    cause?: Error
    contractAddress?: Address
    functionName?: string
    functionWithParams?: string
  } = {}) {
    super(
      [
        `The contract method "${functionName}" returned no data ("0x"). This could be due to any of the following:`,
        `- The contract does not have the function "${functionName}",`,
        '- The parameters passed to the contract function may be invalid, or',
        '- The address is not a contract.',
        ' ',
        contractAddress &&
          `Contract: ${
            /* c8 ignore start */
            process.env.TEST
              ? '0x0000000000000000000000000000000000000000'
              : contractAddress
            /* c8 ignore end */
          }`,
        functionWithParams && `Function: ${functionWithParams}`,
        functionWithParams && `        > "0x"`,
      ]
        .filter(Boolean)
        .join('\n'),
      {
        cause,
      },
    )
    this.abi = abi
    this.args = args
    this.contractAddress = contractAddress
    this.functionName = functionName
  }
}
