import { expect, test } from 'vitest'
import { zkSyncClientZksync } from '~test/src/zksync.js'
import { getL1ChainId } from './getL1ChainId.js'


const client = { ...zkSyncClientZksync }

test('default', async () => {
    const chainId = await getL1ChainId(client)
    expect(chainId).to.equal("0x9")
})