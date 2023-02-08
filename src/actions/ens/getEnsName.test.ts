import { expect, test } from 'vitest'

import { publicClient } from '../../_test'

import { getEnsName } from './getEnsName'

test('default', async () => {
  await expect(
    getEnsName(publicClient, {
      address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    }),
  ).resolves.toMatchInlineSnapshot('"awkweb.eth"')

  // await expect(
  //   getEnsName(publicClient, {
  //     address: '0x5FE6C3F8d12D5Ad1480F6DC01D8c7864Aa58C523',
  //   }),
  // ).rejects.toThrowErrorMatchingInlineSnapshot(`
  //   "execution reverted

  //   Contract:  0x0000000000000000000000000000000000000000
  //   Function:  reverse(bytes address)
  //   Arguments:        (0x28356665366333663864313264356164313438306636646330316438633738363461613538633532330461646472077265766572736500)

  //   Details: execution reverted
  //   Version: viem@1.0.2"
  // `)
})
