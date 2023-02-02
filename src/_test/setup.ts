import { beforeEach } from 'vitest'

import { promiseCache, responseCache } from '../utils/promise/withCache'

beforeEach(() => {
  promiseCache.clear()
  responseCache.clear()
})
