import { beforeEach } from 'vitest'

import { promiseCache, responseCache } from '../src/utils/promise/withCache'

beforeEach(() => {
  promiseCache.clear()
  responseCache.clear()
})
