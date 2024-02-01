import { BaseError } from './base.js'

export type AccountStateConflictErrorType = AccountStateConflictError & {
  name: 'AccountStateConflictError'
}

export class AccountStateConflictError extends BaseError {
  override name = 'AccountStateConflictError'
  constructor({ address }: { address: string }) {
    super(`State for account "${address}" is set multiple times.`)
  }
}

export type StateAssignmentConflictErrorType = StateAssignmentConflictError & {
  name: 'StateAssignmentConflictError'
}

export class StateAssignmentConflictError extends BaseError {
  override name = 'StateAssignmentConflictError'
  constructor() {
    super('`state` and `stateDiff` are set on the same account.')
  }
}
