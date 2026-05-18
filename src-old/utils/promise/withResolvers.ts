/** @internal */
export type PromiseWithResolvers<type> = {
  promise: Promise<type>
  resolve: (value: type | PromiseLike<type>) => void
  reject: (reason?: unknown) => void
}

/** @internal */
export function withResolvers<type>(): PromiseWithResolvers<type> {
  let resolve: PromiseWithResolvers<type>['resolve'] = () => undefined
  let reject: PromiseWithResolvers<type>['reject'] = () => undefined

  const promise = new Promise<type>((resolve_, reject_) => {
    resolve = resolve_
    reject = reject_
  })

  return { promise, resolve, reject }
}
