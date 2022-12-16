import { BaseError } from '../../utils'

export class UrlRequiredError extends BaseError {
  constructor() {
    super({
      humanMessage: 'No URL was provided to the Transport.',
      details: `A valid RPC URL is required to execute an Action. Please provide a valid RPC URL to the Transport.`,
      docsPath: '/TODO',
    })
  }
}
