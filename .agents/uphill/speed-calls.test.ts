/**
 * Calls the public functions that none of viem's tests call, with arguments like their docs show,
 * so the speed bench has a call to replay for each. `speed-vitest.config.ts` runs this file with
 * viem's tests while recording; it asserts nothing and needs no node.
 *
 * Tempo's call builders, such as `Actions.token.pause.call`, get the arguments viem's Tempo tests pass
 * to the action they belong to, such as `Actions.token.pauseSync`.
 *
 * Left out on purpose: `setSignEntropy`, which switches signing to random entropy for the rest of
 * the process, and functions that only do I/O, such as `ccipFetch` and `rpc.http`.
 *
 * @module
 */

import {
  bytesToRlp,
  defineBlock,
  hexToRlp,
  nonceManager,
  rpcSchema,
} from 'viem'
import { ipc } from 'viem/node'
import { jsonRpc } from 'viem/nonce'
import { Actions } from 'viem/tempo'
import * as tokens from 'viem/tokens'
import { test } from 'vitest'

test('tokens resolve for a chain they are deployed on', () => {
  for (const token of Object.values(tokens)) {
    if (typeof token !== 'function' || !('addresses' in token)) continue
    const [chainId] = Object.keys(token.addresses)
    if (chainId) token(Number(chainId))
  }
})

test('rlp', () => {
  bytesToRlp([new Uint8Array([1, 2, 3]), [new Uint8Array([4, 5])]])
  hexToRlp(['0x0102', ['0x0304', '0x']])
})

test('defineBlock', () => {
  defineBlock({
    exclude: ['difficulty'],
    format: (args: { l1BlockNumber?: string }) => ({
      l1BlockNumber: args.l1BlockNumber ? BigInt(args.l1BlockNumber) : null,
    }),
  })
})

test('constructors that do no work until used', () => {
  rpcSchema()
  jsonRpc()
  ipc('/tmp/uphill-speed.ipc')
})

test('nonceManager.reset', () => {
  nonceManager.reset({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    chainId: 1,
  })
})

test('tempo call builders', () => {
  const account = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
  const other = '0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650'
  const accessKey = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
  const pathUsd = '0x20c0000000000000000000000000000000000000'
  const token = '0x20C00000000000000000000015D22202d7F7eA83'
  const { accessKey: keys, amm, channel, dex, earn, fee, policy } = Actions
  const { receivePolicy, token: tip20, virtualAddress } = Actions

  keys.burnWitness.call({
    witness:
      '0x5bba23dc30ebc8878e599143e5787c11798475f6044ae8911d06b3775b11734d',
  })
  keys.getRemainingLimit.call({ account, accessKey, token: pathUsd })
  keys.revoke.call({ accessKey })
  keys.updateLimit.call({ accessKey, token: pathUsd, limit: 2_000_000n })

  amm.burn.call({
    liquidity: 1_000_000n,
    to: account,
    userToken: 1n,
    validatorToken: 0n,
  })
  amm.rebalanceSwap.call({
    amountOut: 1_000_000n,
    to: account,
    userToken: 1n,
    validatorToken: 0n,
  })

  // A channel, voucher signature, and receive policy receipt from viem's Tempo tests.
  const descriptor = {
    authorizedSigner: '0x0000000000000000000000000000000000000000',
    expiringNonceHash:
      '0x6a4f74f3ec27c4b27c6ecc20d0d069eb9d708827c63f276138c967b3d46f6ccc',
    operator: '0x98e503f35D0a019cB0a251aD243a4cCFCF371F46',
    payee: other,
    payer: account,
    salt: '0xaf0e0155fb24774a2d27355fd67256813140a970fb8180abf046f8d03d95c2f3',
    token: '0x20C000000000000000000000AEd4c3edb5aC6789',
  } as const
  const signature =
    '0x763a2512e869e27aeb26acea9d60360d4a74040e0ddf8cb77378c716e7b505ac136d9fd0138cf8b948a6b05230204371e5a775bef6a305ac804faa3d0b38f9311b'
  const receipt =
    '0x000000000000000000000000000000000000000000000000000000000000000100000000000000000000000020c000000000000000000000286159dbabb550370000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000008c8d35429f74ec245f8ef2f4fd1e551cff97d650000000000000000000000000000000000000000000000000000000006b0443fd0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
  channel.close.call({
    captureAmount: 1_000_000n,
    channel: descriptor,
    cumulativeAmount: 1_000_000n,
    signature,
  })
  channel.requestClose.call({ channel: descriptor })
  channel.settle.call({
    channel: descriptor,
    cumulativeAmount: 1_000_000n,
    signature,
  })
  channel.topUp.call({ additionalDeposit: 1_000_000n, channel: descriptor })

  dex.cancel.call({ orderId: 3n })
  dex.cancelStale.call({ orderId: 5n })
  dex.createPair.call({ base: '0x20C000000000000000000000Ef8D61Bd3Aca87f4' })
  dex.placeFlip.call({
    amount: 100_000_000n,
    flipTick: 50,
    tick: 50,
    token: '0x20C000000000000000000000ab39f843B9A159F8',
    type: 'sell',
  })

  earn.deposit.call({
    assetAmount: 100_000_000n,
    recipient: account,
    shareAmountMin: 1n,
    vault: '0x0F9019Dd30C7Cc5774d4883fba933aA0Caba9424',
  })
  earn.depositShares.call({
    earnShareAmountMin: 498_500_000n,
    recipient: account,
    vault: '0x477044170B5AB7DdF4d688e6C6Da6Cc5465338c4',
    venueShareAmount: 500_000_000n,
    venueShareToken: '0x12bcb546bc60ff39f1adfc7ce4605d5bd6a6a876',
  })

  fee.setValidatorToken.call({ token: 2n })

  policy.create.call({ admin: account, type: 'whitelist' })
  policy.modifyBlacklist.call({
    address: other,
    policyId: 4n,
    restricted: false,
  })
  policy.modifyWhitelist.call({ address: other, allowed: false, policyId: 3n })
  policy.setAdmin.call({ admin: other, policyId: 2n })

  receivePolicy.burn.call({ receipt })
  receivePolicy.claim.call({ receipt, to: account })
  receivePolicy.set.call({
    recoveryAuthority: account,
    senderPolicyId: 1n,
    tokenFilterId: 1n,
  })

  tip20.changeTransferPolicy.call({ policyId: 2n, token })
  tip20.pause.call({ token })
  tip20.prepareUpdateQuoteToken.call({ quoteToken: pathUsd, token })
  tip20.renounceRoles.call({ role: 'issuer', token })
  tip20.revokeRoles.call({ from: other, role: 'issuer', token })
  tip20.setRoleAdmin.call({ adminRole: 'defaultAdmin', role: 'issuer', token })
  tip20.setSupplyCap.call({ supplyCap: 1_000_000_000_000n, token })
  tip20.unpause.call({ token })
  tip20.updateQuoteToken.call({ token })

  virtualAddress.registerMaster.call({
    salt: '0x00000000000000000000000000000000000000000000000000000000abf52baf',
  })
})
