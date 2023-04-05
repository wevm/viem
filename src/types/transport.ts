import type { Transport } from '../clients/index.js'

export type GetTransportConfig<TTransport extends Transport> =
  ReturnType<TTransport>['config']
