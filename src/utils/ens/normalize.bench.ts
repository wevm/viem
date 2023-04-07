import { describe, bench } from 'vitest'
import { ens_normalize } from '@adraffy/ens-normalize'

import { normalize } from './normalize.js'

describe('Normalize ENS name', () => {
  bench('viem: `normalize`', () => {
    normalize('\u{0061}wkw𝝣b.eth')
  })

  bench('@adraffy/ens-normalize: `ens_normalize`', () => {
    ens_normalize('\u{0061}wkw𝝣b.eth')
  })
})
