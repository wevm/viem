import { test } from 'vitest'

import type { optimism } from '../../chains/definitions/optimism.js'
import type { FormattedBlock } from './block.js'

test('FormattedBlock', () => {
  // @ts-ignore
  type _Result = FormattedBlock<typeof optimism>
})
