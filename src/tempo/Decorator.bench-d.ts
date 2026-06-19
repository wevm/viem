import { attest } from '@ark/attest'
import { createClient, http } from 'viem'
import { test } from 'vitest'
import { decorator } from './Decorator.js'

test('decorator', () => {
  createClient({
    transport: http('https://cloudflare-eth.com'),
  }).extend(decorator())
  // `tempoActions()` attaches a default Tempo chain to a chainless Client, so
  // this benchmarks a fully Tempo-typed client. The cost matches
  // `createClient({ chain: tempo, transport }).extend(decorator())`; the
  // previous baseline measured the cheaper chain-less client.
  attest.instantiations([1909230, 'instantiations'])
})
