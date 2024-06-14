import { BaseError } from '../../errors/base.js'

export type TokenIsEthErrorType = TokenIsEthError & {
  name: 'TokenIsEthError'
}
export class TokenIsEthError extends BaseError {
  override name = 'TokenIsEthError'

  constructor() {
    super(
      ['Token is an ETH token.', '', 'ETH token cannot be retrived.'].join(
        '\n',
      ),
    )
  }
}
