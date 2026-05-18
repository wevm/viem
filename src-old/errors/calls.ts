import type { GetCallsStatusReturnType } from '../actions/wallet/getCallsStatus.js'
import { BaseError } from './base.js'

export type BundleFailedErrorType = BundleFailedError & {
  name: 'BundleFailedError'
}
export class BundleFailedError extends BaseError {
  result: GetCallsStatusReturnType

  constructor(result: GetCallsStatusReturnType) {
    super(`Call bundle failed with status: ${result.statusCode}`, {
      name: 'BundleFailedError',
    })

    this.result = result
  }
}
