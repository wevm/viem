import { BaseError } from '../../errors/base.js'

export type TokenIsETHErrorType = TokenIsETHError & {
  name: 'TokenIsETHError'
}
export class TokenIsETHError extends BaseError {
  override name = 'TokenIsETHError'

  constructor() {
    super(
      ['Token is an ETH token.', '', "ETH token can't be retrived!"].join('\n'),
    )
  }
}
