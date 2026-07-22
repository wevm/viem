import { AbiEvent, Address, Hex, P256, Secp256k1, Value } from 'ox'
import { Channel, VirtualAddress } from 'ox/tempo'
import * as tempo from '~test/tempo.js'
import { Actions as CoreActions } from 'viem'
import { Account, Abis, Actions, Client, http } from 'viem/tempo'
import { expect, test } from 'vitest'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const account3 = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const account4 = Account.fromSecp256k1(tempo.accounts[3]!.privateKey)

const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

type Observed = {
  logs: unknown[]
  watcher: { off(): void }
}

function observe<log>(watcher: {
  onLogs(fn: (logs: readonly log[]) => void): () => void
  off(): void
}): Observed {
  const logs: unknown[] = []
  watcher.onLogs((batch) => logs.push(...batch))
  return { logs, watcher }
}

async function waitForHash(hash: Hex.Hex) {
  const receipt = await CoreActions.transaction.waitForReceipt(client, {
    hash,
  }).receipt
  expect(receipt.status).toBe('success')
  return receipt
}

async function waitForWatchers(watchers: readonly Observed[]) {
  await expect
    .poll(() => watchers.every(({ logs }) => logs.length > 0), {
      interval: 100,
      timeout: 5_000,
    })
    .toBe(true)
}

function stopWatchers(watchers: readonly Observed[]) {
  for (const { watcher } of watchers) watcher.off()
}

test('binds zone actions', () => {
  const offlineClient = Client.create({
    transport: http('http://127.0.0.1:0'),
  })

  expect({
    encryptedDepositPrepareRecipient:
      'prepareRecipient' in offlineClient.zone.encryptedDeposit,
    getEncryptionKey: typeof offlineClient.zone.getEncryptionKey,
    getEncryptionKeyCalls: 'calls' in offlineClient.zone.getEncryptionKey,
    getWithdrawalFee: typeof offlineClient.zone.getWithdrawalFee,
    requestWithdrawalPrepare: 'prepare' in offlineClient.zone.requestWithdrawal,
    waitForTempoBlock: typeof offlineClient.zone.waitForTempoBlock,
  }).toMatchInlineSnapshot(`
    {
      "encryptedDepositPrepareRecipient": false,
      "getEncryptionKey": "function",
      "getEncryptionKeyCalls": false,
      "getWithdrawalFee": "function",
      "requestWithdrawalPrepare": false,
      "waitForTempoBlock": "function",
    }
  `)
})

test('binds earn actions and helpers', () => {
  const offlineClient = Client.create({
    transport: http('http://127.0.0.1:0'),
  })

  expect(Object.keys(offlineClient.earn).sort()).toMatchInlineSnapshot(`
    [
      "configureExitSafePolicy",
      "deposit",
      "depositShares",
      "depositSharesSync",
      "depositSync",
      "getFeeState",
      "getPosition",
      "getRedeemQuote",
      "getVault",
      "getWithdrawQuote",
      "privateDeposit",
      "privateDepositSync",
      "privateRedeem",
      "privateRedeemSync",
      "redeem",
      "redeemSync",
      "validateExitSafePolicy",
      "waitForPrivateDeposit",
      "waitForPrivateRedeem",
      "withdrawExact",
      "withdrawExactSync",
    ]
  `)
  expect({
    deposit: Object.keys(offlineClient.earn.deposit).sort(),
    depositShares: Object.keys(offlineClient.earn.depositShares).sort(),
    getRedeemQuote: Object.keys(offlineClient.earn.getRedeemQuote).sort(),
    getVault: Object.keys(offlineClient.earn.getVault).sort(),
    getWithdrawQuote: Object.keys(offlineClient.earn.getWithdrawQuote).sort(),
    privateDeposit: Object.keys(offlineClient.earn.privateDeposit).sort(),
    privateRedeem: Object.keys(offlineClient.earn.privateRedeem).sort(),
    redeem: Object.keys(offlineClient.earn.redeem).sort(),
    withdrawExact: Object.keys(offlineClient.earn.withdrawExact).sort(),
  }).toMatchInlineSnapshot(`
    {
      "deposit": [
        "call",
        "calls",
        "estimateGas",
        "extractEvent",
        "simulate",
      ],
      "depositShares": [
        "call",
        "calls",
        "estimateGas",
        "extractEvent",
        "simulate",
      ],
      "getRedeemQuote": [
        "call",
      ],
      "getVault": [
        "calls",
      ],
      "getWithdrawQuote": [
        "call",
      ],
      "privateDeposit": [
        "calls",
        "prepare",
      ],
      "privateRedeem": [
        "calls",
        "prepare",
      ],
      "redeem": [
        "call",
        "calls",
        "estimateGas",
        "extractEvent",
        "simulate",
      ],
      "withdrawExact": [
        "call",
        "calls",
        "estimateGas",
        "extractEvent",
        "simulate",
      ],
    }
  `)

  const options = {
    assetAmount: 1n,
    recipient: account.address,
    shareAmountMin: 1n,
    vault: account2.address,
  } as const
  expect(offlineClient.earn.deposit.call(options)).toEqual(
    Actions.earn.deposit.call(offlineClient, options),
  )
})

