import type { Transport } from '../clients/transports/createTransport.js'

export type GetTransportConfig<TTransport extends Transport> =
  ReturnType<TTransport>['config']

export type GetPollOptions<transport extends Transport> =
  | (GetTransportConfig<transport>['type'] extends 'webSocket'
      ? {
          batch?: undefined
          /**
           * Whether or not the WebSocket Transport should poll the JSON-RPC, rather than using `eth_subscribe`.
           * @default false
           */
          poll?: false | undefined
          pollingInterval?: undefined
        }
      : never)
  | {
      poll?: true | undefined
      /**
       * Whether or not the transaction hashes should be batched on each invocation.
       * @default true
       */
      batch?: boolean | undefined
      /**
       * Polling frequency (in ms). Defaults to Client's pollingInterval config.
       * @default client.pollingInterval
       */
      pollingInterval?: number | undefined
    }
