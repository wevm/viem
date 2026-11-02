import { TempoExecutionError } from '../../errors.js'
import type { Resolvers } from '../../internal/errors.js'

/** Errors this module throws for decoded Tempo errors. Narrow with `error.name`. */
export type ExecutionErrorType = PolicyNotFoundErrorType

/** `PolicyNotFoundError` with a literal `name`, for narrowing. */
export type PolicyNotFoundErrorType = PolicyNotFoundError & {
  name: 'PolicyNotFoundError'
}

/** Thrown when a transfer policy does not exist. */
export class PolicyNotFoundError extends TempoExecutionError<
  TempoExecutionError.Decoded<'PolicyNotFound'>
> {
  /** Policy ID, when known. */
  policyId: bigint | undefined

  constructor(
    parameters: TempoExecutionError.Parameters & {
      policyId?: bigint | undefined
    },
  ) {
    const { policyId } = parameters
    super(parameters, {
      details: { policy: policyId },
      name: 'PolicyNotFoundError',
      shortMessage:
        policyId === undefined
          ? undefined
          : `Transfer policy ${policyId} does not exist.`,
    })
    this.policyId = policyId
  }
}

/** @internal */
export const errorResolvers: Resolvers = {
  'PolicyNotFound()': ({ base, call }) =>
    new PolicyNotFoundError({
      ...base,
      policyId:
        call?.arg<bigint>('policyId') ?? call?.arg<bigint>('newPolicyId'),
    }),
}
