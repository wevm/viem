import { TxEnvelopeTempo } from 'ox/tempo'
import { parseSignature, type Transport, toHex } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import {
  getTransaction,
  getTransactionReceipt,
  prepareTransactionRequest,
  sendRawTransactionSync,
  sendTransaction,
  sendTransactionSync,
  signTransaction,
} from 'viem/actions'
import { tempoLocalnet } from 'viem/chains'
import {
  Account,
  Actions,
  createClient,
  Multisig,
  MultisigConfig,
  P256,
  WebCryptoP256,
} from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import * as tempo from '~test/tempo/config.js'

const client = tempo.getClient()

describe('fromMultisig', () => {
  const { accounts, feeToken } = tempo

  const to = '0x0000000000000000000000000000000000000001'

  test('examples: bootstrap and initialized', async () => {
    const owner_1 = accounts[1]
    const owner_2 = accounts[2]
    const config = MultisigConfig.from({
      threshold: 2,
      owners: [
        { owner: owner_1.address, weight: 1 },
        { owner: owner_2.address, weight: 1 },
      ],
    })
    const account = Account.fromMultisig(config)

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

    {
      const request = await prepareTransactionRequest(client, {
        account,
        calls: [
          Actions.token.transfer.call(client, {
            amount: 1n,
            to,
            token: feeToken,
          }),
        ],
        feeToken,
      })
      const signatures = await Promise.all(
        [owner_1, owner_2].map((owner) =>
          signTransaction(client, { ...request, account: owner }),
        ),
      )
      const receipt = await sendTransactionSync(client, {
        ...request,
        signatures,
      })
      expect(receipt.status).toBe('success')
      expect(receipt.from).toBe(account.address.toLowerCase())

      const tx = await getTransaction(client, { hash: receipt.transactionHash })
      expect(tx.signature?.type).toBe('multisig')
      if (tx.signature?.type !== 'multisig') throw new Error('unreachable')
      expect(tx.signature.init).toMatchObject({ threshold: 2 })
      expect(tx.nonce).toBe(0)
    }

    {
      const request = await prepareTransactionRequest(client, {
        account,
        calls: [
          Actions.token.transfer.call(client, {
            amount: 1n,
            to,
            token: feeToken,
          }),
        ],
        feeToken,
      })
      const signatures = await Promise.all(
        [owner_1, owner_2].map((owner) =>
          signTransaction(client, { ...request, account: owner }),
        ),
      )
      const receipt = await sendTransactionSync(client, {
        ...request,
        signatures,
      })
      expect(receipt.status).toBe('success')
      expect(receipt.from).toBe(account.address.toLowerCase())

      const tx = await getTransaction(client, { hash: receipt.transactionHash })
      expect(tx.signature?.type).toBe('multisig')
      if (tx.signature?.type !== 'multisig') throw new Error('unreachable')
      expect(tx.signature.init).toBeUndefined()
      expect(tx.nonce).toBe(1)
    }
  })

  test('2-of-3 (M-of-N): threshold subset of owners approves', async () => {
    const owner_1 = accounts[3]
    const owner_2 = accounts[4]
    const owner_3 = accounts[5]
    const config = MultisigConfig.from({
      threshold: 2,
      owners: [
        { owner: owner_1.address, weight: 1 },
        { owner: owner_2.address, weight: 1 },
        { owner: owner_3.address, weight: 1 },
      ],
    })
    const account = Account.fromMultisig(config)

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

    const request = await prepareTransactionRequest(client, {
      account,
      calls: [
        Actions.token.transfer.call(client, {
          amount: 1n,
          to,
          token: feeToken,
        }),
      ],
      feeToken,
    })
    const signatures = await Promise.all(
      [owner_1, owner_3].map((owner) =>
        signTransaction(client, { ...request, account: owner }),
      ),
    )
    const receipt = await sendTransactionSync(client, {
      ...request,
      signatures,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('mixed owner key types', async () => {
    const owners = [
      Account.fromSecp256k1(generatePrivateKey()),
      Account.fromP256(P256.randomPrivateKey()),
      Account.fromHeadlessWebAuthn(P256.randomPrivateKey(), {
        origin: 'https://example.com',
        rpId: 'example.com',
      }),
      Account.fromWebCryptoP256(await WebCryptoP256.createKeyPair()),
    ]
    const config = MultisigConfig.from({
      owners: owners.map((owner) => ({ owner: owner.address, weight: 1 })),
      threshold: owners.length,
    })
    const account = Account.fromMultisig(config)

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

    for (let nonce = 0; nonce < 2; nonce++) {
      const request = await prepareTransactionRequest(client, {
        account,
        calls: [{ to, value: 0n }],
        feeToken,
      })
      expect(request).toMatchObject({
        keyData: '0x0578',
        keyType: 'webAuthn',
      })
      const signatures = await Promise.all(
        owners.map((owner) =>
          signTransaction(client, { ...request, account: owner }),
        ),
      )
      const receipt = await sendTransactionSync(client, {
        ...request,
        signatures,
      })

      expect(receipt.status).toBe('success')
      const result = await getTransaction(client, {
        hash: receipt.transactionHash,
      })
      expect(result.nonce).toBe(nonce)
      expect(result.signature?.type).toBe('multisig')
      if (result.signature?.type !== 'multisig') throw new Error('unreachable')
      expect(
        result.signature.signatures.map((signature) => signature.type).sort(),
      ).toEqual(['p256', 'p256', 'secp256k1', 'webAuthn'])
      expect(
        result.signature.signatures
          .filter((signature) => signature.type === 'p256')
          .map((signature) => signature.prehash)
          .sort(),
      ).toEqual([false, true])
    }
  })

  test('mixed local and external owners', async () => {
    const localOwner = Account.fromSecp256k1(generatePrivateKey())
    const externalOwner = Account.fromSecp256k1(generatePrivateKey())
    const account = Account.fromMultisig({
      owners: [localOwner, externalOwner.address],
      threshold: 2,
    })

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

    for (let nonce = 0; nonce < 2; nonce++) {
      const request = await prepareTransactionRequest(client, {
        account,
        calls: [{ to, value: 0n }],
        feeToken,
      })
      const signature = await signTransaction(client, {
        ...request,
        account: externalOwner,
      })
      const transaction = await signTransaction(client, {
        ...request,
        signatures: [signature],
      })
      const receipt = await sendRawTransactionSync(client, {
        serializedTransaction: transaction,
      })

      expect(receipt.status).toBe('success')
      expect(receipt.from).toBe(account.address.toLowerCase())
      const result = await getTransaction(client, {
        hash: receipt.transactionHash,
      })
      expect(result.nonce).toBe(nonce)
      expect(result.signature?.type).toBe('multisig')
      if (result.signature?.type !== 'multisig') throw new Error('unreachable')
      expect(result.signature.signatures).toHaveLength(2)
    }
  })

  test('example: nested ownership', async () => {
    const childOwner = accounts[17]
    const child = Account.fromMultisig({
      owners: [childOwner],
      salt: toHex(0x106101, { size: 32 }),
    })
    expect(child.config.threshold).toBe(1)
    expect(child.config.owners[0]?.weight).toBe(1)

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: child.address,
      token: feeToken,
    })

    const childBootstrap = await prepareTransactionRequest(client, {
      account: child,
      calls: [{ to, value: 0n }],
      feeToken,
    })
    const childTransaction = await signTransaction(client, childBootstrap)
    const childReceipt = await sendRawTransactionSync(client, {
      serializedTransaction: childTransaction,
    })
    expect(childReceipt.status).toBe('success')

    const account = Account.fromMultisig({
      owners: [child],
      salt: toHex(0x106102, { size: 32 }),
    })

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

    for (let nonce = 0; nonce < 2; nonce++) {
      const request = await prepareTransactionRequest(client, {
        account,
        calls: [{ to, value: 0n }],
        feeToken,
      })
      const signature = await signTransaction(client, {
        ...request,
        account: child,
      })
      const receipt = await sendTransactionSync(client, {
        ...request,
        signatures: [signature],
      })

      expect(receipt.status).toBe('success')
      expect(receipt.from).toBe(account.address.toLowerCase())
      expect(request.nonce).toBe(nonce)

      const parentTransaction = await getTransaction(client, {
        hash: receipt.transactionHash,
      })
      expect(parentTransaction.signature?.type).toBe('multisig')
      if (parentTransaction.signature?.type !== 'multisig')
        throw new Error('unreachable')
      expect(parentTransaction.signature.signatures[0]?.type).toBe('multisig')
    }

    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })
    const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
      account,
      accessKey,
    })
    const request = await prepareTransactionRequest(client, {
      account: accessKey,
      feeToken,
      keyAuthorization,
      to,
      value: 0n,
    })
    const transaction = await signTransaction(client, request)
    const receipt = await sendRawTransactionSync(client, {
      serializedTransaction: transaction,
    })

    expect(receipt.status).toBe('success')
    const nestedAuthorization = await getTransaction(client, {
      hash: receipt.transactionHash,
    })
    expect(nestedAuthorization.keyAuthorization?.signature.type).toBe(
      'multisig',
    )
    if (nestedAuthorization.keyAuthorization?.signature.type !== 'multisig')
      throw new Error('unreachable')
    expect(
      nestedAuthorization.keyAuthorization.signature.signatures[0]?.type,
    ).toBe('multisig')
  })

  test('example: weighted quorum', async () => {
    const [heavy, light_1, light_2] = [
      accounts[6],
      accounts[7],
      accounts[8],
    ].sort((a, b) => a.address.localeCompare(b.address))
    const config = MultisigConfig.from({
      threshold: 3,
      owners: [
        { owner: heavy.address, weight: 2 },
        { owner: light_1.address, weight: 1 },
        { owner: light_2.address, weight: 1 },
      ],
    })
    const account = Account.fromMultisig(config)

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

    const bootstrap = await prepareTransactionRequest(client, {
      account,
      calls: [
        Actions.token.transfer.call(client, {
          amount: 1n,
          to,
          token: feeToken,
        }),
      ],
      feeToken,
    })
    const bootstrapSignatures = await Promise.all(
      [heavy, light_1].map((owner) =>
        signTransaction(client, { ...bootstrap, account: owner }),
      ),
    )
    const bootstrapReceipt = await sendTransactionSync(client, {
      ...bootstrap,
      signatures: bootstrapSignatures,
    })
    expect(bootstrapReceipt.status).toBe('success')

    const valid = await prepareTransactionRequest(client, {
      account,
      calls: [{ to, value: 0n }],
      feeToken,
    })
    const validSignatures = await Promise.all(
      [heavy, light_2].map((owner) =>
        signTransaction(client, { ...valid, account: owner }),
      ),
    )
    const validReceipt = await sendTransactionSync(client, {
      ...valid,
      signatures: validSignatures,
    })
    expect(validReceipt.status).toBe('success')

    const invalid = await prepareTransactionRequest(client, {
      account,
      calls: [{ to, value: 0n }],
      feeToken,
    })
    const belowThreshold = await Promise.all(
      [light_1, light_2].map((owner) =>
        signTransaction(client, { ...invalid, account: owner }),
      ),
    )
    await expect(
      sendTransactionSync(client, {
        ...invalid,
        signatures: belowThreshold,
      }),
    ).rejects.toThrow()

    const extraSignature = await Promise.all(
      [heavy, light_1, light_2].map((owner) =>
        signTransaction(client, { ...invalid, account: owner }),
      ),
    )
    await expect(
      sendTransactionSync(client, {
        ...invalid,
        signatures: extraSignature,
      }),
    ).rejects.toThrow()
  })

  test('account hoisted to client: send without explicit `account`', async () => {
    const owner_1 = accounts[8]
    const owner_2 = accounts[9]
    const config = MultisigConfig.from({
      threshold: 2,
      owners: [
        { owner: owner_1.address, weight: 1 },
        { owner: owner_2.address, weight: 1 },
      ],
    })
    const account = Account.fromMultisig(config)

    const accountClient = tempo.getClient({ account })

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

    const request = await prepareTransactionRequest(accountClient, {
      calls: [
        Actions.token.transfer.call(client, {
          amount: 1n,
          to,
          token: feeToken,
        }),
      ],
      feeToken,
    })
    const signatures = await Promise.all(
      [owner_1, owner_2].map((owner) =>
        signTransaction(client, { ...request, account: owner }),
      ),
    )
    const receipt = await sendTransactionSync(accountClient, {
      ...request,
      signatures,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('infer multisig from `account` (no `multisig` field)', async () => {
    const owner_1 = accounts[10]
    const owner_2 = accounts[11]
    const account = Account.fromMultisig({
      threshold: 2,
      owners: [
        { owner: owner_1.address, weight: 1 },
        { owner: owner_2.address, weight: 1 },
      ],
    })

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

    const request = await prepareTransactionRequest(client, {
      account,
      calls: [
        Actions.token.transfer.call(client, {
          amount: 1n,
          to,
          token: feeToken,
        }),
      ],
      feeToken,
    })
    const signatures = await Promise.all(
      [owner_1, owner_2].map((owner) =>
        signTransaction(client, { ...request, account: owner }),
      ),
    )
    const receipt = await sendTransactionSync(client, {
      ...request,
      signatures,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('behavior: address requires an initialized account', async () => {
    const account = Account.fromMultisig(accounts[0].address)

    await expect(
      prepareTransactionRequest(client, {
        account,
        calls: [{ to, value: 0n }],
        feeToken,
      }),
    ).rejects.toThrow(
      'Cannot prepare an uninitialized multisig account from an address. Provide its initial config instead.',
    )
  })

  test('example: fee sponsorship (both signing orders)', async () => {
    const owner_1 = accounts[12]
    const owner_2 = accounts[13]
    const config = MultisigConfig.from({
      threshold: 2,
      owners: [
        { owner: owner_1.address, weight: 1 },
        { owner: owner_2.address, weight: 1 },
      ],
    })
    const account = Account.fromMultisig(config)

    const request = await prepareTransactionRequest(client, {
      account,
      feePayer: accounts[0],
      to: account.address,
      value: 0n,
    })
    const signatures = await Promise.all(
      [owner_1, owner_2].map((owner) =>
        signTransaction(client, { ...request, account: owner }),
      ),
    )
    const receipt = await sendTransactionSync(client, {
      ...request,
      signatures,
    })

    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
    expect(receipt.feePayer).toBe(accounts[0].address.toLowerCase())

    const feePayerFirst = await prepareTransactionRequest(client, {
      account,
      calls: [{ to, value: 0n }],
      feePayer: true,
      feeToken,
    })
    if (!feePayerFirst.calls) throw new Error('Expected prepared calls.')
    const transaction = TxEnvelopeTempo.from({
      calls: feePayerFirst.calls,
      chainId: feePayerFirst.chainId,
      feePayerSignature: null,
      feeToken,
      gas: feePayerFirst.gas,
      maxFeePerGas: feePayerFirst.maxFeePerGas,
      maxPriorityFeePerGas: feePayerFirst.maxPriorityFeePerGas,
      nonce: BigInt(feePayerFirst.nonce),
      type: 'tempo',
    })
    const feePayerSignature = parseSignature(
      await accounts[0].sign({
        hash: TxEnvelopeTempo.getFeePayerSignPayload(transaction, {
          sender: account.address,
        }),
      }),
    )
    const sponsored = {
      ...feePayerFirst,
      feePayer: true as const,
      feePayerSignature,
      feeToken,
    }
    const ownerSignatures = await Promise.all(
      [owner_1, owner_2].map((owner) =>
        signTransaction(client, { ...sponsored, account: owner }),
      ),
    )
    const feePayerFirstReceipt = await sendTransactionSync(client, {
      ...sponsored,
      signatures: ownerSignatures,
    })

    expect(feePayerFirstReceipt.status).toBe('success')
    expect(feePayerFirstReceipt.from).toBe(account.address.toLowerCase())
    expect(feePayerFirstReceipt.feePayer).toBe(
      accounts[0].address.toLowerCase(),
    )
  })

  test('example: bootstrap and immediate access key use', async () => {
    const owner_1 = accounts[18]
    const owner_2 = accounts[19]
    const account = Account.fromMultisig({
      owners: [owner_1, owner_2],
      salt: toHex(0x106103, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

    const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
      account,
      accessKey,
    })
    const request = await prepareTransactionRequest(client, {
      account: accessKey,
      feeToken,
      keyAuthorization,
      to,
      value: 0n,
    })
    const transaction = await signTransaction(client, request)
    const receipt = await sendRawTransactionSync(client, {
      serializedTransaction: transaction,
    })

    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())

    const immediateTransaction = await getTransaction(client, {
      hash: receipt.transactionHash,
    })
    expect(immediateTransaction.signature?.type).toBe('keychain')
    expect(immediateTransaction.keyAuthorization?.signature.type).toBe(
      'multisig',
    )
    if (immediateTransaction.keyAuthorization?.signature.type !== 'multisig')
      throw new Error('unreachable')
    expect(immediateTransaction.keyAuthorization.signature.init).toBeDefined()
  })

  test('external owners authorize an access key', async () => {
    const owner_1 = accounts[18]
    const owner_2 = accounts[19]
    const account = Account.fromMultisig({
      owners: [owner_1.address, owner_2.address],
      salt: toHex(0x106106, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

    const authorization = await Actions.accessKey.prepareAuthorization(client, {
      account,
      accessKey,
    })
    const signatures = await Promise.all(
      [owner_1, owner_2].map((owner) =>
        owner.sign({ hash: authorization.signPayload }),
      ),
    )
    const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
      ...authorization,
      signatures,
    })
    const request = await prepareTransactionRequest(client, {
      account: accessKey,
      feeToken,
      keyAuthorization,
      to,
      value: 0n,
    })
    const transaction = await signTransaction(client, request)
    const receipt = await sendRawTransactionSync(client, {
      serializedTransaction: transaction,
    })

    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('example: bootstrap and subsequent access key use', async () => {
    const owner_1 = accounts[19]
    const owner_2 = accounts[20]
    const account = Account.fromMultisig({
      owners: [owner_1, owner_2],
      salt: toHex(0x106104, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

    const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
      account,
      accessKey,
    })
    const bootstrap = await prepareTransactionRequest(client, {
      account,
      calls: [{ to, value: 0n }],
      feeToken,
      keyAuthorization,
    })
    const bootstrapTransaction = await signTransaction(client, bootstrap)
    const bootstrapReceipt = await sendRawTransactionSync(client, {
      serializedTransaction: bootstrapTransaction,
    })
    expect(bootstrapReceipt.status).toBe('success')

    const bootstrapResult = await getTransaction(client, {
      hash: bootstrapReceipt.transactionHash,
    })
    expect(bootstrapResult.signature?.type).toBe('multisig')
    if (bootstrapResult.signature?.type !== 'multisig')
      throw new Error('unreachable')
    expect(bootstrapResult.signature.init).toBeDefined()
    expect(bootstrapResult.keyAuthorization?.signature.type).toBe('multisig')
    if (bootstrapResult.keyAuthorization?.signature.type !== 'multisig')
      throw new Error('unreachable')
    expect(bootstrapResult.keyAuthorization.signature.init).toBeUndefined()

    const request = await prepareTransactionRequest(client, {
      account: accessKey,
      feeToken,
      to,
      value: 0n,
    })
    const transaction = await signTransaction(client, request)
    const receipt = await sendRawTransactionSync(client, {
      serializedTransaction: transaction,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('example: configuration rotation', async () => {
    const owner_1 = accounts[14]
    const owner_2 = accounts[15]
    const owner_3 = accounts[16]
    const owner_4 = accounts[17]
    const account = Account.fromMultisig({
      salt: toHex(0x106105, { size: 32 }),
      threshold: 2,
      owners: [owner_1, owner_2],
    })
    const initialConfig = account.config

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

    const bootstrap = await prepareTransactionRequest(client, {
      account,
      calls: [{ to, value: 0n }],
      feeToken,
    })
    expect(bootstrap.multisigSignatureCount).toBeUndefined()
    expect(bootstrap.multisigVersion).toBe(0n)
    const bootstrapSignatures = await Promise.all(
      [owner_1, owner_2].map((owner) =>
        signTransaction(client, { ...bootstrap, account: owner }),
      ),
    )
    const bootstrapReceipt = await sendTransactionSync(client, {
      ...bootstrap,
      signatures: bootstrapSignatures,
    })
    expect(bootstrapReceipt.status).toBe('success')
    expect(
      await Actions.multisig.getConfig(client, { account: account.address }),
    ).toEqual({
      version: 0n,
      threshold: initialConfig.threshold,
      owners: initialConfig.owners,
    })

    const initializedAccount = Account.fromMultisig(account.address)
    expect(initializedAccount.config).toBeUndefined()
    const update = await prepareTransactionRequest(client, {
      account: initializedAccount,
      calls: [
        Actions.multisig.updateConfig.call({
          threshold: 2,
          owners: [
            { owner: owner_3.address, weight: 1 },
            { owner: owner_4.address, weight: 1 },
          ],
        }),
      ],
      feeToken,
    })
    expect(update.multisig).toBe(initializedAccount.address)
    expect(update.multisigInit).toBeUndefined()
    const updateSignatures = await Promise.all(
      [owner_1, owner_2].map((owner) =>
        signTransaction(client, { ...update, account: owner }),
      ),
    )
    const updateReceipt = await sendTransactionSync(client, {
      ...update,
      signatures: updateSignatures,
    })
    expect(updateReceipt.status).toBe('success')
    expect(
      Actions.multisig.updateConfig.extractEvent(updateReceipt.logs).args,
    ).toMatchObject({
      account: initializedAccount.address,
      threshold: 2,
      owners: expect.arrayContaining([
        { owner: owner_3.address, weight: 1 },
        { owner: owner_4.address, weight: 1 },
      ]),
    })

    const request = await prepareTransactionRequest(client, {
      account: initializedAccount,
      calls: [{ to, value: 0n }],
      feeToken,
    })
    expect(request.multisigSignatureCount).toBeUndefined()
    expect(request.multisigOwnerStates?.[0]).toEqual({
      account: initializedAccount.address,
      config: {
        owners: expect.arrayContaining([
          { owner: owner_3.address, weight: 1 },
          { owner: owner_4.address, weight: 1 },
        ]),
        threshold: 2,
      },
      initialized: true,
      version: 1n,
    })
    expect(request.multisigVersion).toBe(1n)
    const signatures = await Promise.all(
      [owner_3, owner_4].map((owner) =>
        signTransaction(client, { ...request, account: owner }),
      ),
    )
    const receipt = await sendTransactionSync(client, {
      ...request,
      signatures,
    })

    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(initializedAccount.address.toLowerCase())
  })
})

describe('multisig store', () => {
  function getClient() {
    return createClient({
      chain: tempoLocalnet,
      multisig: { store: Multisig.Store.memory() },
      tokens: tempo.tokens,
      transport: tempo.http(),
    })
  }

  test('examples: bootstrap and initialized', async () => {
    const owner_1 = tempo.accounts[1]
    const owner_2 = tempo.accounts[2]
    const account = Account.fromMultisig({
      owners: [owner_1.address, owner_2.address],
      salt: toHex(0x106120, { size: 32 }),
      threshold: 2,
    })
    const client = getClient()
    const recipient = tempo.accounts[20].address

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const balance = await Actions.token.getBalance(client, {
      account: recipient,
      token: tempo.feeToken,
    })
    const bootstrap = await prepareTransactionRequest(client, {
      account,
      calls: [
        Actions.token.transfer.call(client, {
          amount: 1n,
          to: recipient,
          token: tempo.feeToken,
        }),
      ],
      feeToken: tempo.feeToken,
    })
    const pending = await sendTransactionSync(client, {
      ...bootstrap,
      account: owner_1,
    })
    expect(pending).toMatchInlineSnapshot(
      {
        transactionHash: expect.any(String),
      },
      `
      {
        "blockHash": null,
        "blockNumber": null,
        "contractAddress": null,
        "cumulativeGasUsed": null,
        "effectiveGasPrice": null,
        "from": "0x717a5616be548146187031a15fa458b78f2ef75f",
        "gasUsed": null,
        "logs": [],
        "logsBloom": null,
        "multisigAccount": "0x717a5616be548146187031a15fa458b78f2ef75f",
        "multisigSignatures": 1,
        "multisigThreshold": 2,
        "multisigWeight": 1,
        "status": "pending",
        "to": null,
        "transactionHash": Any<String>,
        "transactionIndex": null,
        "type": "tempo",
      }
    `,
    )
    const id = pending.transactionHash

    await sendTransactionSync(client, {
      ...bootstrap,
      account: owner_1,
    })

    const pendingOperation = await client.multisig.getOperation({ id })
    expect(pendingOperation).toMatchInlineSnapshot(
      {
        approvals: [expect.any(String)],
        createdAt: expect.any(Number),
        id: expect.any(String),
        transaction: {
          gas: expect.any(BigInt),
          maxFeePerGas: expect.any(BigInt),
        },
        updatedAt: expect.any(Number),
      },
      `
      {
        "account": "0x717a5616be548146187031a15fa458b78f2ef75f",
        "approvals": [
          Any<String>,
        ],
        "config": {
          "owners": [
            {
              "owner": "0x8c8d35429f74ec245f8ef2f4fd1e551cff97d650",
              "weight": 1,
            },
            {
              "owner": "0x98e503f35d0a019cb0a251ad243a4ccfcf371f46",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000106120",
          "threshold": 2,
        },
        "createdAt": Any<Number>,
        "id": Any<String>,
        "init": true,
        "schemaVersion": 1,
        "signatures": 1,
        "status": "pending",
        "threshold": 2,
        "transaction": {
          "calls": [
            {
              "data": "0xa9059cbb0000000000000000000000000f9e2db5d73bf2698b3cc235a719200d209cd77c0000000000000000000000000000000000000000000000000000000000000001",
              "to": "0x20c0000000000000000000000000000000000000",
            },
          ],
          "chainId": 1337,
          "feeToken": "0x20c0000000000000000000000000000000000000",
          "from": "0x717a5616be548146187031a15fa458b78f2ef75f",
          "gas": Any<BigInt>,
          "maxFeePerGas": Any<BigInt>,
          "nonce": 0,
          "nonceKey": 0n,
          "type": "tempo",
        },
        "updatedAt": Any<Number>,
        "version": 0n,
        "weight": 1,
      }
    `,
    )

    const receipt = await sendTransactionSync(client, {
      ...bootstrap,
      account: owner_2,
    })
    expect(receipt).toMatchInlineSnapshot(
      {
        blockHash: expect.any(String),
        blockNumber: expect.any(BigInt),
        cumulativeGasUsed: expect.any(BigInt),
        effectiveGasPrice: expect.any(BigInt),
        gasUsed: expect.any(BigInt),
        logs: expect.any(Array),
        logsBloom: expect.any(String),
        transactionHash: expect.any(String),
        transactionIndex: expect.any(Number),
      },
      `
      {
        "blockHash": Any<String>,
        "blockNumber": Any<BigInt>,
        "contractAddress": null,
        "cumulativeGasUsed": Any<BigInt>,
        "effectiveGasPrice": Any<BigInt>,
        "feePayer": "0x717a5616be548146187031a15fa458b78f2ef75f",
        "feeToken": "0x20c0000000000000000000000000000000000000",
        "from": "0x717a5616be548146187031a15fa458b78f2ef75f",
        "gasUsed": Any<BigInt>,
        "logs": Any<Array>,
        "logsBloom": Any<String>,
        "status": "success",
        "to": "0x20c0000000000000000000000000000000000000",
        "transactionHash": Any<String>,
        "transactionIndex": Any<Number>,
        "type": "0x76",
      }
    `,
    )
    expect(
      (
        await Actions.token.getBalance(client, {
          account: recipient,
          token: tempo.feeToken,
        })
      ).amount - balance.amount,
    ).toMatchInlineSnapshot(`1n`)

    const aliasedReceipt = await getTransactionReceipt(client, { hash: id })
    expect(aliasedReceipt).toStrictEqual(receipt)
    const transaction = await getTransaction(client, { hash: id })
    expect(transaction.signature).toMatchInlineSnapshot(
      {
        signatures: expect.any(Array),
      },
      `
      {
        "account": "0x717a5616be548146187031a15fa458b78f2ef75f",
        "init": {
          "owners": [
            {
              "owner": "0x8c8d35429f74ec245f8ef2f4fd1e551cff97d650",
              "weight": 1,
            },
            {
              "owner": "0x98e503f35d0a019cb0a251ad243a4ccfcf371f46",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000106120",
          "threshold": 2,
        },
        "signatures": Any<Array>,
        "type": "multisig",
      }
    `,
    )

    const successOperation = await client.multisig.getOperation({ id })
    expect(successOperation).toMatchInlineSnapshot(
      {
        approvals: [expect.any(String), expect.any(String)],
        createdAt: expect.any(Number),
        id: expect.any(String),
        transactionHash: expect.any(String),
        updatedAt: expect.any(Number),
      },
      `
      {
        "account": "0x717a5616be548146187031a15fa458b78f2ef75f",
        "approvals": [
          Any<String>,
          Any<String>,
        ],
        "config": {
          "owners": [
            {
              "owner": "0x8c8d35429f74ec245f8ef2f4fd1e551cff97d650",
              "weight": 1,
            },
            {
              "owner": "0x98e503f35d0a019cb0a251ad243a4ccfcf371f46",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000106120",
          "threshold": 2,
        },
        "createdAt": Any<Number>,
        "id": Any<String>,
        "schemaVersion": 1,
        "signatures": 2,
        "status": "success",
        "threshold": 2,
        "transactionHash": Any<String>,
        "updatedAt": Any<Number>,
        "version": 0n,
        "weight": 2,
      }
    `,
    )

    const initialized = await prepareTransactionRequest(client, {
      account,
      calls: [
        Actions.token.transfer.call(client, {
          amount: 2n,
          to: recipient,
          token: tempo.feeToken,
        }),
      ],
      feeToken: tempo.feeToken,
    })
    const initializedId = await sendTransaction(client, {
      ...initialized,
      account: owner_1,
    })
    expect(
      await client.multisig.getOperation({ id: initializedId }),
    ).toMatchInlineSnapshot(
      {
        approvals: [expect.any(String)],
        createdAt: expect.any(Number),
        id: expect.any(String),
        transaction: {
          gas: expect.any(BigInt),
          maxFeePerGas: expect.any(BigInt),
        },
        updatedAt: expect.any(Number),
      },
      `
      {
        "account": "0x717a5616be548146187031a15fa458b78f2ef75f",
        "approvals": [
          Any<String>,
        ],
        "config": {
          "owners": [
            {
              "owner": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
              "weight": 1,
            },
            {
              "owner": "0x98e503f35D0a019cB0a251aD243a4cCFCF371F46",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "threshold": 2,
        },
        "createdAt": Any<Number>,
        "id": Any<String>,
        "init": false,
        "schemaVersion": 1,
        "signatures": 1,
        "status": "pending",
        "threshold": 2,
        "transaction": {
          "calls": [
            {
              "data": "0xa9059cbb0000000000000000000000000f9e2db5d73bf2698b3cc235a719200d209cd77c0000000000000000000000000000000000000000000000000000000000000002",
              "to": "0x20c0000000000000000000000000000000000000",
            },
          ],
          "chainId": 1337,
          "feeToken": "0x20c0000000000000000000000000000000000000",
          "from": "0x717a5616be548146187031a15fa458b78f2ef75f",
          "gas": Any<BigInt>,
          "maxFeePerGas": Any<BigInt>,
          "nonce": 1,
          "nonceKey": 0n,
          "type": "tempo",
        },
        "updatedAt": Any<Number>,
        "version": 0n,
        "weight": 1,
      }
    `,
    )

    await sendTransaction(client, {
      ...initialized,
      account: owner_2,
    })
    expect(
      await client.multisig.getOperation({ id: initializedId }),
    ).toMatchInlineSnapshot(
      {
        approvals: [expect.any(String), expect.any(String)],
        createdAt: expect.any(Number),
        id: expect.any(String),
        transactionHash: expect.any(String),
        updatedAt: expect.any(Number),
      },
      `
      {
        "account": "0x717a5616be548146187031a15fa458b78f2ef75f",
        "approvals": [
          Any<String>,
          Any<String>,
        ],
        "config": {
          "owners": [
            {
              "owner": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
              "weight": 1,
            },
            {
              "owner": "0x98e503f35D0a019cB0a251aD243a4cCFCF371F46",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "threshold": 2,
        },
        "createdAt": Any<Number>,
        "id": Any<String>,
        "schemaVersion": 1,
        "signatures": 2,
        "status": "success",
        "threshold": 2,
        "transactionHash": Any<String>,
        "updatedAt": Any<Number>,
        "version": 0n,
        "weight": 2,
      }
    `,
    )
  })

  test('2-of-3 (M-of-N): threshold subset of owners approves', async () => {
    const owner_1 = tempo.accounts[3]
    const owner_2 = tempo.accounts[4]
    const owner_3 = tempo.accounts[5]
    const account = Account.fromMultisig({
      owners: [owner_1.address, owner_2.address, owner_3.address],
      salt: toHex(0x106122, { size: 32 }),
      threshold: 2,
    })
    const client = getClient()

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const request = await prepareTransactionRequest(client, {
      account,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      feeToken: tempo.feeToken,
    })
    const pending = await sendTransactionSync(client, {
      ...request,
      account: owner_1,
    })
    expect(pending.status).toBe('pending')

    const receipt = await sendTransactionSync(client, {
      ...request,
      account: owner_3,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('mixed owner key types', async () => {
    const owners = [
      Account.fromSecp256k1(generatePrivateKey()),
      Account.fromP256(P256.randomPrivateKey()),
      Account.fromHeadlessWebAuthn(P256.randomPrivateKey(), {
        origin: 'https://example.com',
        rpId: 'example.com',
      }),
      Account.fromWebCryptoP256(await WebCryptoP256.createKeyPair()),
    ]
    const account = Account.fromMultisig({
      owners,
      salt: toHex(0x106123, { size: 32 }),
      threshold: owners.length,
    })
    const client = getClient()

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    for (let nonce = 0; nonce < 2; nonce++) {
      const request = await prepareTransactionRequest(client, {
        account,
        calls: [{ to: tempo.accounts[20].address, value: 0n }],
        feeToken: tempo.feeToken,
      })
      expect(request).toMatchObject({
        keyData: '0x0578',
        keyType: 'webAuthn',
      })
      for (const owner of owners.slice(0, -1)) {
        const pending = await sendTransactionSync(client, {
          ...request,
          account: owner,
        })
        expect(pending.status).toBe('pending')
      }
      const receipt = await sendTransactionSync(client, {
        ...request,
        account: owners[3],
      })

      expect(receipt.status).toBe('success')
      const transaction = await getTransaction(client, {
        hash: receipt.transactionHash,
      })
      expect(transaction.nonce).toBe(nonce)
      expect(transaction.signature?.type).toBe('multisig')
      if (transaction.signature?.type !== 'multisig')
        throw new Error('unreachable')
      expect(
        transaction.signature.signatures
          .map((signature) => signature.type)
          .sort(),
      ).toEqual(['p256', 'p256', 'secp256k1', 'webAuthn'])
      expect(
        transaction.signature.signatures
          .filter((signature) => signature.type === 'p256')
          .map((signature) => signature.prehash)
          .sort(),
      ).toEqual([false, true])
    }
  })

  test('mixed local and external owners', async () => {
    const localOwner = Account.fromSecp256k1(generatePrivateKey())
    const externalOwner = Account.fromSecp256k1(generatePrivateKey())
    const account = Account.fromMultisig({
      owners: [localOwner, externalOwner.address],
      salt: toHex(0x106124, { size: 32 }),
      threshold: 2,
    })
    const client = getClient()

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    for (let nonce = 0; nonce < 2; nonce++) {
      const request = await prepareTransactionRequest(client, {
        account,
        calls: [{ to: tempo.accounts[20].address, value: 0n }],
        feeToken: tempo.feeToken,
      })
      const pending = await sendTransactionSync(client, {
        ...request,
        account: externalOwner,
      })
      expect(pending.status).toBe('pending')
      const receipt = await sendTransactionSync(client, {
        ...request,
        account: localOwner,
      })

      expect(receipt.status).toBe('success')
      expect(receipt.from).toBe(account.address.toLowerCase())
      const transaction = await getTransaction(client, {
        hash: receipt.transactionHash,
      })
      expect(transaction.nonce).toBe(nonce)
      expect(transaction.signature?.type).toBe('multisig')
      if (transaction.signature?.type !== 'multisig')
        throw new Error('unreachable')
      expect(transaction.signature.signatures).toHaveLength(2)
    }
  })

  test('example: nested ownership', async () => {
    const childOwner = tempo.accounts[17]
    const child = Account.fromMultisig({
      owners: [childOwner],
      salt: toHex(0x106127, { size: 32 }),
    })
    const client = getClient()
    expect(child.config.threshold).toBe(1)
    expect(child.config.owners[0]?.weight).toBe(1)

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: child.address,
      token: tempo.feeToken,
    })

    const childBootstrap = await prepareTransactionRequest(client, {
      account: child,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      feeToken: tempo.feeToken,
    })
    const childReceipt = await sendTransactionSync(client, {
      ...childBootstrap,
      account: childOwner,
    })
    expect(childReceipt.status).toBe('success')

    const account = Account.fromMultisig({
      owners: [child],
      salt: toHex(0x106128, { size: 32 }),
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    for (let nonce = 0; nonce < 2; nonce++) {
      const request = await prepareTransactionRequest(client, {
        account,
        calls: [{ to: tempo.accounts[20].address, value: 0n }],
        feeToken: tempo.feeToken,
      })
      const receipt = await sendTransactionSync(client, {
        ...request,
        account: child,
      })

      expect(receipt.status).toBe('success')
      expect(receipt.from).toBe(account.address.toLowerCase())
      expect(request.nonce).toBe(nonce)

      const transaction = await getTransaction(client, {
        hash: receipt.transactionHash,
      })
      expect(transaction.signature?.type).toBe('multisig')
      if (transaction.signature?.type !== 'multisig')
        throw new Error('unreachable')
      expect(transaction.signature.signatures[0]?.type).toBe('multisig')
    }

    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })
    const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
      account,
      accessKey,
    })
    const request = await prepareTransactionRequest(client, {
      account: accessKey,
      feeToken: tempo.feeToken,
      keyAuthorization,
      to: tempo.accounts[20].address,
      value: 0n,
    })
    const receipt = await sendTransactionSync(client, request)

    expect(receipt.status).toBe('success')
    const nestedAuthorization = await getTransaction(client, {
      hash: receipt.transactionHash,
    })
    expect(nestedAuthorization.keyAuthorization?.signature.type).toBe(
      'multisig',
    )
    if (nestedAuthorization.keyAuthorization?.signature.type !== 'multisig')
      throw new Error('unreachable')
    expect(
      nestedAuthorization.keyAuthorization.signature.signatures[0]?.type,
    ).toBe('multisig')
  })

  test('example: weighted quorum', async () => {
    const [heavy, light_1, light_2] = [
      tempo.accounts[6],
      tempo.accounts[7],
      tempo.accounts[8],
    ].sort((a, b) => a.address.localeCompare(b.address))
    const account = Account.fromMultisig({
      owners: [
        { owner: heavy.address, weight: 2 },
        { owner: light_1.address, weight: 1 },
        { owner: light_2.address, weight: 1 },
      ],
      salt: toHex(0x106129, { size: 32 }),
      threshold: 3,
    })
    const client = getClient()

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const bootstrap = await prepareTransactionRequest(client, {
      account,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      feeToken: tempo.feeToken,
    })
    const bootstrapPending = await sendTransactionSync(client, {
      ...bootstrap,
      account: heavy,
    })
    expect(bootstrapPending.status).toBe('pending')
    expect(bootstrapPending.multisigWeight).toBe(2)
    const bootstrapReceipt = await sendTransactionSync(client, {
      ...bootstrap,
      account: light_1,
    })
    expect(bootstrapReceipt.status).toBe('success')

    const valid = await prepareTransactionRequest(client, {
      account,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      feeToken: tempo.feeToken,
    })
    const validPending = await sendTransactionSync(client, {
      ...valid,
      account: heavy,
    })
    expect(validPending.status).toBe('pending')
    const validReceipt = await sendTransactionSync(client, {
      ...valid,
      account: light_2,
    })
    expect(validReceipt.status).toBe('success')

    const collected = await prepareTransactionRequest(client, {
      account,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      feeToken: tempo.feeToken,
    })
    const lightPending_1 = await sendTransactionSync(client, {
      ...collected,
      account: light_1,
    })
    expect(lightPending_1.status).toBe('pending')
    expect(lightPending_1.multisigWeight).toBe(1)
    const lightPending_2 = await sendTransactionSync(client, {
      ...collected,
      account: light_2,
    })
    expect(lightPending_2.status).toBe('pending')
    expect(lightPending_2.multisigWeight).toBe(2)
    const receipt = await sendTransactionSync(client, {
      ...collected,
      account: heavy,
    })
    expect(receipt.status).toBe('success')

    const transaction = await getTransaction(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.signature?.type).toBe('multisig')
    if (transaction.signature?.type !== 'multisig')
      throw new Error('unreachable')
    expect(transaction.signature.signatures).toHaveLength(2)
  })

  test('account hoisted to client: send without explicit `account`', async () => {
    const owner_1 = tempo.accounts[8]
    const owner_2 = tempo.accounts[9]
    const account = Account.fromMultisig({
      owners: [owner_1, owner_2],
      salt: toHex(0x106125, { size: 32 }),
      threshold: 2,
    })
    const accountClient = createClient({
      account,
      chain: tempoLocalnet,
      multisig: { store: Multisig.Store.memory() },
      tokens: tempo.tokens,
      transport: tempo.http(),
    })

    await Actions.token.transferSync(accountClient, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const request = await prepareTransactionRequest(accountClient, {
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      feeToken: tempo.feeToken,
    })
    const receipt = await sendTransactionSync(accountClient, request)

    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('infer multisig from `account` (no `multisig` field)', async () => {
    const owner_1 = tempo.accounts[10]
    const owner_2 = tempo.accounts[11]
    const account = Account.fromMultisig({
      owners: [owner_1.address, owner_2.address],
      salt: toHex(0x106126, { size: 32 }),
      threshold: 2,
    })
    const client = getClient()

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const request = await prepareTransactionRequest(client, {
      account,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      feeToken: tempo.feeToken,
    })
    const pending = await sendTransactionSync(client, {
      ...request,
      account: owner_1,
    })
    expect(pending.status).toBe('pending')
    const receipt = await sendTransactionSync(client, {
      ...request,
      account: owner_2,
    })

    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('behavior: address requires an initialized account', async () => {
    const client = getClient()
    const account = Account.fromMultisig(tempo.accounts[0].address)

    await expect(
      prepareTransactionRequest(client, {
        account,
        calls: [{ to: tempo.accounts[20].address, value: 0n }],
        feeToken: tempo.feeToken,
      }),
    ).rejects.toThrow(
      'Cannot prepare an uninitialized multisig account from an address. Provide its initial config instead.',
    )
  })

  test('example: fee sponsorship (both signing orders)', async () => {
    const owner_1 = tempo.accounts[12]
    const owner_2 = tempo.accounts[13]
    const account = Account.fromMultisig({
      owners: [owner_1.address, owner_2.address],
      salt: toHex(0x10612a, { size: 32 }),
      threshold: 2,
    })
    const client = getClient()

    const request = await prepareTransactionRequest(client, {
      account,
      feePayer: tempo.accounts[0],
      to: account.address,
      value: 0n,
    })
    const pending = await sendTransactionSync(client, {
      ...request,
      account: owner_1,
    })
    expect(pending.status).toBe('pending')
    const receipt = await sendTransactionSync(client, {
      ...request,
      account: owner_2,
    })

    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
    expect(receipt.feePayer).toBe(tempo.accounts[0].address.toLowerCase())

    const feePayerFirst = await prepareTransactionRequest(client, {
      account,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      feePayer: true,
      feeToken: tempo.feeToken,
    })
    if (!feePayerFirst.calls) throw new Error('Expected prepared calls.')
    const transaction = TxEnvelopeTempo.from({
      calls: feePayerFirst.calls,
      chainId: feePayerFirst.chainId,
      feePayerSignature: null,
      feeToken: tempo.feeToken,
      gas: feePayerFirst.gas,
      maxFeePerGas: feePayerFirst.maxFeePerGas,
      maxPriorityFeePerGas: feePayerFirst.maxPriorityFeePerGas,
      nonce: BigInt(feePayerFirst.nonce),
      type: 'tempo',
    })
    const feePayerSignature = parseSignature(
      await tempo.accounts[0].sign({
        hash: TxEnvelopeTempo.getFeePayerSignPayload(transaction, {
          sender: account.address,
        }),
      }),
    )
    const sponsored = {
      ...feePayerFirst,
      feePayer: true as const,
      feePayerSignature,
      feeToken: tempo.feeToken,
    }
    const feePayerFirstPending = await sendTransactionSync(client, {
      ...sponsored,
      account: owner_1,
    })
    expect(feePayerFirstPending.status).toBe('pending')
    const feePayerFirstReceipt = await sendTransactionSync(client, {
      ...sponsored,
      account: owner_2,
    })

    expect(feePayerFirstReceipt.status).toBe('success')
    expect(feePayerFirstReceipt.from).toBe(account.address.toLowerCase())
    expect(feePayerFirstReceipt.feePayer).toBe(
      tempo.accounts[0].address.toLowerCase(),
    )
  })

  test('example: bootstrap and immediate access key use', async () => {
    const owner_1 = tempo.accounts[18]
    const owner_2 = tempo.accounts[19]
    const account = Account.fromMultisig({
      owners: [owner_1, owner_2],
      salt: toHex(0x10612b, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })
    const client = getClient()

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
      account,
      accessKey,
    })
    const request = await prepareTransactionRequest(client, {
      account: accessKey,
      feeToken: tempo.feeToken,
      keyAuthorization,
      to: tempo.accounts[20].address,
      value: 0n,
    })
    const receipt = await sendTransactionSync(client, request)

    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())

    const transaction = await getTransaction(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.signature?.type).toBe('keychain')
    expect(transaction.keyAuthorization?.signature.type).toBe('multisig')
    if (transaction.keyAuthorization?.signature.type !== 'multisig')
      throw new Error('unreachable')
    expect(transaction.keyAuthorization.signature.init).toBeDefined()
  })

  test('external owners authorize an access key', async () => {
    const owner_1 = tempo.accounts[18]
    const owner_2 = tempo.accounts[19]
    const account = Account.fromMultisig({
      owners: [owner_1.address, owner_2.address],
      salt: toHex(0x10612c, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })
    const client = getClient()

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const authorization = await Actions.accessKey.prepareAuthorization(client, {
      account,
      accessKey,
    })
    const signatures = await Promise.all(
      [owner_1, owner_2].map((owner) =>
        owner.sign({ hash: authorization.signPayload }),
      ),
    )
    const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
      ...authorization,
      signatures,
    })
    const request = await prepareTransactionRequest(client, {
      account: accessKey,
      feeToken: tempo.feeToken,
      keyAuthorization,
      to: tempo.accounts[20].address,
      value: 0n,
    })
    const receipt = await sendTransactionSync(client, request)

    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('example: bootstrap and subsequent access key use', async () => {
    const owner_1 = tempo.accounts[19]
    const owner_2 = tempo.accounts[20]
    const account = Account.fromMultisig({
      owners: [owner_1, owner_2],
      salt: toHex(0x10612d, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })
    const client = getClient()

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
      account,
      accessKey,
    })
    const bootstrap = await prepareTransactionRequest(client, {
      account,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      feeToken: tempo.feeToken,
      keyAuthorization,
    })
    const bootstrapReceipt = await sendTransactionSync(client, bootstrap)
    expect(bootstrapReceipt.status).toBe('success')

    const bootstrapResult = await getTransaction(client, {
      hash: bootstrapReceipt.transactionHash,
    })
    expect(bootstrapResult.signature?.type).toBe('multisig')
    if (bootstrapResult.signature?.type !== 'multisig')
      throw new Error('unreachable')
    expect(bootstrapResult.signature.init).toBeDefined()
    expect(bootstrapResult.keyAuthorization?.signature.type).toBe('multisig')
    if (bootstrapResult.keyAuthorization?.signature.type !== 'multisig')
      throw new Error('unreachable')
    expect(bootstrapResult.keyAuthorization.signature.init).toBeUndefined()

    const request = await prepareTransactionRequest(client, {
      account: accessKey,
      feeToken: tempo.feeToken,
      to: tempo.accounts[20].address,
      value: 0n,
    })
    const receipt = await sendTransactionSync(client, request)
    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('example: configuration rotation', async () => {
    const owner_1 = tempo.accounts[14]
    const owner_2 = tempo.accounts[15]
    const owner_3 = tempo.accounts[16]
    const owner_4 = tempo.accounts[17]
    const account = Account.fromMultisig({
      owners: [owner_1, owner_2],
      salt: toHex(0x10612e, { size: 32 }),
      threshold: 2,
    })
    const initialConfig = account.config
    const client = getClient()

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const bootstrap = await prepareTransactionRequest(client, {
      account,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      feeToken: tempo.feeToken,
    })
    expect(bootstrap.multisigSignatureCount).toBeUndefined()
    expect(bootstrap.multisigVersion).toBe(0n)
    const bootstrapPending = await sendTransactionSync(client, {
      ...bootstrap,
      account: owner_1,
    })
    expect(bootstrapPending.status).toBe('pending')
    const bootstrapReceipt = await sendTransactionSync(client, {
      ...bootstrap,
      account: owner_2,
    })
    expect(bootstrapReceipt.status).toBe('success')
    expect(
      await Actions.multisig.getConfig(client, { account: account.address }),
    ).toEqual({
      version: 0n,
      threshold: initialConfig.threshold,
      owners: initialConfig.owners,
    })

    const initializedAccount = Account.fromMultisig(account.address)
    expect(initializedAccount.config).toBeUndefined()
    const update = await prepareTransactionRequest(client, {
      account: initializedAccount,
      calls: [
        Actions.multisig.updateConfig.call({
          threshold: 2,
          owners: [
            { owner: owner_3.address, weight: 1 },
            { owner: owner_4.address, weight: 1 },
          ],
        }),
      ],
      feeToken: tempo.feeToken,
    })
    expect(update.multisig).toBe(initializedAccount.address)
    expect(update.multisigInit).toBeUndefined()
    const updatePending = await sendTransactionSync(client, {
      ...update,
      account: owner_1,
    })
    expect(updatePending.status).toBe('pending')
    const updateReceipt = await sendTransactionSync(client, {
      ...update,
      account: owner_2,
    })
    expect(updateReceipt.status).toBe('success')
    expect(
      Actions.multisig.updateConfig.extractEvent(updateReceipt.logs).args,
    ).toMatchObject({
      account: initializedAccount.address,
      threshold: 2,
      owners: expect.arrayContaining([
        { owner: owner_3.address, weight: 1 },
        { owner: owner_4.address, weight: 1 },
      ]),
    })

    const request = await prepareTransactionRequest(client, {
      account: initializedAccount,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      feeToken: tempo.feeToken,
    })
    expect(request.multisigSignatureCount).toBeUndefined()
    expect(request.multisigOwnerStates?.[0]).toEqual({
      account: initializedAccount.address,
      config: {
        owners: expect.arrayContaining([
          { owner: owner_3.address, weight: 1 },
          { owner: owner_4.address, weight: 1 },
        ]),
        threshold: 2,
      },
      initialized: true,
      version: 1n,
    })
    expect(request.multisigVersion).toBe(1n)
    const pending = await sendTransactionSync(client, {
      ...request,
      account: owner_3,
    })
    expect(pending.status).toBe('pending')
    const receipt = await sendTransactionSync(client, {
      ...request,
      account: owner_4,
    })

    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(initializedAccount.address.toLowerCase())
  })

  test('broadcasts multiple approvals from one submission', async () => {
    const account = Account.fromMultisig({
      owners: [tempo.accounts[3], tempo.accounts[4]],
      salt: toHex(0x106121, { size: 32 }),
      threshold: 2,
    })
    const client = getClient()
    const recipient = tempo.accounts[19].address

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })
    const balance = await Actions.token.getBalance(client, {
      account: recipient,
      token: tempo.feeToken,
    })
    const request = await prepareTransactionRequest(client, {
      account,
      calls: [
        Actions.token.transfer.call(client, {
          amount: 3n,
          to: recipient,
          token: tempo.feeToken,
        }),
      ],
      feeToken: tempo.feeToken,
    })
    const receipt = await sendTransactionSync(client, {
      ...request,
      account,
    })

    expect(receipt).toMatchInlineSnapshot(
      {
        blockHash: expect.any(String),
        blockNumber: expect.any(BigInt),
        cumulativeGasUsed: expect.any(BigInt),
        effectiveGasPrice: expect.any(BigInt),
        gasUsed: expect.any(BigInt),
        logs: expect.any(Array),
        logsBloom: expect.any(String),
        transactionHash: expect.any(String),
        transactionIndex: expect.any(Number),
      },
      `
      {
        "blockHash": Any<String>,
        "blockNumber": Any<BigInt>,
        "contractAddress": null,
        "cumulativeGasUsed": Any<BigInt>,
        "effectiveGasPrice": Any<BigInt>,
        "feePayer": "0xd6122b3b15e50339ea1035b7afbb2fa676017bdb",
        "feeToken": "0x20c0000000000000000000000000000000000000",
        "from": "0xd6122b3b15e50339ea1035b7afbb2fa676017bdb",
        "gasUsed": Any<BigInt>,
        "logs": Any<Array>,
        "logsBloom": Any<String>,
        "status": "success",
        "to": "0x20c0000000000000000000000000000000000000",
        "transactionHash": Any<String>,
        "transactionIndex": Any<Number>,
        "type": "0x76",
      }
    `,
    )
    expect(
      (
        await Actions.token.getBalance(client, {
          account: recipient,
          token: tempo.feeToken,
        })
      ).amount - balance.amount,
    ).toMatchInlineSnapshot(`3n`)
    const transaction = await getTransaction(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.signature).toMatchInlineSnapshot(
      {
        signatures: expect.any(Array),
      },
      `
      {
        "account": "0xd6122b3b15e50339ea1035b7afbb2fa676017bdb",
        "init": {
          "owners": [
            {
              "owner": "0xcb9fa1ea9b8a3bf422a8639f23df77ea66020ec2",
              "weight": 1,
            },
            {
              "owner": "0xefdd9ca0e063bd6974d8fa944a747620fe7032e3",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000106121",
          "threshold": 2,
        },
        "signatures": Any<Array>,
        "type": "multisig",
      }
    `,
    )
  })

  test('serializes identical transactions when approvals cross quorum concurrently', async () => {
    const owner_1 = tempo.accounts[5]
    const owner_2 = tempo.accounts[6]
    const owner_3 = tempo.accounts[7]
    const account = Account.fromMultisig({
      owners: [owner_1, owner_2, owner_3],
      salt: toHex(0x10612f, { size: 32 }),
      threshold: 2,
    })
    const store = Multisig.Store.memory()
    const serializedTransactions: string[] = []
    let collect = false
    let release: (() => void) | undefined
    const thresholdCrossed = new Promise<void>((resolve) => {
      release = resolve
    })
    const baseTransport = tempo.http()
    const transport: Transport = (options) => {
      const value = baseTransport(options)
      return {
        ...value,
        request: async (request) => {
          const serialized = Array.isArray(request.params)
            ? request.params[0]
            : undefined
          if (
            collect &&
            request.method === 'eth_sendRawTransactionSync' &&
            typeof serialized === 'string'
          ) {
            serializedTransactions.push(serialized)
            if (serializedTransactions.length === 2) release?.()
            await thresholdCrossed
          }
          return await value.request(request as never)
        },
      }
    }
    const client = createClient({
      chain: tempoLocalnet,
      multisig: { store },
      tokens: tempo.tokens,
      transport,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })
    const request = await prepareTransactionRequest(client, {
      account,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      feeToken: tempo.feeToken,
    })
    const pending = await sendTransactionSync(client, {
      ...request,
      account: owner_1,
    })
    expect(pending.status).toBe('pending')

    collect = true
    const results = await Promise.allSettled([
      sendTransactionSync(client, { ...request, account: owner_2 }),
      sendTransactionSync(client, { ...request, account: owner_3 }),
    ])

    expect(serializedTransactions).toHaveLength(2)
    expect(serializedTransactions[0]).toBe(serializedTransactions[1])
    expect(results.some((result) => result.status === 'fulfilled')).toBe(true)
    const operation = await client.multisig.getOperation({
      id: pending.transactionHash,
    })
    expect(operation?.status).toBe('success')
  })

  test('retries the same transaction after submission fails', async () => {
    const owner_1 = tempo.accounts[8]
    const owner_2 = tempo.accounts[9]
    const account = Account.fromMultisig({
      owners: [owner_1, owner_2],
      salt: toHex(0x106130, { size: 32 }),
      threshold: 2,
    })
    const store = Multisig.Store.memory()
    const serializedTransactions: string[] = []
    let fail = false
    const baseTransport = tempo.http()
    const transport: Transport = (options) => {
      const value = baseTransport(options)
      return {
        ...value,
        request: async (request) => {
          const serialized = Array.isArray(request.params)
            ? request.params[0]
            : undefined
          if (
            fail &&
            request.method === 'eth_sendRawTransactionSync' &&
            typeof serialized === 'string'
          ) {
            serializedTransactions.push(serialized)
            fail = false
            throw new Error('Submission failed.')
          }
          if (
            serializedTransactions.length > 0 &&
            request.method === 'eth_sendRawTransactionSync' &&
            typeof serialized === 'string'
          )
            serializedTransactions.push(serialized)
          return await value.request(request as never)
        },
      }
    }
    const client = createClient({
      chain: tempoLocalnet,
      multisig: { store },
      tokens: tempo.tokens,
      transport,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })
    const request = await prepareTransactionRequest(client, {
      account,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      feeToken: tempo.feeToken,
    })
    const pending = await sendTransactionSync(client, {
      ...request,
      account: owner_1,
    })
    expect(pending.status).toBe('pending')

    fail = true
    await expect(
      sendTransactionSync(client, { ...request, account: owner_2 }),
    ).rejects.toThrow('Submission failed.')
    const failedOperation = await client.multisig.getOperation({
      id: pending.transactionHash,
    })
    expect(failedOperation?.status).toBe('pending')
    expect(failedOperation?.weight).toBe(2)

    const receipt = await sendTransactionSync(client, {
      ...request,
      account: owner_2,
    })
    expect(receipt.status).toBe('success')
    expect(serializedTransactions).toHaveLength(2)
    expect(serializedTransactions[0]).toBe(serializedTransactions[1])
    const operation = await client.multisig.getOperation({
      id: pending.transactionHash,
    })
    expect(operation?.status).toBe('success')
    if (operation?.status !== 'success') throw new Error('unreachable')
    expect(operation.transactionHash).toBe(receipt.transactionHash)
  })
})