test('wallet actions use wallet RPC methods', async () => {
  const methods: string[] = []
  const walletClient = tempo.getClient({
    account,
    feeToken: tempo.pathUsd,
    transport: http(tempo.rpcUrl, {
      async onFetchRequest(request) {
        const body = await request.clone().json()
        const requests = Array.isArray(body) ? body : [body]
        methods.push(...requests.map(({ method }) => method))
      },
    }),
  })

  await Promise.allSettled([
    walletClient.wallet.deposit({ amount: '1', token: 'pathusd' }),
    walletClient.wallet.swap({
      amount: '1',
      pairToken: tempo.alphaUsd,
      token: tempo.pathUsd,
      type: 'sell',
    }),
    walletClient.wallet.transfer({
      amount: '1',
      to: account2.address,
      token: tempo.pathUsd,
    }),
  ])

  expect(methods.sort()).toMatchInlineSnapshot(`
    [
      "wallet_deposit",
      "wallet_swap",
      "wallet_transfer",
    ]
  `)
})

test('access key lifecycle', async () => {
  const watchers = [
    observe(client.accessKey.watchAdminAuthorized()),
    observe(client.accessKey.watchWitness()),
    observe(client.accessKey.watchWitnessBurned()),
  ]
  try {
    const adminKey = Account.fromP256(P256.randomPrivateKey(), {
      access: account,
    })
    await client.accessKey.authorizeSync({ accessKey: adminKey, admin: true })

    const witness = Hex.random(32)
    const limitedKey = Account.fromP256(P256.randomPrivateKey(), {
      access: account,
    })
    await waitForHash(
      await client.accessKey.authorize({
        accessKey: limitedKey,
        expiry: Math.floor((Date.now() + 30_000) / 1_000),
        limits: [{ limit: 1_000_000n, token: tempo.pathUsd }],
        witness,
      }),
    )

    expect(
      await client.accessKey.getMetadata({
        accessKey: limitedKey,
        account: account.address,
      }),
    ).toMatchObject({ isRevoked: false, keyType: 'p256' })
    expect(
      await client.accessKey.getRemainingLimit({
        accessKey: limitedKey,
        account: account.address,
        token: tempo.pathUsd,
      }),
    ).toMatchObject({ remaining: 1_000_000n })
    expect(
      await client.accessKey.isAdmin({
        accessKey: adminKey,
        account: account.address,
      }),
    ).toBe(true)
    expect(
      await client.accessKey.isWitnessBurned({
        account: account.address,
        witness,
      }),
    ).toBe(false)

    await client.accessKey.updateLimitSync({
      accessKey: limitedKey,
      limit: 2_000_000n,
      token: tempo.pathUsd,
    })
    await waitForHash(
      await client.accessKey.updateLimit({
        accessKey: limitedKey,
        limit: 3_000_000n,
        token: tempo.pathUsd,
      }),
    )

    const authorizationKey = Account.fromP256(P256.randomPrivateKey(), {
      access: account,
    })
    expect(
      await client.accessKey.signAuthorization({
        accessKey: authorizationKey,
        account,
        expiry: Math.floor((Date.now() + 30_000) / 1_000),
      }),
    ).toMatchObject({ type: 'p256' })

    const hash = Hex.random(32)
    expect(
      await client.accessKey.verifyHash({
        account: account.address,
        hash,
        signature: await adminKey.sign({ hash }),
      }),
    ).toBe(true)

    await client.accessKey.burnWitnessSync({ witness })
    const witness2 = Hex.random(32)
    await waitForHash(await client.accessKey.burnWitness({ witness: witness2 }))
    expect(
      await client.accessKey.isWitnessBurned({
        account: account.address,
        witness: witness2,
      }),
    ).toBe(true)

    await client.accessKey.revokeSync({ accessKey: limitedKey })
    const revokedKey = Account.fromP256(P256.randomPrivateKey(), {
      access: account,
    })
    await client.accessKey.authorizeSync({
      accessKey: revokedKey,
      expiry: Math.floor((Date.now() + 30_000) / 1_000),
    })
    await waitForHash(await client.accessKey.revoke({ accessKey: revokedKey }))

    await waitForWatchers(watchers)
  } finally {
    stopWatchers(watchers)
  }
})

