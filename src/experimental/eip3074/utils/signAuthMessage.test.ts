import { expect, test } from 'vitest'
import { accounts } from '../../../../test/src/constants.js'
import { keccak256 } from '../../../utils/index.js'
import { signAuthMessage } from './signAuthMessage.js'

test('default', async () => {
  expect(
    await signAuthMessage({
      chainId: 1,
      commit: keccak256('0x1234'),
      invokerAddress: '0x0000000000000000000000000000000000000000',
      nonce: 69,
      privateKey: accounts[0].privateKey,
    }),
  ).toMatchInlineSnapshot(
    `"0xfcd6431fe0dadb937bf232178cf20663c4704ba2a545775723d6c9267d5e40162f2264c10f76c6df7608ab02c453721c841b03525a30b0bc99ebdbdb0e160f351c"`,
  )

  expect(
    await signAuthMessage({
      chainId: 1,
      commit: keccak256('0x1234'),
      invokerAddress: '0xe044814c9ed1e6442af956a817c161192cbae98f',
      nonce: 378,
      privateKey: accounts[0].privateKey,
    }),
  ).toMatchInlineSnapshot(
    `"0x9e4b5ba3638005a28008bbb43e2450fc248612454b9ae2e1374701d5d15a9fe018809bf5a3fa6c05d677cc70eda231c8450bc1f5ea74c715ed8885b20654cb5c1c"`,
  )
})
