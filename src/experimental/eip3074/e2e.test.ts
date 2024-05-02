import { expect, test } from 'vitest'
import { BatchInvoker } from '../../../test/contracts/generated.js'
import { anvil3074 } from '../../../test/src/anvil.js'
import { accounts } from '../../../test/src/constants.js'
import { deploy } from '../../../test/src/utils.js'
import { privateKeyToAccount } from '../../accounts/index.js'
import { getTransactionReceipt, mine } from '../../actions/index.js'
import { parseEther } from '../../utils/index.js'
import { batchInvokerCoder } from './invokers/coders/batchInvokerCoder.js'
import { type InvokerArgs, getInvoker } from './invokers/getInvoker.js'

const client = anvil3074.getClient()

test('execute', async () => {
  const { contractAddress: invokerAddress } = await deploy(client, {
    abi: BatchInvoker.abi,
    bytecode: BatchInvoker.bytecode.object,
  })

  const invoker = getInvoker({
    address: invokerAddress!,
    client,
    coder: batchInvokerCoder(),
  })

  const args = [
    { to: accounts[2].address, value: parseEther('1') },
    { to: accounts[2].address, value: parseEther('2') },
    { to: accounts[2].address, value: parseEther('3') },
  ] as const satisfies InvokerArgs<typeof invoker>

  const authority = privateKeyToAccount(accounts[0].privateKey)
  const executor = privateKeyToAccount(accounts[1].privateKey)

  const signature = await invoker.sign({
    authority,
    args,
    executor,
  })

  const hash = await invoker.execute({
    authority,
    args,
    executor,
    signature,
  })

  await mine(client, { blocks: 1 })

  const receipt = await getTransactionReceipt(client, {
    hash,
  })

  expect(receipt.status).toBe('success')
})
