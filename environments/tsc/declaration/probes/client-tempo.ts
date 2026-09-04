// A Tempo Client from the `viem/tempo` entrypoint only: also proves the entrypoint's
// own export table carries what its consumers' declaration emit needs.
import { Client, http, tempoActions } from 'viem/tempo'

export const tempoClient = Client.create({
  transport: http(),
}).extend(tempoActions())