test('policy lifecycle', async () => {
  const watchers = [
    observe(client.policy.watchAdminUpdated()),
    observe(client.policy.watchBlacklistUpdated()),
    observe(client.policy.watchCreate()),
    observe(client.policy.watchWhitelistUpdated()),
  ]
  try {
    await waitForHash(await client.policy.create({ type: 'blacklist' }))
    const { policyId: blacklist } = await client.policy.createSync({
      type: 'blacklist',
    })
    const { policyId: whitelist } = await client.policy.createSync({
      addresses: [account2.address],
      type: 'whitelist',
    })

    expect(await client.policy.getData({ policyId: whitelist })).toMatchObject({
      admin: account.address,
      type: 'whitelist',
    })
    expect(
      await client.policy.isAuthorized({
        policyId: whitelist,
        user: account2.address,
      }),
    ).toBe(true)

    await client.policy.modifyBlacklistSync({
      address: account2.address,
      policyId: blacklist,
      restricted: true,
    })
    await waitForHash(
      await client.policy.modifyBlacklist({
        address: account2.address,
        policyId: blacklist,
        restricted: false,
      }),
    )
    await client.policy.modifyWhitelistSync({
      address: account3.address,
      allowed: true,
      policyId: whitelist,
    })
    await waitForHash(
      await client.policy.modifyWhitelist({
        address: account3.address,
        allowed: false,
        policyId: whitelist,
      }),
    )

    await client.policy.setAdminSync({
      admin: account2.address,
      policyId: whitelist,
    })
    await waitForHash(
      await client.policy.setAdmin({
        admin: account2.address,
        policyId: blacklist,
      }),
    )

    await waitForWatchers(watchers)
  } finally {
    stopWatchers(watchers)
  }
})

test('token lifecycle', async () => {
  const watchers = [observe(client.token.watchCreate({}))]
  try {
    const { token } = await client.token.createSync({
      currency: 'USD',
      name: 'Decorator Token',
      symbol: 'DECO',
    })
    watchers.push(
      observe(client.token.watchAdminRole({ token })),
      observe(client.token.watchApprove({ token })),
      observe(client.token.watchBurn({ token })),
      observe(client.token.watchMint({ token })),
      observe(client.token.watchRole({ token })),
      observe(client.token.watchTransfer({ token })),
      observe(client.token.watchUpdateQuoteToken({ token })),
    )
    await waitForHash(
      await client.token.create({
        currency: 'USD',
        name: 'Decorator Async Token',
        symbol: 'DECOA',
      }),
    )

    await client.token.grantRolesSync({
      roles: ['burnBlocked', 'issuer', 'pause', 'unpause'],
      to: account.address,
      token,
    })
    await waitForHash(
      await client.token.grantRoles({
        roles: ['issuer'],
        to: account2.address,
        token,
      }),
    )
    expect(
      await client.token.hasRole({
        account: account2.address,
        role: 'issuer',
        token,
      }),
    ).toBe(true)

    await client.token.mintSync({
      amount: Value.from('1000', 6),
      to: account.address,
      token,
    })
    await waitForHash(
      await client.token.mint({
        amount: Value.from('100', 6),
        to: account2.address,
        token,
      }),
    )

    await client.token.approveSync({
      amount: Value.from('100', 6),
      spender: account2.address,
      token,
    })
    await waitForHash(
      await client.token.approve({
        amount: Value.from('90', 6),
        spender: account2.address,
        token,
      }),
    )
    expect(
      await client.token.getAllowance({
        account: account.address,
        spender: account2.address,
        token,
      }),
    ).toMatchObject({ amount: Value.from('90', 6) })

    await client.token.transferSync({
      amount: Value.from('10', 6),
      to: account3.address,
      token,
    })
    await waitForHash(
      await client.token.transfer({
        amount: Value.from('10', 6),
        to: account3.address,
        token,
      }),
    )
    await client.token.burnSync({ amount: Value.from('10', 6), token })
    await waitForHash(
      await client.token.burn({ amount: Value.from('10', 6), token }),
    )

    await client.token.setSupplyCapSync({
      supplyCap: Value.from('10000', 6),
      token,
    })
    await waitForHash(
      await client.token.setSupplyCap({
        supplyCap: Value.from('20000', 6),
        token,
      }),
    )

    await client.token.setRoleAdminSync({
      adminRole: 'pause',
      role: 'issuer',
      token,
    })
    await waitForHash(
      await client.token.setRoleAdmin({
        adminRole: 'pause',
        role: 'issuer',
        token,
      }),
    )
    expect(
      await client.token.getRoleAdmin({ role: 'issuer', token }),
    ).toBeDefined()

    await client.token.pauseSync({ token })
    await waitForHash(await client.token.unpause({ token }))
    await waitForHash(await client.token.pause({ token }))
    await client.token.unpauseSync({ token })

    const { policyId } = await client.policy.createSync({
      addresses: [account2.address],
      type: 'blacklist',
    })
    await client.token.changeTransferPolicySync({ policyId, token })
    await client.token.burnBlockedSync({
      amount: Value.from('10', 6),
      from: account2.address,
      token,
    })
    await waitForHash(
      await client.token.burnBlocked({
        amount: Value.from('10', 6),
        from: account2.address,
        token,
      }),
    )
    const { policyId: nextPolicyId } = await client.policy.createSync({
      type: 'blacklist',
    })
    await waitForHash(
      await client.token.changeTransferPolicy({
        policyId: nextPolicyId,
        token,
      }),
    )

    const { token: quoteToken } = await client.token.createSync({
      currency: 'USD',
      name: 'Decorator Quote',
      symbol: 'DECOQ',
    })
    await client.token.prepareUpdateQuoteTokenSync({ quoteToken, token })
    await client.token.updateQuoteTokenSync({ token })
    await waitForHash(
      await client.token.prepareUpdateQuoteToken({
        quoteToken: tempo.pathUsd,
        token,
      }),
    )
    await waitForHash(await client.token.updateQuoteToken({ token }))

    await client.token.revokeRolesSync({
      from: account2.address,
      roles: ['issuer'],
      token,
    })
    await client.token.grantRolesSync({
      roles: ['issuer'],
      to: account2.address,
      token,
    })
    await waitForHash(
      await client.token.revokeRoles({
        from: account2.address,
        roles: ['issuer'],
        token,
      }),
    )
    await client.token.renounceRolesSync({ roles: ['pause'], token })
    await waitForHash(
      await client.token.renounceRoles({ roles: ['issuer'], token }),
    )

    expect(await client.token.getBalance({ token })).toBeDefined()
    expect(await client.token.getMetadata({ token })).toBeDefined()
    expect(
      (await client.token.getTotalSupply({ token })).amount,
    ).toBeGreaterThan(0n)

    await waitForWatchers(watchers)
  } finally {
    stopWatchers(watchers)
  }
})

