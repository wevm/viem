// Imports only `viem/chains`: the emitter searches entrypoint export tables, so this
// proves re-exporting a chain works without the root entrypoint in the program.
import { tempo } from 'viem/chains'

export const chain = tempo
