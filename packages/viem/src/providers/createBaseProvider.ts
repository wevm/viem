import { PublicRequests } from '../types'
import { buildRequest } from '../utils/buildRequest'

export type BaseProviderRequestFn = PublicRequests['request']

export type BaseProvider<
  TRequestFn extends BaseProviderRequestFn = BaseProviderRequestFn,
> = {
  request: TRequestFn
}

export function createBaseProvider<TRequestFn extends BaseProviderRequestFn>({
  request,
}: BaseProvider<TRequestFn>): BaseProvider<TRequestFn> {
  return {
    request: buildRequest(request),
  }
}
