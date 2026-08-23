import { expect, test } from 'vitest'
import * as Abis from './Abis.js'

test('groups Tempo, Earn, and Zone ABIs', () => {
  expect(Abis.core).toContain(Abis.accountKeychain[0])
  expect(Abis.core).toContain(Abis.zonePortal[0])
  expect(Abis.earn).toContain(Abis.earnContributionController[0])
  expect(Abis.earn).toContain(Abis.vedaEngine[0])
  expect(Abis.earn).not.toContain(Abis.earnRouterCallbackData[0])
  expect(Abis.zone).toContain(Abis.zoneOutbox[0])
  expect(Abis.all as readonly unknown[]).toEqual([
    ...(Abis.core as readonly unknown[]),
    ...(Abis.earn as readonly unknown[]),
    ...(Abis.zone as readonly unknown[]),
  ])
})
