import { Value } from 'ox'
import { expect, test } from 'vitest'

import { Account, Actions, testActions, walletActions } from 'viem'
import { avalanche } from 'viem/chains'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import {
  client as tokenClient,
  holder,
  prepareAccount,
  usdc,
} from '~test/token.js'

const client = anvil.getClient(anvil.mainnet)
const testClient = client.extend(testActions())
const walletClient = client.extend(walletActions())
const source = constants.accounts[0]
const target = constants.accounts[1]
const account = Account.fromPrivateKey(source.privateKey)

test('decorates a client with wallet actions', async () => {
  await testClient.address.setBalance({
    address: source.address,
    value: source.balance,
  })
  const hash = await walletClient.transaction.send({
    account,
    to: target.address,
    value: Value.fromEther('0.0001'),
  })
  await testClient.block.mine({ blocks: 1 })
  const receipt = await Actions.transaction.getReceipt(client, { hash })

  expect(receipt.status).toMatchInlineSnapshot(`"success"`)
})

test('decorates a client with chains actions', async () => {
  const client = anvil.getWalletClient(anvil.mainnet).extend(walletActions())
  await client.chains.add({ chain: avalanche })
  await client.chains.switch({ id: avalanche.id })
})

test('decorates a client with wallet namespace actions', async () => {
  const client = anvil.getWalletClient(anvil.mainnet).extend(walletActions())
  expect(
    (await client.wallet.connect({})).accounts[0]?.address,
  ).toMatchInlineSnapshot(`"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"`)
  await client.wallet.disconnect()
  expect((await client.wallet.getAddresses())[0]).toMatchInlineSnapshot(
    `"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"`,
  )
  expect(
    (await client.wallet.getAssets({ account: source.address }))[1],
  ).toBeInstanceOf(Array)
  expect(await client.wallet.getPermissions()).toHaveLength(1)
  expect(
    await client.wallet.requestPermissions({ eth_accounts: {} }),
  ).toHaveLength(1)
  expect(await client.wallet.requestAddresses()).toMatchInlineSnapshot(`
    [
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    ]
  `)
  expect(
    await client.wallet.watchAsset({
      type: 'ERC20',
      options: {
        address: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
        symbol: 'FOO',
        decimals: 18,
      },
    }),
  ).toBe(true)

  expect(
    await client.wallet.prepareAuthorization({
      account,
      address: target.address,
      chainId: 1,
      nonce: 0n,
    }),
  ).toMatchInlineSnapshot(`
    {
      "address": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
      "chainId": 1,
      "nonce": 0n,
    }
  `)
  const authorization = await client.wallet.signAuthorization({
    account,
    address: target.address,
    chainId: 1,
    nonce: 0n,
  })
  expect(authorization.r).toBeDefined()
  expect(authorization.s).toBeDefined()
})

test('decorates a client with wallet sign actions', async () => {
  const client = anvil.getWalletClient(anvil.mainnet).extend(walletActions())
  const signature = await client.signMessage({
    account,
    message: 'hello world',
  })
  expect(signature).toMatchInlineSnapshot(
    `"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"`,
  )

  const signed = await client.signTransaction({
    account,
    to: target.address,
    value: 1n,
  })
  expect(signed.startsWith('0x02')).toBe(true)

  expect(
    await client.signTypedData({
      ...constants.typedData.basic,
      account,
      primaryType: 'Mail',
    }),
  ).toMatchInlineSnapshot(
    `"0x32f3d5975ba38d6c2fba9b95d5cbed1febaa68003d3d588d51f2de522ad54117760cfc249470a75232552e43991f53953a3d74edf6944553c6bef2469bb9e5921b"`,
  )
})

