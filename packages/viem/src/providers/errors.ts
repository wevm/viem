import { BaseError } from '../utils'

export class ProviderRpcError extends BaseError {
  code: number

  name = 'ProviderRpcError'

  constructor(
    { code, message }: { code: number; message: string },
    {
      docsLink,
      humanMessage = '',
    }: { docsLink?: string; humanMessage?: string } = {},
  ) {
    super({ details: message, docsLink, humanMessage: humanMessage })
    this.code = code
  }
}
