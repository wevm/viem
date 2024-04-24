import { expect, test } from 'vitest'
import { Invoker } from '../../../test/contracts/generated.js'
import { anvil3074 } from '../../../test/src/anvil.js'
import { accounts } from '../../../test/src/constants.js'
import { deploy } from '../../../test/src/utils.js'
import { privateKeyToAccount } from '../../accounts/index.js'
import { getContract } from '../../actions/getContract.js'
import { getTransactionReceipt, mine } from '../../actions/index.js'
import { concat, encodePacked, parseEther } from '../../utils/index.js'
import { hexToSignature } from '../../utils/signature/hexToSignature.js'
import { signAuthMessage } from './actions/signAuthMessage.js'

const client = anvil3074.getClient({ account: true })
const authorityClient = anvil3074.getClient({
  account: privateKeyToAccount(accounts[1].privateKey),
})

test('execute', async () => {
  const { contractAddress: invokerAddress } = await deploy(client, {
    abi: Invoker.abi,
    bytecode: Invoker.bytecode.object,
  })

  const contract = getContract({
    abi: Invoker.abi,
    address: invokerAddress!,
    client,
  })

  const calls = concat([
    encodePacked(
      ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
      [2, accounts[2].address, parseEther('1'), 0n, '0x'],
    ),
    encodePacked(
      ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
      [2, accounts[2].address, parseEther('2'), 0n, '0x'],
    ),
    encodePacked(
      ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
      [2, accounts[2].address, parseEther('3'), 0n, '0x'],
    ),
  ])

  const commit = await contract.read.getCommit([
    calls,
    authorityClient.account.address,
  ])

  const signature = await signAuthMessage(authorityClient, {
    commit,
    invokerAddress: invokerAddress!,
  })

  const hash = await contract.write.execute([
    calls,
    authorityClient.account.address,
    hexToSignature(signature!),
  ])

  await mine(client, { blocks: 1 })

  const receipt = await getTransactionReceipt(client, {
    hash,
  })

  expect(receipt.status).toBe('success')
})