test('fee, faucet, and nonce actions', async () => {
  const faucetAccount = Account.fromSecp256k1(Secp256k1.randomPrivateKey())
  expect(await client.faucet.fund({ account: faucetAccount })).toHaveLength(4)
  expect(
    await client.faucet.fundSync({
      account: Account.fromSecp256k1(Secp256k1.randomPrivateKey()),
    }),
  ).toHaveLength(4)

  const validator = Account.fromSecp256k1(tempo.accounts[8]!.privateKey)
  const validatorClient = tempo.getClient({
    account: validator,
    feeToken: tempo.pathUsd,
  })
  await tempo.registerValidator(client, { address: validator.address })
  await client.token.transferSync({
    amount: Value.from('100', 6),
    to: validator.address,
    token: tempo.pathUsd,
  })

  const feeWatchers = [
    observe(client.fee.watchSetUserToken()),
    observe(client.fee.watchSetValidatorToken()),
  ]
  try {
    await client.fee.setUserTokenSync({ token: tempo.pathUsd })
    await waitForHash(await client.fee.setUserToken({ token: tempo.alphaUsd }))
    expect((await client.fee.getUserToken())?.toLowerCase()).toBe(
      tempo.alphaUsd,
    )

    await validatorClient.fee.setValidatorTokenSync({ token: tempo.pathUsd })
    await waitForHash(
      await validatorClient.fee.setValidatorToken({ token: tempo.alphaUsd }),
    )
    expect(
      (
        await client.fee.getValidatorToken({ validator: validator.address })
      )?.toLowerCase(),
    ).toBe(tempo.alphaUsd)
    expect(
      await client.fee.validateToken({ token: tempo.pathUsd }),
    ).toMatchObject({ address: tempo.pathUsd })

    await waitForWatchers(feeWatchers)
  } finally {
    stopWatchers(feeWatchers)
  }

  const nonceWatcher = observe(
    client.nonce.watchIncremented({
      args: { account: account.address, nonceKey: 501n },
    }),
  )
  try {
    expect(
      await client.nonce.get({ account: account.address, nonceKey: 501n }),
    ).toBe(0n)
    await client.token.transferSync({
      amount: 1n,
      nonce: 0,
      nonceKey: 501n,
      to: account2.address,
      token: tempo.pathUsd,
    })
    await waitForWatchers([nonceWatcher])
  } finally {
    stopWatchers([nonceWatcher])
  }
})

