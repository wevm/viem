import { expect, test } from 'vitest'
import { mockClientPublicActionsL2 } from '../../../test/src/zksync.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { signTransaction } from '../../actions/index.js'
import { zkSyncChainL2 } from '../../chains/definitions/zkSyncChain:L2.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { sendRawTransactionWithDetailedOutput } from './sendRawTransactionWithDetailedOutput.js'

const account = privateKeyToAccount(
  '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110',
)

const clientL2 = createClient({
  chain: zkSyncChainL2,
  transport: http(),
  account,
})

mockClientPublicActionsL2(clientL2)

test('default', async () => {
  const output = await sendRawTransactionWithDetailedOutput(clientL2, {
    signedTx: await signTransaction(clientL2, {
      to: '0xa61464658AfeAf65CccaaFD3a512b69A83B77618',
      value: 1n,
      maxFeePerGas: 15000000n,
    }),
  })
  expect(output).toBeDefined()
})
