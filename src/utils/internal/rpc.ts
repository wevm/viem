import type * as RpcSchema from 'ox/RpcSchema'

import type { Compute, IsNarrowable } from '../../core/internal/types.js'

/** @internal */
export type Request<
  schema extends RpcSchema.Generic,
  methodName extends
    RpcSchema.MethodNameGeneric<schema> = RpcSchema.MethodNameGeneric<schema>,
> = Compute<
  Omit<
    {
      method: methodName | schema['Request']['method']
      params?: unknown
    } & (methodName extends schema['Request']['method']
      ? IsNarrowable<schema, RpcSchema.Generic> extends true
        ? Extract<schema, { Request: { method: methodName } }>['Request']
        : {}
      : {}),
    ''
  >
>
