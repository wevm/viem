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

const client = anvil3074.getClient({ account: true })

test('execute', async () => {
  const { contractAddress: invokerAddress } = await deploy(client, {
    abi: BatchInvoker.abi,
    bytecode: BatchInvoker.bytecode.object,
  })

  // Initialize an invoker with it's contract address & `args` coder.
  const invoker = getInvoker({
    address: invokerAddress!,
    client,
    coder: batchInvokerCoder(),
  })

  // Construct `args` as defined by shape of `batchInvokerCoder`.
  const args = [
    { to: accounts[2].address, value: parseEther('1') },
    { to: accounts[2].address, value: parseEther('2') },
    { to: accounts[2].address, value: parseEther('3') },
  ] as const satisfies InvokerArgs<typeof invoker>

  // Authority to execute calls on behalf of.
  const authority = privateKeyToAccount(accounts[1].privateKey)

  // Sign the auth message of `args`.
  const signature = await invoker.sign({
    authority,
    args,
  })

  // Execute `args` with the signature.
  const hash = await invoker.execute({
    authority,
    args,
    signature,
  })

  await mine(client, { blocks: 1 })

  const receipt = await getTransactionReceipt(client, {
    hash,
  })

  expect(receipt.status).toBe('success')
})
