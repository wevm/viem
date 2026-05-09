import { describe, expect, test } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { deploy } from '~test/utils.js'
import { ERC7821Example } from '../../../../contracts/generated.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { mine, signAuthorization } from '../../../actions/index.js'
import { erc7821Actions } from './erc7821.js'

const client = anvilMainnet
  .getClient({ account: privateKeyToAccount(accounts[0].privateKey) })
  .extend(erc7821Actions())

test('default', async () => {
  expect(erc7821Actions()(client)).toMatchInlineSnapshot(`
    {
      "execute": [Function],
      "executeBatches": [Function],
      "supportsExecutionMode": [Function],
    }
  `)
})

describe('smoke test', () => {
  test('execute', async () => {
    await mine(client, { blocks: 1 })
    const { contractAddress } = await deploy(client, {
      abi: ERC7821Example.abi,
      bytecode: ERC7821Example.bytecode.object,
    })

    const authorization = await signAuthorization(client, {
      contractAddress: contractAddress!,
      executor: 'self',
    })
    await client.execute({
      authorizationList: [authorization],
      address: client.account.address,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          data: '0x',
          value: 0n,
        },
      ],
    })
  })

  test('executeBatches', async () => {
    await mine(client, { blocks: 1 })
    const { contractAddress } = await deploy(client, {
      abi: ERC7821Example.abi,
      bytecode: ERC7821Example.bytecode.object,
    })

    const authorization = await signAuthorization(client, {
      contractAddress: contractAddress!,
      executor: 'self',
    })
    await client.executeBatches({
      authorizationList: [authorization],
      address: client.account.address,
      batches: [
        {
          calls: [
            {
              to: '0x0000000000000000000000000000000000000000',
              data: '0x',
              value: 0n,
            },
          ],
        },
      ],
    })
  })

  test('supportsExecutionMode', async () => {
    expect(
      await client.supportsExecutionMode({
        address: client.account.address,
      }),
    ).toBe(true)
  })
})
