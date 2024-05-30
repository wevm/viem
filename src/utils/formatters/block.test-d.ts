import { test } from 'vitest'

import type { optimism } from '../../chains/definitions/optimism.js'
import type { FormattedBlock } from './block.js'

test('FormattedBlock', () => {
  type Result = FormattedBlock<typeof optimism>
})
