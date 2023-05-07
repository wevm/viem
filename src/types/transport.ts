import type { Transport } from '../clients/transports/createTransport.js'

export type GetTransportConfig<TTransport extends Transport> =
  ReturnType<TTransport>['config']
