import * as generated from '~contracts/generated.js'
import { Actions } from 'viem'
import * as anvil from '~test/anvil.js'
import * as contract from '~test/contract.js'
import { Address } from 'ox'
import { expect, test } from 'vitest'

const client = anvil.getClient(anvil.mainnet)

const { address } = await contract.deploy(client, {
  bytecode: generated.Eip712.bytecode.object,
})

test('default', async () => {
  const { domain, ...rest } = await Actions.contract.getEip712Domain(client, {
    address,
  })
  const { verifyingContract, ...restDomain } = domain
  expect(verifyingContract).toBe(Address.checksum(address))
  expect(restDomain).toMatchInlineSnapshot(`
      {
        "chainId": 1,
        "name": "ExampleContract",
        "salt": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "version": "1",
      }
    `)
  expect(rest).toMatchInlineSnapshot(`
      {
        "extensions": [],
        "fields": "0x0f",
      }
    `)
})

test('error: contract does not implement eip712Domain', async () => {
  await expect(() =>
    Actions.contract.getEip712Domain(client, {
      address: '0x0000000000000000000000000000000000000000',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Eip712Domain.NotFoundError: No EIP-712 domain found on contract "0x0000000000000000000000000000000000000000".

      Ensure that:
      - The contract is deployed at the address "0x0000000000000000000000000000000000000000".
      - \`eip712Domain()\` function exists on the contract.
      - \`eip712Domain()\` function matches signature to ERC-5267 specification.

      Version: viem@2.52.1]
    `)
})

test('error: rethrows non-zero-data errors', async () => {
  const { address } = await contract.deploy(client, {
    bytecode: generated.Erc721.bytecode.object,
  })
  await expect(() =>
    Actions.contract.getEip712Domain(client, { address }),
  ).rejects.toThrowError('reverted')
})
