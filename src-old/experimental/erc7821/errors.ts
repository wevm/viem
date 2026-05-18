import { BaseError } from '../../errors/base.js'

export type ExecuteUnsupportedErrorType = ExecuteUnsupportedError & {
  name: 'ExecuteUnsupportedError'
}
export class ExecuteUnsupportedError extends BaseError {
  constructor() {
    super('ERC-7821 execution is not supported.', {
      name: 'ExecuteUnsupportedError',
    })
  }
}

export type FunctionSelectorNotRecognizedErrorType =
  FunctionSelectorNotRecognizedError & {
    name: 'FunctionSelectorNotRecognizedError'
  }
export class FunctionSelectorNotRecognizedError extends BaseError {
  constructor() {
    super('Function is not recognized.', {
      metaMessages: [
        'This could be due to any of the following:',
        '  - The contract does not have the function,',
        '  - The address is not a contract.',
      ],
      name: 'FunctionSelectorNotRecognizedError',
    })
  }
}
