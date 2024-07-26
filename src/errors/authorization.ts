import { BaseError } from './base.js'

export type EmptyAuthorizationListErrorType = EmptyAuthorizationListError & {
  name: 'EmptyAuthorizationListError'
}
export class EmptyAuthorizationListError extends BaseError {
  override name = 'EmptyAuthorizationListError'
  constructor() {
    super('Authorization list must not be empty.')
  }
}
