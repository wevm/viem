import { afterAll, beforeAll } from 'vitest'
import { getChainId } from '../../../src/actions/public/getChainId.js'
import { setErrorConfig } from '../../../src/errors/base.js'
import { withRetry } from '../../../src/utils/promise/withRetry.js'
import { chain, getClient } from './config.js'
import { rpcUrl } from './prool.js'

const client = getClient()

beforeAll(async () => {
  setErrorConfig({ version: 'viem@x.y.z' })

  const response = await fetch(`${rpcUrl}/start`)
  if (!response.ok) throw new Error(await response.text())

  await withRetry(
    async () => {
      if ((await getChainId(client)) !== chain.id)
        throw new Error('Unexpected frame transaction chain ID.')
    },
    { delay: 100, retryCount: 20 },
  )
  console.log(await client.request({ method: 'web3_clientVersion' }))
})

afterAll(async () => {
  const response = await fetch(`${rpcUrl}/destroy`)
  if (!response.ok) throw new Error(await response.text())
})
