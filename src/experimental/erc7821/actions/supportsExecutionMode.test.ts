import { expect, test } from 'vitest'
import { ERC7821Example } from '../../../../contracts/generated.js'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { accounts } from '../../../../test/src/constants.js'
import { deploy } from '../../../../test/src/utils.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { mine, sendTransaction } from '../../../actions/index.js'
import { signAuthorization } from '../../eip7702/actions/signAuthorization.js'
import { supportsExecutionMode } from './supportsExecutionMode.js'

const client = anvilMainnet.getClient({
  account: privateKeyToAccount(accounts[0].privateKey),
})

test('default', async () => {
  const { contractAddress } = await deploy(client, {
    abi: ERC7821Example.abi,
    bytecode: ERC7821Example.bytecode.object,
  })

  expect(
    await supportsExecutionMode(client, {
      address: contractAddress!,
    }),
  ).toBe(true)
  expect(
    await supportsExecutionMode(client, {
      address: client.account.address,
    }),
  ).toBe(false)

  const authorization = await signAuthorization(client, {
    contractAddress: contractAddress!,
  })
  await sendTransaction(client, {
    authorizationList: [authorization],
    to: client.account.address,
  })

  await mine(client, { blocks: 1 })

  expect(
    await supportsExecutionMode(client, {
      address: client.account.address,
    }),
  ).toBe(true)
})

test('args: opData', async () => {
  const { contractAddress } = await deploy(client, {
    abi: ERC7821Example.abi,
    bytecode: ERC7821Example.bytecode.object,
  })

  expect(
    await supportsExecutionMode(client, {
      address: contractAddress!,
      opData: '0xdeadbeef',
    }),
  ).toBe(true)
})
