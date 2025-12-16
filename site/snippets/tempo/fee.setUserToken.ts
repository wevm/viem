// [!region viem]
// @errors: 2307
import { client } from './viem.config'

const { receipt } = await client.fee.setUserTokenSync({
  token: '0x20c0000000000000000000000000000000000001',
})

console.log('Transaction hash:', receipt.transactionHash)
// @log: Transaction hash: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
// [!endregion viem]
