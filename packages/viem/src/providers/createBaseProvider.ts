import { Chain, PublicRequests } from '../types'
import { buildRequest } from '../utils/buildRequest'

export type BaseProviderRequestFn = PublicRequests['request']

export type BaseProvider<
  TChain extends Chain,
  TRequestFn extends BaseProviderRequestFn = BaseProviderRequestFn,
> = {
  chains: TChain[]
  request: TRequestFn
}

export function createBaseProvider<
  TChain extends Chain,
  TRequestFn extends BaseProviderRequestFn,
>({
  chains,
  request,
}: BaseProvider<TChain, TRequestFn>): BaseProvider<TChain, TRequestFn> {
  return {
    chains,
    request: buildRequest(request),
  }
}