test('validator lifecycle', async () => {
  const validator = Account.fromSecp256k1(tempo.accounts[9]!.privateKey)
  const validator2 = Account.fromSecp256k1(tempo.accounts[7]!.privateKey)
  const validatorClient = tempo.getClient({
    account: validator,
    feeToken: tempo.pathUsd,
  })

  await client.validator.addSync({
    active: true,
    inboundAddress: '192.168.1.100:8080',
    newValidatorAddress: validator.address,
    outboundAddress: '192.168.1.100:8080',
    publicKey:
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })
  await waitForHash(
    await client.validator.add({
      active: true,
      inboundAddress: '192.168.1.101:8080',
      newValidatorAddress: validator2.address,
      outboundAddress: '192.168.1.101:8080',
      publicKey:
        '0x2234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    }),
  )

  const entry = await client.validator.get({ validator: validator.address })
  expect(await client.validator.getByIndex({ index: entry.index })).toBe(
    validator.address,
  )
  const count = await client.validator.getCount()
  expect(count).toBeGreaterThanOrEqual(2n)
  expect(await client.validator.list()).toHaveLength(Number(count))

  expect(await client.validator.getNextFullDkgCeremony()).toBe(0n)
  await client.validator.setNextFullDkgCeremonySync({ epoch: 100n })
  await waitForHash(
    await client.validator.setNextFullDkgCeremony({ epoch: 200n }),
  )

  await client.validator.changeStatusSync({
    active: false,
    validator: validator.address,
  })
  await waitForHash(
    await client.validator.changeStatus({
      active: true,
      validator: validator.address,
    }),
  )

  await client.token.transferSync({
    amount: Value.from('10', 6),
    to: validator.address,
    token: tempo.pathUsd,
  })
  await validatorClient.validator.updateSync({
    inboundAddress: '10.0.0.1:9090',
    newValidatorAddress: validator.address,
    outboundAddress: '10.0.0.1:9090',
    publicKey:
      '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  })
  await waitForHash(
    await validatorClient.validator.update({
      inboundAddress: '10.0.0.2:9090',
      newValidatorAddress: validator.address,
      outboundAddress: '10.0.0.2:9090',
      publicKey:
        '0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890a',
    }),
  )

  expect(await client.validator.getOwner()).toBe(account.address)
  await client.validator.changeOwnerSync({ newOwner: account2.address })
  const client2 = tempo.getClient({
    account: account2,
    feeToken: tempo.pathUsd,
  })
  await waitForHash(
    await client2.validator.changeOwner({ newOwner: account.address }),
  )
})

test('DEX lifecycle', async () => {
  const { token: base } = await client.token.createSync({
    currency: 'USD',
    name: 'Decorator DEX',
    symbol: 'DEXCO',
  })
  await client.token.grantRolesSync({
    roles: ['issuer'],
    to: account.address,
    token: base,
  })
  await client.token.mintSync({
    amount: Value.from('1000000', 6),
    to: account.address,
    token: base,
  })
  const { quote } = await client.dex.createPairSync({ base })
  const { token: base2 } = await client.token.createSync({
    currency: 'USD',
    name: 'Decorator DEX Async',
    symbol: 'DEXCOA',
  })
  await waitForHash(await client.dex.createPair({ base: base2 }))

  const watchers = [
    observe(client.dex.watchFlipOrderPlaced()),
    observe(client.dex.watchOrderCancelled()),
    observe(client.dex.watchOrderFilled()),
    observe(client.dex.watchOrderPlaced()),
  ]
  try {
    const { orderId: sellOrderId } = await client.dex.placeSync({
      amount: Value.from('1000', 6),
      tick: 100,
      token: base,
      type: 'sell',
    })
    await client.dex.placeSync({
      amount: Value.from('1000', 6),
      tick: -100,
      token: base,
      type: 'buy',
    })
    await waitForHash(
      await client.dex.place({
        amount: Value.from('100', 6),
        tick: -200,
        token: base,
        type: 'buy',
      }),
    )
    await client.dex.placeFlipSync({
      amount: Value.from('100', 6),
      flipTick: 50,
      tick: -50,
      token: base,
      type: 'buy',
    })
    await waitForHash(
      await client.dex.placeFlip({
        amount: Value.from('100', 6),
        flipTick: 150,
        tick: 200,
        token: base,
        type: 'sell',
      }),
    )

    expect(await client.dex.getOrder({ orderId: sellOrderId })).toMatchObject({
      orderId: sellOrderId,
    })
    expect(await client.dex.getOrderbook({ base, quote })).toMatchObject({
      base,
      quote,
    })
    expect(
      await client.dex.getTickLevel({ base, isBid: false, tick: 100 }),
    ).toMatchObject({ head: sellOrderId })
    expect(
      await client.dex.getBuyQuote({
        amountOut: Value.from('10', 6),
        tokenIn: quote,
        tokenOut: base,
      }),
    ).toBeGreaterThan(0n)
    expect(
      await client.dex.getSellQuote({
        amountIn: Value.from('10', 6),
        tokenIn: base,
        tokenOut: quote,
      }),
    ).toBeGreaterThan(0n)

    await client.dex.buySync({
      amountOut: Value.from('10', 6),
      maxAmountIn: Value.from('20', 6),
      tokenIn: quote,
      tokenOut: base,
    })
    await waitForHash(
      await client.dex.buy({
        amountOut: Value.from('10', 6),
        maxAmountIn: Value.from('20', 6),
        tokenIn: quote,
        tokenOut: base,
      }),
    )
    await client.dex.sellSync({
      amountIn: Value.from('10', 6),
      minAmountOut: Value.from('1', 6),
      tokenIn: base,
      tokenOut: quote,
    })
    await waitForHash(
      await client.dex.sell({
        amountIn: Value.from('10', 6),
        minAmountOut: Value.from('1', 6),
        tokenIn: base,
        tokenOut: quote,
      }),
    )

    const { orderId: cancelSyncId } = await client.dex.placeSync({
      amount: Value.from('100', 6),
      tick: -300,
      token: base,
      type: 'buy',
    })
    const { orderId: cancelId } = await client.dex.placeSync({
      amount: Value.from('100', 6),
      tick: -300,
      token: base,
      type: 'buy',
    })
    await client.dex.cancelSync({ orderId: cancelSyncId })
    await waitForHash(await client.dex.cancel({ orderId: cancelId }))

    const balance = await client.dex.getBalance({
      account: account.address,
      token: quote,
    })
    expect(balance).toBeGreaterThan(0n)
    await client.dex.withdrawSync({ amount: balance / 2n, token: quote })
    const remaining = await client.dex.getBalance({
      account: account.address,
      token: quote,
    })
    await waitForHash(
      await client.dex.withdraw({ amount: remaining, token: quote }),
    )

    const { policyId } = await client.policy.createSync({ type: 'blacklist' })
    await client.token.changeTransferPolicySync({ policyId, token: base })
    const placeStaleOrder = async () => {
      const { orderId } = await client.dex.placeSync({
        amount: Value.from('100', 6),
        tick: 300,
        token: base,
        type: 'sell',
      })
      await client.policy.modifyBlacklistSync({
        address: account.address,
        policyId,
        restricted: true,
      })
      return orderId
    }
    await client.dex.cancelStaleSync({ orderId: await placeStaleOrder() })
    await client.policy.modifyBlacklistSync({
      address: account.address,
      policyId,
      restricted: false,
    })
    await waitForHash(
      await client.dex.cancelStale({ orderId: await placeStaleOrder() }),
    )
    await client.policy.modifyBlacklistSync({
      address: account.address,
      policyId,
      restricted: false,
    })

    await waitForWatchers(watchers)
  } finally {
    stopWatchers(watchers)
  }
})

test('AMM lifecycle', async () => {
  const { token } = await client.token.createSync({
    currency: 'USD',
    name: 'Decorator AMM',
    symbol: 'AMMCO',
  })
  await client.token.grantRolesSync({
    roles: ['issuer'],
    to: account.address,
    token,
  })
  await client.token.mintSync({
    amount: Value.from('1000', 6),
    to: account.address,
    token,
  })

  const watchers = [
    observe(client.amm.watchBurn()),
    observe(client.amm.watchMint()),
    observe(client.amm.watchRebalanceSwap()),
  ]
  try {
    await client.amm.mintSync({
      to: account.address,
      userTokenAddress: token,
      validatorTokenAddress: tempo.alphaUsd,
      validatorTokenAmount: Value.from('100', 6),
    })
    await waitForHash(
      await client.amm.mint({
        to: account.address,
        userTokenAddress: token,
        validatorTokenAddress: tempo.alphaUsd,
        validatorTokenAmount: Value.from('50', 6),
      }),
    )

    expect(
      await client.amm.getPool({
        userToken: token,
        validatorToken: tempo.alphaUsd,
      }),
    ).toMatchObject({ reserveValidatorToken: Value.from('150', 6) })
    const liquidity = await client.amm.getLiquidityBalance({
      address: account.address,
      userToken: token,
      validatorToken: tempo.alphaUsd,
    })
    await client.amm.burnSync({
      liquidity: liquidity / 4n,
      to: account.address,
      userToken: token,
      validatorToken: tempo.alphaUsd,
    })
    await waitForHash(
      await client.amm.burn({
        liquidity: liquidity / 4n,
        to: account.address,
        userToken: token,
        validatorToken: tempo.alphaUsd,
      }),
    )

    // Paying fees in alphaUSD seeds the alphaUSD/pathUSD fee pool.
    const seedPool = async () => {
      await CoreActions.transaction.sendSync(client, {
        calls: [{ to: '0x00000000000000000000000000000000000000ff' }],
        feeToken: tempo.alphaUsd,
      })
      return client.amm.getPool({
        userToken: tempo.alphaUsd,
        validatorToken: tempo.pathUsd,
      })
    }
    const pool = await seedPool()
    await client.amm.rebalanceSwapSync({
      amountOut: pool.reserveUserToken,
      to: account.address,
      userToken: tempo.alphaUsd,
      validatorToken: tempo.pathUsd,
    })
    const pool2 = await seedPool()
    await waitForHash(
      await client.amm.rebalanceSwap({
        amountOut: pool2.reserveUserToken,
        to: account.address,
        userToken: tempo.alphaUsd,
        validatorToken: tempo.pathUsd,
      }),
    )

    await waitForWatchers(watchers)
  } finally {
    stopWatchers(watchers)
  }
})

test('channel lifecycle', async () => {
  const operatorClient = tempo.getClient({
    account: account3,
    feeToken: tempo.pathUsd,
  })
  const openChannel = async (salt: Hex.Hex) => {
    const { receipt, ...opened } = await client.channel.openSync({
      deposit: Value.from('100', 6),
      operator: account3.address,
      payee: account2.address,
      salt,
      token: tempo.alphaUsd,
    })
    expect(receipt.status).toBe('success')
    return {
      ...opened,
      channel: Channel.from({
        authorizedSigner: opened.authorizedSigner,
        expiringNonceHash: opened.expiringNonceHash,
        operator: opened.operator,
        payee: opened.payee,
        payer: opened.payer,
        salt: opened.salt,
        token: opened.token,
      }),
    }
  }

  await waitForHash(
    await client.channel.open({
      deposit: Value.from('100', 6),
      operator: account3.address,
      payee: account2.address,
      salt: Hex.fromNumber(0xd001, { size: 32 }),
      token: tempo.alphaUsd,
    }),
  )

  const topped = await openChannel(Hex.fromNumber(0xd002, { size: 32 }))
  await client.channel.topUpSync({
    additionalDeposit: Value.from('10', 6),
    channel: topped.channel,
  })
  await waitForHash(
    await client.channel.topUp({
      additionalDeposit: Value.from('10', 6),
      channel: topped.channel,
    }),
  )
  expect(
    await client.channel.getStates({ channel: topped.channel }),
  ).toMatchObject({ deposit: Value.from('120', 6) })

  const signature = await client.channel.signVoucher({
    channel: topped.channel,
    cumulativeAmount: Value.from('20', 6),
  })
  await operatorClient.channel.settleSync({
    channel: topped.channel,
    cumulativeAmount: Value.from('20', 6),
    signature,
  })
  await waitForHash(
    await operatorClient.channel.settle({
      channel: topped.channel,
      cumulativeAmount: Value.from('30', 6),
      signature: await client.channel.signVoucher({
        channel: topped.channel,
        cumulativeAmount: Value.from('30', 6),
      }),
    }),
  )
  await operatorClient.channel.closeSync({
    captureAmount: Value.from('40', 6),
    channel: topped.channel,
    cumulativeAmount: Value.from('40', 6),
    signature: await client.channel.signVoucher({
      channel: topped.channel,
      cumulativeAmount: Value.from('40', 6),
    }),
  })

  const closeAsync = await openChannel(Hex.fromNumber(0xd003, { size: 32 }))
  await waitForHash(
    await operatorClient.channel.close({
      captureAmount: Value.from('40', 6),
      channel: closeAsync.channel,
      cumulativeAmount: Value.from('80', 6),
      signature: await client.channel.signVoucher({
        channel: closeAsync.channel,
        cumulativeAmount: Value.from('80', 6),
      }),
    }),
  )

  const withdrawSync = await openChannel(Hex.fromNumber(0xd004, { size: 32 }))
  await client.channel.requestCloseSync({ channel: withdrawSync.channel })
  await expect(
    client.channel.withdrawSync({ channel: withdrawSync.channel }),
  ).rejects.toThrow('The contract function "withdraw" reverted')

  const withdrawAsync = await openChannel(Hex.fromNumber(0xd005, { size: 32 }))
  await waitForHash(
    await client.channel.requestClose({ channel: withdrawAsync.channel }),
  )
  await expect(
    client.channel.withdraw({ channel: withdrawAsync.channel }),
  ).rejects.toThrow('The contract function "withdraw" reverted')
})

test('receive policy lifecycle', async () => {
  const receiverClient = tempo.getClient({
    account: account4,
    feeToken: tempo.pathUsd,
  })
  const receiver2 = Account.fromSecp256k1(tempo.accounts[4]!.privateKey)
  const receiverClient2 = tempo.getClient({
    account: receiver2,
    feeToken: tempo.pathUsd,
  })
  const watchers = [
    observe(client.receivePolicy.watchBlocked()),
    observe(client.receivePolicy.watchBurned()),
    observe(client.receivePolicy.watchClaimed()),
    observe(client.receivePolicy.watchUpdated()),
  ]
  try {
    await receiverClient.receivePolicy.setSync({
      senderPolicyId: 'reject-all',
    })
    await waitForHash(
      await receiverClient2.receivePolicy.set({
        claimer: 'self',
        senderPolicyId: 'allow-all',
        tokenPolicyId: 'allow-all',
      }),
    )
    expect(
      await client.receivePolicy.get({ account: account4.address }),
    ).toMatchObject({ hasReceivePolicy: true, senderPolicyId: 'reject-all' })
    expect(
      await client.receivePolicy.validate({
        receiver: account4.address,
        sender: account.address,
        token: tempo.alphaUsd,
      }),
    ).toMatchObject({ authorized: false })

    const createBlockedTransfer = async (token: Address.Address) => {
      const { receipt } = await client.token.transferSync({
        amount: Value.from('10', 6),
        to: account4.address,
        token,
      })
      const [log] = AbiEvent.extractLogs(
        Abis.receivePolicyGuard,
        receipt.logs,
        {
          eventName: 'TransferBlocked',
          strict: true,
        },
      )
      return log!.args.receipt
    }

    const claimReceipt = await createBlockedTransfer(tempo.alphaUsd)
    expect(
      await client.receivePolicy.getBlockedBalance({ receipt: claimReceipt }),
    ).toBe(Value.from('10', 6))
    await client.receivePolicy.claimSync({
      receipt: claimReceipt,
      to: account.address,
    })
    await waitForHash(
      await client.receivePolicy.claim({
        receipt: await createBlockedTransfer(tempo.alphaUsd),
        to: account.address,
      }),
    )

    const { token } = await client.token.createSync({
      currency: 'USD',
      name: 'Decorator Blocked Token',
      symbol: 'BLOCKCO',
    })
    await client.token.grantRolesSync({
      roles: ['burnBlocked', 'issuer'],
      to: account.address,
      token,
    })
    await client.token.mintSync({
      amount: Value.from('100', 6),
      to: account.address,
      token,
    })
    const burnReceipt = await createBlockedTransfer(token)
    const burnReceipt2 = await createBlockedTransfer(token)
    const { policyId } = await client.policy.createSync({ type: 'blacklist' })
    await client.policy.modifyBlacklistSync({
      address: account.address,
      policyId,
      restricted: true,
    })
    await client.token.changeTransferPolicySync({ policyId, token })
    await client.receivePolicy.burnSync({ receipt: burnReceipt })
    await waitForHash(
      await client.receivePolicy.burn({ receipt: burnReceipt2 }),
    )

    await waitForWatchers(watchers)
  } finally {
    stopWatchers(watchers)
  }
})

test('virtual address lifecycle', async () => {
  // Precomputed 32-bit PoW salt for dev account 0 (derives masterId below).
  const salt =
    '0x00000000000000000000000000000000000000000000000000000000abf52baf'
  const masterId = '0x58e21090'

  await client.virtualAddress.registerMasterSync({ salt })
  expect(await client.virtualAddress.getMasterAddress({ masterId })).toBe(
    account.address,
  )
  expect(
    await client.virtualAddress.resolve({
      address: VirtualAddress.from({
        masterId,
        userTag: '0x010203040506',
      }),
    }),
  ).toBe(account.address)

  await tempo.restart()
  await waitForHash(await client.virtualAddress.registerMaster({ salt }))
})
