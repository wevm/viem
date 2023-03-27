import type { Transport } from '../clients'

export type GetTransportConfig<TTransport extends Transport> =
  ReturnType<TTransport>['config']