test('decorates a client with contract actions', async () => {
  await testClient.address.setBalance({
    address: source.address,
    value: source.balance,
  })
  await testClient.block.setAutomine({ enabled: true })
  const client = anvil.getClient(anvil.mainnet).extend(walletActions())

  const hash = await client.contract.deploy({
    abi: generated.Erc721.abi,
    account,
    bytecode: generated.Erc721.bytecode.object,
  })
  await testClient.block.mine({ blocks: 1 })
  expect(
    (await Actions.transaction.getReceipt(client, { hash })).status,
  ).toMatchInlineSnapshot(`"success"`)

  const receipt = await client.contract.deploySync({
    abi: generated.Erc721.abi,
    account,
    bytecode: generated.Erc721.bytecode.object,
    pollingInterval: 50,
  })
  const address = receipt.contractAddress
  if (!address) throw new Error('contract not deployed.')

  const writeHash = await client.contract.write({
    abi: generated.Erc721.abi,
    account,
    address,
    functionName: 'mint',
  })
  await testClient.block.mine({ blocks: 1 })
  expect(
    (await Actions.transaction.getReceipt(client, { hash: writeHash })).status,
  ).toMatchInlineSnapshot(`"success"`)
  expect(
    (
      await client.contract.writeSync({
        abi: generated.Erc721.abi,
        account,
        address,
        functionName: 'mint',
        pollingInterval: 50,
      })
    ).status,
  ).toMatchInlineSnapshot(`"success"`)
})

test('decorates a client with token actions', async () => {
  await prepareAccount(holder)
  await testClient.block.setAutomine({ enabled: true })
  const client = tokenClient.extend(walletActions())
  const spender = constants.accounts[2].address
  const to = constants.accounts[3].address
  const approve = { account: holder, amount: 0n, spender, token: usdc } as const
  const transfer = { account: holder, amount: 0n, to, token: usdc } as const

  expect(client.token.approve.call(approve)).toMatchObject({
    functionName: 'approve',
    to: usdc,
  })
  expect(await client.token.approve.estimateGas(approve)).toBeGreaterThan(0n)
  expect((await client.token.approve.simulate(approve)).result).toBe(true)
  const approveHash = await client.token.approve(approve)
  await testClient.block.mine({ blocks: 1 })
  expect(
    (await Actions.transaction.getReceipt(client, { hash: approveHash }))
      .status,
  ).toMatchInlineSnapshot(`"success"`)
  expect(
    (await client.token.approveSync(approve)).receipt.status,
  ).toMatchInlineSnapshot(`"success"`)

  expect(client.token.transfer.call(transfer)).toMatchObject({
    functionName: 'transfer',
    to: usdc,
  })
  expect(await client.token.transfer.estimateGas(transfer)).toBeGreaterThan(0n)
  expect((await client.token.transfer.simulate(transfer)).result).toBe(true)
  const transferHash = await client.token.transfer(transfer)
  await testClient.block.mine({ blocks: 1 })
  expect(
    (await Actions.transaction.getReceipt(client, { hash: transferHash }))
      .status,
  ).toMatchInlineSnapshot(`"success"`)
  expect(
    (await client.token.transferSync(transfer)).receipt.status,
  ).toMatchInlineSnapshot(`"success"`)
})

test('decorates a client with transaction actions', async () => {
  await testClient.address.setBalance({
    address: source.address,
    value: source.balance,
  })
  await testClient.block.setAutomine({ enabled: true })
  const client = anvil.getClient(anvil.mainnet).extend(walletActions())
  const request = {
    account,
    to: target.address,
    value: 1n,
  } as const

  expect((await client.transaction.fill(request)).raw).toMatch(/^0x/)
  expect((await client.transaction.prepare(request)).request.gas).toBeTypeOf(
    'bigint',
  )

  const transaction = await client.transaction.sign({
    ...request,
    prepare: true,
  })
  const hash = await client.transaction.sendRaw({ transaction })
  await testClient.block.mine({ blocks: 1 })
  expect(
    (await Actions.transaction.getReceipt(client, { hash })).status,
  ).toMatchInlineSnapshot(`"success"`)

  const transactionSync = await client.transaction.sign({
    ...request,
    prepare: true,
  })
  expect(
    (await client.transaction.sendRawSync({ transaction: transactionSync }))
      .status,
  ).toMatchInlineSnapshot(`"success"`)
  expect(
    (
      await client.transaction.sendSync({
        ...request,
        pollingInterval: 50,
      })
    ).status,
  ).toMatchInlineSnapshot(`"success"`)
})
