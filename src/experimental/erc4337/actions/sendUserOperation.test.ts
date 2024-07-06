import { describe, expect, test } from 'vitest'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../../test/src/bundler.js'
import {
  getSmartAccounts_06,
  getSmartAccounts_07,
} from '../../../../test/src/smartAccounts.js'
import {
  estimateFeesPerGas,
  mine,
  writeContract,
} from '../../../actions/index.js'
import { parseEther } from '../../../utils/index.js'
import { sendUserOperation } from './sendUserOperation.js'

const client = anvilMainnet.getClient({ account: true })
const bundlerClient = bundlerMainnet.getBundlerClient()

describe('entryPointVersion: 0.7', async () => {
  const [account] = await getSmartAccounts_07()

  test('default', async () => {
    await writeContract(client, {
      abi: account.abi,
      address: account.address,
      functionName: 'addDeposit',
      value: parseEther('1'),
    })
    await mine(client, {
      blocks: 1,
    })

    const fees = await estimateFeesPerGas(client)

    const hash = await sendUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: parseEther('1'),
        },
      ],
      ...fees,
    })

    expect(hash).toBeDefined()
  })
})

describe('entryPointVersion: 0.6', async () => {
  const [account] = await getSmartAccounts_06()

  test('default', async () => {
    await writeContract(client, {
      abi: account.abi,
      address: account.address,
      functionName: 'addDeposit',
      value: parseEther('1'),
    })
    await mine(client, {
      blocks: 1,
    })

    const fees = await estimateFeesPerGas(client)

    const hash = await sendUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: parseEther('1'),
        },
      ],
      ...fees,
    })

    expect(hash).toBeDefined()
  })
})
