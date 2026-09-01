import { KeyAuthorization, SignatureEnvelope, TxEnvelopeTempo } from 'ox/tempo'
import { maxUint256, parseSignature, type Transport, toHex } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import {
  getTransaction,
  prepareTransactionRequest,
  sendRawTransactionSync,
  sendTransactionSync,
  signTransaction,
} from 'viem/actions'
import { tempoLocalnet } from 'viem/chains'
import {
  Account,
  Actions,
  createClient,
  MultisigConfig,
  MultisigOperation,
  P256,
  Store,
  type Transaction,
  WebCryptoP256,
} from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import * as tempo from '~test/tempo/config.js'
import { withResolvers } from '../utils/promise/withResolvers.js'
import * as OperationStore from './multisig/Operation.js'

describe('stateless', () => {
  const client = tempo.getClient()
  const { accounts, feeToken } = tempo

  const to = '0x0000000000000000000000000000000000000001'

  test('example: repeatable initial config', async () => {
    const owner_1 = accounts[1]
    const owner_2 = accounts[2]
    const config = MultisigConfig.from({
      threshold: 2,
      owners: [
        { owner: owner_1.address, weight: 1 },
        { owner: owner_2.address, weight: 1 },
      ],
    })
    const account = Account.fromMultisig({ address: 'infer', ...config })

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
      expect(tx.signature.config).toMatchObject({ threshold: 2, version: 0n })
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
      expect(tx.signature.config).toMatchObject({ threshold: 2, version: 0n })
      expect(tx.nonce).toBe(1)
    }
  })

  test('example: nested ownership', async () => {
    const childOwner = accounts[17]
    const child = Account.fromMultisig({
      address: 'infer',
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

    const childSuccess = await sendTransactionSync(client, {
      account: child,
      calls: [{ to, value: 0n }],
      feeToken,
    })
    assertSuccess(childSuccess)

    const account = Account.fromMultisig({
      address: 'infer',
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
      const success = await sendTransactionSync(client, {
        account,
        calls: [{ to, value: 0n }],
        feeToken,
        owner: child,
      })
      const receipt = await getReceipt(success)

      expect(receipt.from).toBe(account.address.toLowerCase())

      const parentTransaction = await getTransaction(client, {
        hash: receipt.transactionHash,
      })
      expect(parentTransaction.nonce).toBe(nonce)
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
    const account = Account.fromMultisig({ address: 'infer', ...config })

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

    const initial = await prepareTransactionRequest(client, {
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
    const initialSignatures = await Promise.all(
      [heavy, light_1].map((owner) =>
        signTransaction(client, { ...initial, account: owner }),
      ),
    )
    const initialSuccess = await sendTransactionSync(client, {
      ...initial,
      signatures: initialSignatures,
    })
    assertSuccess(initialSuccess)

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
    const validSuccess = await sendTransactionSync(client, {
      ...valid,
      signatures: validSignatures,
    })
    assertSuccess(validSuccess)

    const transaction = await getTransaction(client, {
      hash: validSuccess.transactionHash,
    })
    expect(transaction.signature?.type).toBe('multisig')
    if (transaction.signature?.type !== 'multisig')
      throw new Error('unreachable')
    expect(transaction.signature.signatures).toHaveLength(2)
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
    const account = Account.fromMultisig({ address: 'infer', ...config })

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

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
    const success = await sendTransactionSync(client, {
      ...request,
      signatures,
    })
    const receipt = await getReceipt(success)
    expect(receipt.from).toBe(account.address.toLowerCase())
    expect(receipt.feePayer).toBe(accounts[0].address.toLowerCase())

    const feePayerFirst = await prepareTransactionRequest(client, {
      account,
      calls: [{ to, value: 0n }],
      feePayer: true,
      feeToken,
    })
    if (!feePayerFirst.calls) throw new Error('Expected prepared calls.')
    if (feePayerFirst.nonceKey === 'expiring')
      throw new Error('Expected prepared nonce key.')
    const transaction = TxEnvelopeTempo.from({
      calls: feePayerFirst.calls,
      chainId: feePayerFirst.chainId,
      feePayerSignature: null,
      feeToken,
      gas: feePayerFirst.gas,
      maxFeePerGas: feePayerFirst.maxFeePerGas,
      maxPriorityFeePerGas: feePayerFirst.maxPriorityFeePerGas,
      nonce: BigInt(feePayerFirst.nonce),
      nonceKey: feePayerFirst.nonceKey,
      type: 'tempo',
      validAfter: feePayerFirst.validAfter,
      validBefore: feePayerFirst.validBefore,
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
    const feePayerFirstSignatures = await Promise.all(
      [owner_1, owner_2].map((owner) =>
        signTransaction(client, { ...sponsored, account: owner }),
      ),
    )
    const feePayerFirstSuccess = await sendTransactionSync(client, {
      ...sponsored,
      signatures: feePayerFirstSignatures,
    })
    const feePayerFirstReceipt = await getReceipt(feePayerFirstSuccess)

    expect(feePayerFirstReceipt.from).toBe(account.address.toLowerCase())
    expect(feePayerFirstReceipt.feePayer).toBe(
      accounts[0].address.toLowerCase(),
    )
  })

  test('example: initial config and immediate access key use', async () => {
    const owner_1 = accounts[18]
    const owner_2 = accounts[19]
    const account = Account.fromMultisig({
      address: 'infer',
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
    expect(
      immediateTransaction.keyAuthorization.signature.config,
    ).toMatchObject({ version: 0n })
  })

  test('example: independent transaction and access key signatures', async () => {
    const owner_1 = accounts[19]
    const owner_2 = accounts[20]
    const account = Account.fromMultisig({
      address: 'infer',
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
    const initialRequest = await prepareTransactionRequest(client, {
      account,
      calls: [{ to, value: 0n }],
      feeToken,
      keyAuthorization,
    })
    const initialTransaction = await signTransaction(client, initialRequest)
    const initialReceipt = await sendRawTransactionSync(client, {
      serializedTransaction: initialTransaction,
    })
    expect(initialReceipt.status).toBe('success')

    const initialResult = await getTransaction(client, {
      hash: initialReceipt.transactionHash,
    })
    expect(initialResult.signature?.type).toBe('multisig')
    if (initialResult.signature?.type !== 'multisig')
      throw new Error('unreachable')
    expect(initialResult.signature.config).toMatchObject({ version: 0n })
    expect(initialResult.keyAuthorization?.signature.type).toBe('multisig')
    if (initialResult.keyAuthorization?.signature.type !== 'multisig')
      throw new Error('unreachable')
    expect(initialResult.keyAuthorization.signature.config).toMatchObject({
      version: 0n,
    })

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
      address: 'infer',
      owners: [owner_1, owner_2],
      salt: toHex(0x106105, { size: 32 }),
      threshold: 2,
    })
    const initialConfig = account.config

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

    const initial = await prepareTransactionRequest(client, {
      account,
      calls: [{ to, value: 0n }],
      feeToken,
    })
    const initialSignatures = await Promise.all(
      [owner_1, owner_2].map((owner) =>
        signTransaction(client, { ...initial, account: owner }),
      ),
    )
    const initialSuccess = await sendTransactionSync(client, {
      ...initial,
      signatures: initialSignatures,
    })
    assertSuccess(initialSuccess)
    expect(
      await Actions.multisig.getConfigCommitment(client, {
        account: account.address,
      }),
    ).toBe(toHex(0, { size: 32 }))

    const update = await prepareTransactionRequest(client, {
      account,
      calls: [
        Actions.multisig.updateConfig.call({
          currentConfig: initialConfig,
          nextConfig: {
            owners: [
              { owner: owner_3.address, weight: 1 },
              { owner: owner_4.address, weight: 1 },
            ],
            threshold: 2,
          },
        }),
      ],
      feeToken,
    })
    const updateSignatures = await Promise.all(
      [owner_1, owner_2].map((owner) =>
        signTransaction(client, { ...update, account: owner }),
      ),
    )
    const updateSuccess = await sendTransactionSync(client, {
      ...update,
      signatures: updateSignatures,
    })
    const updateReceipt = await getReceipt(updateSuccess)
    expect(
      Actions.multisig.updateConfig.extractEvent(updateReceipt.logs).args,
    ).toMatchObject({
      account: account.address,
      threshold: 2,
      owners: expect.arrayContaining([
        { owner: owner_3.address, weight: 1 },
        { owner: owner_4.address, weight: 1 },
      ]),
    })

    const currentAccount = Account.fromMultisig({
      address: account.address,
      owners: [owner_3, owner_4],
      salt: initialConfig.salt,
      threshold: 2,
      version: 1,
    })

    const request = await prepareTransactionRequest(client, {
      account: currentAccount,
      calls: [{ to, value: 0n }],
      feeToken,
    })
    const signatures = await Promise.all(
      [owner_3, owner_4].map((owner) =>
        signTransaction(client, { ...request, account: owner }),
      ),
    )
    const success = await sendTransactionSync(client, {
      ...request,
      signatures,
    })
    const receipt = await getReceipt(success)
    expect(receipt.from).toBe(currentAccount.address.toLowerCase())
  })

  test.each([
    { name: '1-of-1', ownerCount: 1, salt: 0x106131, threshold: 1 },
    { name: '1-of-4', ownerCount: 4, salt: 0x106132, threshold: 1 },
    { name: '2-of-4', ownerCount: 4, salt: 0x106133, threshold: 2 },
  ])('behavior: $name: sends with local quorum', async (options) => {
    const account = Account.fromMultisig({
      address: 'infer',
      owners: accounts.slice(1, options.ownerCount + 1),
      salt: toHex(options.salt, { size: 32 }),
      threshold: options.threshold,
    })
    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

    const { receipt } = await Actions.token.transferSync(client, {
      account,
      amount: 1n,
      to,
      token: feeToken,
    })

    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())

    const transaction = await getTransaction(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.signature?.type).toBe('multisig')
    if (transaction.signature?.type !== 'multisig')
      throw new Error('unreachable')
    expect(transaction.signature.signatures).toHaveLength(options.threshold)
  })

  test('behavior: 2-of-3 (M-of-N): threshold subset of owners approves', async () => {
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
    const account = Account.fromMultisig({ address: 'infer', ...config })

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
    const success = await sendTransactionSync(client, {
      ...request,
      signatures,
    })
    const receipt = await getReceipt(success)
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('behavior: mixed owner key types', async () => {
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
    const account = Account.fromMultisig({ address: 'infer', ...config })

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
      expect(request.multisigSimulation?.approvals).toMatchInlineSnapshot(
        [
          { owner: expect.any(String) },
          { owner: expect.any(String) },
          { owner: expect.any(String) },
          { owner: expect.any(String) },
        ],
        `
        [
          {
            "keyData": "0x0578",
            "keyType": "webAuthn",
            "owner": Any<String>,
            "type": "primitive",
          },
          {
            "keyData": "0x0578",
            "keyType": "webAuthn",
            "owner": Any<String>,
            "type": "primitive",
          },
          {
            "keyData": "0x0578",
            "keyType": "webAuthn",
            "owner": Any<String>,
            "type": "primitive",
          },
          {
            "keyData": "0x0578",
            "keyType": "webAuthn",
            "owner": Any<String>,
            "type": "primitive",
          },
        ]
      `,
      )
      const signatures = await Promise.all(
        owners.map((owner) =>
          signTransaction(client, { ...request, account: owner }),
        ),
      )
      const success = await sendTransactionSync(client, {
        ...request,
        signatures,
      })

      assertSuccess(success)
      const result = await getTransaction(client, {
        hash: success.transactionHash,
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

  test('behavior: mixed local and external owners', async () => {
    const localOwner = Account.fromSecp256k1(generatePrivateKey())
    const externalOwner = Account.fromSecp256k1(generatePrivateKey())
    const account = Account.fromMultisig({
      address: 'infer',
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

  test('behavior: submits a complete local multisig envelope', async () => {
    const owner_1 = accounts[8]
    const owner_2 = accounts[9]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1, owner_2],
      threshold: 2,
    })

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

    const success = await sendTransactionSync(client, {
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
    assertSuccess(success)
    const receipt = await getReceipt(success)
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('behavior: accepts a multisig account', async () => {
    const owner_1 = accounts[10]
    const owner_2 = accounts[11]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [
        { owner: owner_1.address, weight: 1 },
        { owner: owner_2.address, weight: 1 },
      ],
      threshold: 2,
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
    const success = await sendTransactionSync(client, {
      ...request,
      signatures,
    })
    const receipt = await getReceipt(success)
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('behavior: address requires a config', async () => {
    const account = Account.fromMultisig(accounts[0].address)

    await expect(
      sendTransactionSync(client, {
        account,
        calls: [{ to, value: 0n }],
        feeToken,
        owner: accounts[0],
      }),
    ).rejects.toThrow('A multisig config is required to prepare a transaction.')
  })

  test('behavior: external owners authorize an access key', async () => {
    const owner_1 = accounts[18]
    const owner_2 = accounts[19]
    const account = Account.fromMultisig({
      address: 'infer',
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
})

describe('stateful', () => {
  const client = createClient({
    chain: tempoLocalnet,
    experimental_multisig: true,
    tokens: tempo.tokens,
    transport: tempo.http(),
  })

  test('behavior: rejects unknown and invalid config lookups', async () => {
    const address = tempo.accounts[20].address
    await expect(
      client.multisig.getConfig({ address }),
    ).resolves.toMatchInlineSnapshot(`null`)

    await expect(
      sendTransactionSync(client, {
        account: Account.fromMultisig(address),
        calls: [{ data: '0xdeadbeef', to: tempo.accounts[19].address }],
        owner: tempo.accounts[1],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [TransactionExecutionError: An error occurred.

      Request Arguments:
        from:  0x0F9e2db5D73Bf2698b3cc235a719200d209Cd77C

      Details: No current multisig config is cached for account 0x0F9e2db5D73Bf2698b3cc235a719200d209Cd77C. Provide the current config.
      Version: viem@x.y.z]
    `,
    )

    await expect(
      client.request({
        method: 'multisig_getConfig',
        params: [{ address: '0x01' }],
      } as never),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Expected a multisig account address.]`,
    )
  })

  test('behavior: rejects a malformed cached config', async () => {
    const address = tempo.accounts[19].address
    const store = Store.memory()
    await store.setItem(
      `multisig:config:${address.toLowerCase()}:${toHex(0, { size: 32 })}`,
      'invalid json',
    )
    const client = createClient({
      chain: tempoLocalnet,
      experimental_multisig: { store },
      tokens: tempo.tokens,
      transport: tempo.http(),
    })

    await expect(
      client.multisig.getConfig({ address }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [Multisig.Config.InvalidStoreValueError: Stored multisig config is malformed or mismatched.

      Details: Unexpected token 'i', "invalid json" is not valid JSON
      Version: viem@x.y.z]
    `,
    )
  })

  test('example: repeatable initial config', async () => {
    const owner_1 = tempo.accounts[1]
    const owner_2 = tempo.accounts[2]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1.address, owner_2.address],
      salt: toHex(0x106120, { size: 32 }),
      threshold: 2,
    })
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
    const { receipt: pending } = await Actions.token.transferSync(client, {
      account: account,
      amount: 1n,
      owner: owner_1,
      to: recipient,
      token: tempo.feeToken,
    })
    const pendingResult = pending.multisig
    if (!pendingResult) throw new Error('Expected multisig operation.')
    expect(pendingResult).toMatchInlineSnapshot(
      {
        approvals: [expect.any(String)],
        createdAt: expect.any(Number),
        hash: expect.any(String),
        transaction: expect.any(String),
        updatedAt: expect.any(Number),
      },
      `
      {
        "account": "0x11039e2a0f4814c7c71870d21490ba92de707b37",
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
          "version": 0n,
        },
        "createdAt": Any<Number>,
        "hash": Any<String>,
        "signatureCount": 1,
        "status": "pending",
        "threshold": 2,
        "transaction": Any<String>,
        "type": "transaction",
        "updatedAt": Any<Number>,
        "weight": 1,
      }
    `,
    )
    const hash = pending.transactionHash

    await sendTransactionSync(client, {
      account,
      hash,
      owner: owner_1,
    })

    const pendingOperation = (await getTransaction(client, { hash })).multisig
    expect(pendingOperation).toStrictEqual({
      ...pendingResult,
      updatedAt: expect.any(Number),
    })

    const success = await sendTransactionSync(client, {
      account,
      hash,
      owner: owner_2,
    })
    const successResult = success.multisig
    if (!successResult) throw new Error('Expected multisig operation.')
    expect(successResult).toMatchInlineSnapshot(
      {
        approvals: [expect.any(String), expect.any(String)],
        createdAt: expect.any(Number),
        hash: expect.any(String),
        transaction: expect.any(String),
        transactionHash: expect.any(String),
        updatedAt: expect.any(Number),
      },
      `
      {
        "account": "0x11039e2a0f4814c7c71870d21490ba92de707b37",
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
          "version": 0n,
        },
        "createdAt": Any<Number>,
        "hash": Any<String>,
        "signatureCount": 2,
        "status": "success",
        "threshold": 2,
        "transaction": Any<String>,
        "transactionHash": Any<String>,
        "type": "transaction",
        "updatedAt": Any<Number>,
        "weight": 2,
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

    if (success.status !== 'success') throw new Error('Expected success.')
    const transaction = await getTransaction(client, {
      hash: success.transactionHash,
    })
    expect(transaction.signature).toMatchInlineSnapshot(
      {
        signatures: expect.any(Array),
      },
      `
      {
        "account": "0x11039e2a0f4814c7c71870d21490ba92de707b37",
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
          "version": 0n,
        },
        "signatures": Any<Array>,
        "type": "multisig",
      }
    `,
    )

    expect((await getTransaction(client, { hash })).multisig).toStrictEqual(
      successResult,
    )

    const secondPending = await sendTransactionSync(client, {
      account: account,
      calls: [
        Actions.token.transfer.call(client, {
          amount: 2n,
          to: recipient,
          token: tempo.feeToken,
        }),
      ],
      owner: owner_1,
    })
    const secondHash = secondPending.transactionHash
    expect(
      (await getTransaction(client, { hash: secondHash })).multisig,
    ).toMatchInlineSnapshot(
      {
        approvals: [expect.any(String)],
        createdAt: expect.any(Number),
        hash: expect.any(String),
        transaction: expect.any(String),
        updatedAt: expect.any(Number),
      },
      `
      {
        "account": "0x11039e2a0f4814c7c71870d21490ba92de707b37",
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
          "version": 0n,
        },
        "createdAt": Any<Number>,
        "hash": Any<String>,
        "signatureCount": 1,
        "status": "pending",
        "threshold": 2,
        "transaction": Any<String>,
        "type": "transaction",
        "updatedAt": Any<Number>,
        "weight": 1,
      }
    `,
    )

    const secondSuccess = await sendTransactionSync(client, {
      account,
      hash: secondHash,
      owner: owner_2,
    })
    expect(secondSuccess.status).toMatchInlineSnapshot(`"success"`)
    expect(
      (await getTransaction(client, { hash: secondHash })).multisig,
    ).toMatchObject({ hash: secondHash, status: 'success', weight: 2 })
    const replayedReceipt = await sendTransactionSync(client, {
      account,
      hash: secondHash,
      owner: owner_2,
    })
    expect(replayedReceipt).toMatchObject({
      multisig: { hash: secondHash, status: 'success', weight: 2 },
      status: 'success',
    })
  })

  test('example: nested ownership', async () => {
    const childOwner = tempo.accounts[17]
    const child = Account.fromMultisig({
      address: 'infer',
      owners: [childOwner],
      salt: toHex(0x106127, { size: 32 }),
    })
    expect(child.config.threshold).toBe(1)
    expect(child.config.owners[0]?.weight).toBe(1)

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: child.address,
      token: tempo.feeToken,
    })

    const childSuccess = await sendTransactionSync(client, {
      account: child,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      owner: childOwner,
    })
    assertSuccess(childSuccess)

    const account = Account.fromMultisig({
      address: 'infer',
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
      const success = await sendTransactionSync(client, {
        account: account,
        calls: [{ to: tempo.accounts[20].address, value: 0n }],
        owner: child,
      })

      const receipt = await getReceipt(success)
      expect(receipt.from).toBe(account.address.toLowerCase())

      const transaction = await getTransaction(client, {
        hash: receipt.transactionHash,
      })
      expect(transaction.nonce).toBe(0)
      expect(transaction.nonceKey).not.toBe(0n)
      expect(transaction.nonceKey).not.toBe(maxUint256)
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
    const { receipt } = await Actions.token.transferSync(client, {
      account: accessKey,
      amount: 1n,
      keyAuthorization,
      to: tempo.accounts[20].address,
      token: tempo.feeToken,
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
      tempo.accounts[6],
      tempo.accounts[7],
      tempo.accounts[8],
    ].sort((a, b) => a.address.localeCompare(b.address))
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [
        { owner: heavy.address, weight: 2 },
        { owner: light_1.address, weight: 1 },
        { owner: light_2.address, weight: 1 },
      ],
      salt: toHex(0x106129, { size: 32 }),
      threshold: 3,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const initialPending = await sendTransactionSync(client, {
      account: account,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      owner: heavy,
    })
    expect(initialPending.status).toBe('pending')
    expect(initialPending.multisig?.weight).toBe(2)
    const initialSuccess = await sendTransactionSync(client, {
      account,
      hash: initialPending.transactionHash,
      owner: light_1,
    })
    assertSuccess(initialSuccess)

    const validPending = await sendTransactionSync(client, {
      account: account,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      owner: heavy,
    })
    expect(validPending.status).toBe('pending')
    const validSuccess = await sendTransactionSync(client, {
      account,
      hash: validPending.transactionHash,
      owner: light_2,
    })
    assertSuccess(validSuccess)

    const lightPending_1 = await sendTransactionSync(client, {
      account: account,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      owner: light_1,
    })
    expect(lightPending_1.status).toBe('pending')
    expect(lightPending_1.multisig?.weight).toBe(1)
    const lightPending_2 = await sendTransactionSync(client, {
      account,
      hash: lightPending_1.transactionHash,
      owner: light_2,
    })
    expect(lightPending_2.status).toBe('pending')
    expect(lightPending_2.multisig?.weight).toBe(2)
    const success = await sendTransactionSync(client, {
      account,
      hash: lightPending_1.transactionHash,
      owner: heavy,
    })
    assertSuccess(success)

    const transaction = await getTransaction(client, {
      hash: success.transactionHash,
    })
    expect(transaction.signature?.type).toBe('multisig')
    if (transaction.signature?.type !== 'multisig')
      throw new Error('unreachable')
    expect(transaction.signature.signatures).toHaveLength(2)
  })

  test('example: fee sponsorship', async () => {
    const owner_1 = tempo.accounts[12]
    const owner_2 = tempo.accounts[13]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1.address, owner_2.address],
      salt: toHex(0x10612a, { size: 32 }),
      threshold: 2,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const pending = await sendTransactionSync(client, {
      account: account,
      feePayer: tempo.accounts[0],
      owner: owner_1,
      to: account.address,
      value: 0n,
    })
    expect(pending.status).toBe('pending')
    const success = await sendTransactionSync(client, {
      account,
      hash: pending.transactionHash,
      owner: owner_2,
    })

    const receipt = await getReceipt(success)
    expect(receipt.from).toBe(account.address.toLowerCase())
    expect(receipt.feePayer).toBe(tempo.accounts[0].address.toLowerCase())
  })

  test('example: initial config and immediate access key use', async () => {
    const owner_1 = tempo.accounts[18]
    const owner_2 = tempo.accounts[19]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1, owner_2],
      salt: toHex(0x10612b, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })

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
    const { receipt } = await Actions.token.transferSync(client, {
      account: accessKey,
      amount: 1n,
      keyAuthorization,
      to: tempo.accounts[20].address,
      token: tempo.feeToken,
    })

    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())

    const transaction = await getTransaction(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.signature?.type).toBe('keychain')
    expect(transaction.keyAuthorization?.signature.type).toBe('multisig')
    if (transaction.keyAuthorization?.signature.type !== 'multisig')
      throw new Error('unreachable')
    expect(transaction.keyAuthorization.signature.config).toMatchObject({
      version: 0n,
    })
  })

  test('example: independent transaction and access key signatures', async () => {
    const owner_1 = tempo.accounts[19]
    const owner_2 = tempo.accounts[20]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1, owner_2],
      salt: toHex(0x10612d, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })

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
    const { receipt: initialReceipt } = await Actions.token.transferSync(
      client,
      {
        account,
        amount: 1n,
        keyAuthorization,
        to: tempo.accounts[20].address,
        token: tempo.feeToken,
      },
    )
    expect(initialReceipt.status).toBe('success')

    const initialResult = await getTransaction(client, {
      hash: initialReceipt.transactionHash,
    })
    expect(initialResult.signature?.type).toBe('multisig')
    if (initialResult.signature?.type !== 'multisig')
      throw new Error('unreachable')
    expect(initialResult.signature.config).toMatchObject({ version: 0n })
    expect(initialResult.keyAuthorization?.signature.type).toBe('multisig')
    if (initialResult.keyAuthorization?.signature.type !== 'multisig')
      throw new Error('unreachable')
    expect(initialResult.keyAuthorization.signature.config).toMatchObject({
      version: 0n,
    })

    const { receipt } = await Actions.token.transferSync(client, {
      account: accessKey,
      amount: 1n,
      to: tempo.accounts[20].address,
      token: tempo.feeToken,
    })
    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('example: configuration rotation', async () => {
    const owner_1 = tempo.accounts[14]
    const owner_2 = tempo.accounts[15]
    const owner_3 = tempo.accounts[16]
    const owner_4 = tempo.accounts[17]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1, owner_2],
      salt: toHex(0x10612e, { size: 32 }),
      threshold: 2,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const initialPending = await sendTransactionSync(client, {
      account: account,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      owner: owner_1,
    })
    expect(initialPending.multisig?.config.version).toBe(0n)
    expect(initialPending.status).toBe('pending')
    await expect(
      client.multisig.getConfig({ address: account.address }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "owners": [
          {
            "owner": "0x59fc84c01c2317ccdda6be40ce1cff233215c84e",
            "weight": 1,
          },
          {
            "owner": "0x8e4d1a7b8c4f7f4204eb0643c85aa7656880e18b",
            "weight": 1,
          },
        ],
        "salt": "0x000000000000000000000000000000000000000000000000000000000010612e",
        "threshold": 2,
        "version": 0n,
      }
    `)
    const initialSuccess = await sendTransactionSync(client, {
      account,
      hash: initialPending.transactionHash,
      owner: owner_2,
    })
    assertSuccess(initialSuccess)
    expect(
      await Actions.multisig.getConfigCommitment(client, {
        account: account.address,
      }),
    ).toBe(toHex(0, { size: 32 }))

    const { receipt: updatePending } = await Actions.multisig.updateConfigSync(
      client,
      {
        account: account,
        nextConfig: {
          owners: [
            { owner: owner_3.address, weight: 1 },
            { owner: owner_4.address, weight: 1 },
          ],
          threshold: 2,
        },
        owner: owner_1,
      },
    )
    expect(updatePending.multisig?.account).toBe(account.address.toLowerCase())
    expect(updatePending.multisig?.config.version).toBe(0n)
    expect(updatePending.status).toBe('pending')
    expect(
      (await client.multisig.getConfig({ address: account.address }))?.version,
    ).toMatchInlineSnapshot(`0n`)
    const updateSuccess = await sendTransactionSync(client, {
      account,
      hash: updatePending.transactionHash,
      owner: owner_2,
    })
    const updateReceipt = await getReceipt(updateSuccess)
    expect(
      Actions.multisig.updateConfig.extractEvent(updateReceipt.logs).args,
    ).toMatchObject({
      account: account.address,
      threshold: 2,
      owners: expect.arrayContaining([
        { owner: owner_3.address, weight: 1 },
        { owner: owner_4.address, weight: 1 },
      ]),
    })

    await expect(
      client.multisig.getConfig({ address: account.address }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "owners": [
          {
            "owner": "0x2d6776fd5eA3C530b990268078Ac39aC2AE1E6A8",
            "weight": 1,
          },
          {
            "owner": "0x52FECfF3490ad3DAe2F9B2C0A600f53E7bcB86de",
            "weight": 1,
          },
        ],
        "salt": "0x000000000000000000000000000000000000000000000000000000000010612e",
        "threshold": 2,
        "version": 1n,
      }
    `)
    const currentAccount = Account.fromMultisig(account.address)

    const pending = await sendTransactionSync(client, {
      account: currentAccount,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      owner: owner_3,
    })
    expect(pending.multisig?.config).toEqual({
      owners: expect.arrayContaining([
        { owner: owner_3.address.toLowerCase(), weight: 1 },
        { owner: owner_4.address.toLowerCase(), weight: 1 },
      ]),
      salt: expect.any(String),
      threshold: 2,
      version: 1n,
    })
    expect(pending.status).toBe('pending')
    const success = await sendTransactionSync(client, {
      account: currentAccount,
      hash: pending.transactionHash,
      owner: owner_4,
    })

    const receipt = await getReceipt(success)
    expect(receipt.from).toBe(currentAccount.address.toLowerCase())

    const { receipt: secondUpdatePending } =
      await Actions.multisig.updateConfigSync(client, {
        account: currentAccount,
        nextConfig: {
          owners: [
            { owner: owner_1.address, weight: 1 },
            { owner: owner_2.address, weight: 1 },
          ],
          threshold: 2,
        },
        owner: owner_3,
      })
    expect(secondUpdatePending.status).toMatchInlineSnapshot(`"pending"`)
    const secondUpdateSuccess = await sendTransactionSync(client, {
      account: currentAccount,
      hash: secondUpdatePending.transactionHash,
      owner: owner_4,
    })
    await getReceipt(secondUpdateSuccess)
    await expect(
      client.multisig.getConfig({ address: account.address }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "owners": [
          {
            "owner": "0x59Fc84C01c2317cCDdA6Be40ce1cFf233215c84e",
            "weight": 1,
          },
          {
            "owner": "0x8e4D1a7b8c4f7F4204EB0643C85AA7656880E18b",
            "weight": 1,
          },
        ],
        "salt": "0x000000000000000000000000000000000000000000000000000000000010612e",
        "threshold": 2,
        "version": 2n,
      }
    `)
  })

  test('behavior: rejects a JSON-RPC owner account', async () => {
    const owner = tempo.accounts[1]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner.address],
      salt: toHex(0x106139, { size: 32 }),
    })

    await expect(
      sendTransactionSync(client, {
        account: account,
        calls: [{ data: '0xdeadbeef', to: tempo.accounts[20].address }],
        owner: owner.address,
      } as never),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [TransactionExecutionError: An error occurred.

      Request Arguments:
        from:  0x0d4a6cd08FBFB8b8B1bCdee4621F07Db96085cC9

      Details: A local owner account is required to approve a multisig transaction.
      Version: viem@x.y.z]
    `,
    )
  })

  test('behavior: rejects an access key owner account', async () => {
    const owner_1 = tempo.accounts[3]
    const owner_2 = tempo.accounts[4]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1.address, owner_2.address],
      salt: toHex(0x10613c, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: owner_2,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })
    const pending = await sendTransactionSync(client, {
      account: account,
      calls: [{ data: '0xdeadbeef', to: tempo.accounts[20].address }],
      owner: owner_1,
    })

    await expect(
      sendTransactionSync(client, {
        account,
        hash: pending.transactionHash,
        owner: accessKey,
      } as never),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TransactionExecutionError: An error occurred.

      Request Arguments:
        from:  0xca17FfF551F7b195B3D3a859015919B44C453A06

      Details: A Tempo owner account is required to approve a stored multisig transaction.
      Version: viem@x.y.z]
    `)

    const receipt = await sendTransactionSync(client, {
      account,
      hash: pending.transactionHash,
      owner: owner_2,
    })
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  })

  test('behavior: 2-of-3 (M-of-N): threshold subset of owners approves', async () => {
    const owner_1 = tempo.accounts[3]
    const owner_2 = tempo.accounts[4]
    const owner_3 = tempo.accounts[5]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1.address, owner_2.address, owner_3.address],
      salt: toHex(0x106122, { size: 32 }),
      threshold: 2,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const pending = await sendTransactionSync(client, {
      account: account,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      owner: owner_1,
    })
    expect(pending.status).toBe('pending')

    const success = await sendTransactionSync(client, {
      account,
      hash: pending.transactionHash,
      owner: owner_3,
    })
    const receipt = await getReceipt(success)
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('behavior: mixed owner key types', async () => {
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
      address: 'infer',
      owners,
      salt: toHex(0x106123, { size: 32 }),
      threshold: owners.length,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    for (let nonce = 0; nonce < 2; nonce++) {
      const pending = await sendTransactionSync(client, {
        account: account,
        calls: [{ to: tempo.accounts[20].address, value: 0n }],
        owner: owners[0],
      })
      for (const owner of owners.slice(1, -1)) {
        const operation = await sendTransactionSync(client, {
          account,
          hash: pending.transactionHash,
          owner: owner,
        })
        expect(operation.status).toBe('pending')
      }
      const success = await sendTransactionSync(client, {
        account,
        hash: pending.transactionHash,
        owner: owners[3],
      })

      assertSuccess(success)
      const transaction = await getTransaction(client, {
        hash: success.transactionHash,
      })
      expect(transaction.nonce).toBe(0)
      expect(transaction.nonceKey).not.toBe(0n)
      expect(transaction.nonceKey).not.toBe(maxUint256)
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

  test('behavior: mixed local and external owners', async () => {
    const localOwner = Account.fromSecp256k1(generatePrivateKey())
    const externalOwner = Account.fromSecp256k1(generatePrivateKey())
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [localOwner, externalOwner.address],
      salt: toHex(0x106124, { size: 32 }),
      threshold: 2,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    for (let nonce = 0; nonce < 2; nonce++) {
      const pending = await sendTransactionSync(client, {
        account: account,
        calls: [{ to: tempo.accounts[20].address, value: 0n }],
        owner: externalOwner,
      })
      expect(pending.status).toBe('pending')
      const success = await sendTransactionSync(client, {
        account,
        hash: pending.transactionHash,
        owner: localOwner,
      })

      const receipt = await getReceipt(success)
      expect(receipt.from).toBe(account.address.toLowerCase())
      const transaction = await getTransaction(client, {
        hash: receipt.transactionHash,
      })
      expect(transaction.nonce).toBe(0)
      expect(transaction.nonceKey).not.toBe(0n)
      expect(transaction.nonceKey).not.toBe(maxUint256)
      expect(transaction.signature?.type).toBe('multisig')
      if (transaction.signature?.type !== 'multisig')
        throw new Error('unreachable')
      expect(transaction.signature.signatures).toHaveLength(2)
    }
  })

  test('behavior: refreshes a nested owner after its configuration version changes', async () => {
    const childOwner = tempo.accounts[14]
    const parentOwner = tempo.accounts[15]
    const child = Account.fromMultisig({
      address: 'infer',
      owners: [childOwner],
      salt: toHex(0x106136, { size: 32 }),
    })
    const parent = Account.fromMultisig({
      address: 'infer',
      owners: [child, parentOwner.address],
      salt: toHex(0x106137, { size: 32 }),
      threshold: 2,
    })

    for (const account of [child, parent])
      await Actions.token.transferSync(client, {
        account: tempo.accounts[0],
        amount: { formatted: '10000' },
        to: account.address,
        token: tempo.feeToken,
      })

    await sendTransactionSync(client, {
      account: child,
      calls: [{ data: '0xdeadbeef', to: tempo.accounts[20].address }],
      owner: childOwner,
    })
    const pending = await sendTransactionSync(client, {
      account: parent,
      calls: [{ data: '0xdeadbeef', to: tempo.accounts[20].address }],
      owner: child,
    })
    expect(pending.status).toBe('pending')

    const rotation = await sendTransactionSync(client, {
      account: child,
      calls: [
        Actions.multisig.updateConfig.call({
          currentConfig: child.config,
          nextConfig: {
            owners: child.config.owners,
            threshold: child.config.threshold,
          },
        }),
      ],
      owner: childOwner,
    })
    expect(rotation.status).toBe('success')
    const currentChild = Account.fromMultisig({
      address: child.address,
      owners: [childOwner],
      salt: child.config.salt,
      threshold: child.config.threshold,
      version: 1,
    })

    const current = await getTransaction(client, {
      hash: pending.transactionHash,
    })
    expect(current.multisig?.signatureCount).toMatchInlineSnapshot(`0`)
    expect(current.multisig?.weight).toMatchInlineSnapshot(`0`)

    const refreshed = await sendTransactionSync(client, {
      account: parent,
      hash: pending.transactionHash,
      owner: parentOwner,
    })
    expect(refreshed).toMatchObject({
      multisig: { signatureCount: 1, status: 'pending', weight: 1 },
      status: 'pending',
    })

    const success = await sendTransactionSync(client, {
      account: parent,
      hash: pending.transactionHash,
      owner: currentChild,
    })
    expect(success).toMatchObject({
      multisig: { signatureCount: 2, status: 'success', weight: 2 },
      status: 'success',
    })
  })

  test('behavior: allocates independent nonces for concurrent pending operations', async () => {
    const owner_1 = tempo.accounts[12]
    const owner_2 = tempo.accounts[13]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1, owner_2],
      salt: toHex(0x106138, { size: 32 }),
      threshold: 2,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })
    await sendTransactionSync(client, {
      account,
      calls: [{ data: '0xdeadbeef', to: tempo.accounts[20].address }],
    })

    const [pending_1, pending_2] = await Promise.all([
      sendTransactionSync(client, {
        account: account,
        calls: [{ data: '0x01', to: tempo.accounts[20].address }],
        owner: owner_1,
      }),
      sendTransactionSync(client, {
        account: account,
        calls: [{ data: '0x02', to: tempo.accounts[20].address }],
        owner: owner_1,
      }),
    ])
    expect(pending_1.transactionHash).not.toBe(pending_2.transactionHash)

    const operation_1 = (
      await getTransaction(client, { hash: pending_1.transactionHash })
    ).multisig
    const operation_2 = (
      await getTransaction(client, { hash: pending_2.transactionHash })
    ).multisig
    if (!operation_1 || !operation_2)
      throw new Error('Expected multisig operations.')
    const transaction_1 = TxEnvelopeTempo.deserialize(
      operation_1.transaction as never,
    )
    const transaction_2 = TxEnvelopeTempo.deserialize(
      operation_2.transaction as never,
    )
    expect(transaction_1.nonceKey).not.toBe(maxUint256)
    expect(transaction_2.nonceKey).not.toBe(maxUint256)
    expect(transaction_1.nonceKey).not.toBe(transaction_2.nonceKey)
    expect(transaction_1.nonce).toBe(0n)
    expect(transaction_2.nonce).toBe(0n)
    expect(transaction_1.validAfter).toBeUndefined()
    expect(transaction_1.validBefore).toBeUndefined()
    expect(transaction_2.validAfter).toBeUndefined()
    expect(transaction_2.validBefore).toBeUndefined()

    const [success_1, success_2] = await Promise.all([
      sendTransactionSync(client, {
        account,
        hash: pending_1.transactionHash,
        owner: owner_2,
      }),
      sendTransactionSync(client, {
        account,
        hash: pending_2.transactionHash,
        owner: owner_2,
      }),
    ])
    expect(success_1.status).toBe('success')
    expect(success_2.status).toBe('success')
  })

  test('behavior: submits a complete local multisig envelope', async () => {
    const owner_1 = tempo.accounts[8]
    const owner_2 = tempo.accounts[9]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1, owner_2],
      salt: toHex(0x106125, { size: 32 }),
      threshold: 2,
    })
    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const { receipt } = await Actions.token.transferSync(client, {
      account,
      amount: 1n,
      to: tempo.accounts[20].address,
      token: tempo.feeToken,
    })

    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('behavior: address requires a cached config', async () => {
    const account = Account.fromMultisig(tempo.accounts[0].address)

    await expect(
      sendTransactionSync(client, {
        account: account,
        calls: [{ to: tempo.accounts[20].address, value: 0n }],
        owner: tempo.accounts[0],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [TransactionExecutionError: An error occurred.

      Request Arguments:
        from:  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

      Details: No current multisig config is cached for account 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266. Provide the current config.
      Version: viem@x.y.z]
    `,
    )
  })

  test('behavior: coordinates access key authorization approvals', async () => {
    const owner_1 = tempo.accounts[18]
    const owner_2 = tempo.accounts[19]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1, owner_2],
      salt: toHex(0x10612c, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const pending = await Actions.accessKey.signAuthorization(client, {
      accessKey,
      account: account,
      owner: owner_1,
    })
    expect(pending).toMatchInlineSnapshot(
      {
        address: expect.any(String),
        hash: expect.any(String),
        multisig: {
          approvals: [expect.any(String)],
          createdAt: expect.any(Number),
          hash: expect.any(String),
          keyAuthorization: expect.any(String),
          updatedAt: expect.any(Number),
        },
        signature: expect.anything(),
      },
      `
      {
        "account": "0x82a9ed018731c9ef3f688f7a650eb4089b324996",
        "address": Any<String>,
        "chainId": 1337n,
        "hash": Any<String>,
        "isAdmin": false,
        "multisig": {
          "account": "0x82a9ed018731c9ef3f688f7a650eb4089b324996",
          "approvals": [
            Any<String>,
          ],
          "config": {
            "owners": [
              {
                "owner": "0x1e2a9422ebcf2bb0f435d624910ee5086e523248",
                "weight": 1,
              },
              {
                "owner": "0x8d610d35f9c616b6accba492eae3e83724b300a4",
                "weight": 1,
              },
            ],
            "salt": "0x000000000000000000000000000000000000000000000000000000000010612c",
            "threshold": 2,
            "version": 0n,
          },
          "createdAt": Any<Number>,
          "hash": Any<String>,
          "keyAuthorization": Any<String>,
          "signatureCount": 1,
          "status": "pending",
          "threshold": 2,
          "type": "keyAuthorization",
          "updatedAt": Any<Number>,
          "weight": 1,
        },
        "signature": Anything,
        "status": "pending",
        "type": "secp256k1",
      }
    `,
    )
    await expect(
      client.multisig.getOperation({ hash: pending.hash }),
    ).resolves.toStrictEqual(pending.multisig)

    const duplicate = await client.accessKey.signAuthorization({
      hash: pending.hash,
      owner: owner_1,
    })
    expect(duplicate.multisig).toStrictEqual(pending.multisig)

    const { receipt: unrelatedReceipt } = await Actions.token.transferSync(
      client,
      {
        account,
        amount: 1n,
        to: tempo.accounts[20].address,
        token: tempo.feeToken,
      },
    )
    expect(unrelatedReceipt.status).toMatchInlineSnapshot(`"success"`)

    const success = await client.accessKey.signAuthorization({
      hash: pending.hash,
      owner: owner_2,
    })
    expect(success).toMatchInlineSnapshot(
      {
        address: expect.any(String),
        hash: expect.any(String),
        multisig: {
          approvals: [expect.any(String), expect.any(String)],
          createdAt: expect.any(Number),
          hash: expect.any(String),
          keyAuthorization: expect.any(String),
          updatedAt: expect.any(Number),
        },
        signature: expect.anything(),
      },
      `
      {
        "account": "0x82a9ed018731c9ef3f688f7a650eb4089b324996",
        "address": Any<String>,
        "chainId": 1337n,
        "hash": Any<String>,
        "isAdmin": false,
        "multisig": {
          "account": "0x82a9ed018731c9ef3f688f7a650eb4089b324996",
          "approvals": [
            Any<String>,
            Any<String>,
          ],
          "config": {
            "owners": [
              {
                "owner": "0x1e2a9422ebcf2bb0f435d624910ee5086e523248",
                "weight": 1,
              },
              {
                "owner": "0x8d610d35f9c616b6accba492eae3e83724b300a4",
                "weight": 1,
              },
            ],
            "salt": "0x000000000000000000000000000000000000000000000000000000000010612c",
            "threshold": 2,
            "version": 0n,
          },
          "createdAt": Any<Number>,
          "hash": Any<String>,
          "keyAuthorization": Any<String>,
          "signatureCount": 2,
          "status": "success",
          "threshold": 2,
          "type": "keyAuthorization",
          "updatedAt": Any<Number>,
          "weight": 2,
        },
        "signature": Anything,
        "status": "success",
        "type": "secp256k1",
      }
    `,
    )
    await expect(
      client.multisig.getOperation({ hash: success.hash }),
    ).resolves.toStrictEqual(success.multisig)
    await expect(
      client.multisig.getOperation({ hash: `0x${'ff'.repeat(32)}` }),
    ).resolves.toMatchInlineSnapshot(`null`)
    const { receipt } = await Actions.token.transferSync(client, {
      account: accessKey,
      amount: 1n,
      keyAuthorization: success,
      to: tempo.accounts[20].address,
      token: tempo.feeToken,
    })

    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('behavior: coordinates current-config access key authorization approvals', async () => {
    const owner_1 = tempo.accounts[4]
    const owner_2 = tempo.accounts[5]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1, owner_2],
      salt: toHex(0x106140, { size: 32 }),
      threshold: 2,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const { receipt: updatePending } = await Actions.multisig.updateConfigSync(
      client,
      {
        account: account,
        nextConfig: {
          owners: account.config.owners,
          threshold: account.config.threshold,
        },
        owner: owner_1,
      },
    )
    expect(updatePending.status).toMatchInlineSnapshot(`"pending"`)
    const updateSuccess = await sendTransactionSync(client, {
      account,
      hash: updatePending.transactionHash,
      owner: owner_2,
    })
    assertSuccess(updateSuccess)

    const config = await client.multisig.getConfig({ address: account.address })
    if (!config) throw new Error('Expected current multisig config.')
    expect(config.version).toMatchInlineSnapshot(`1n`)
    const currentAccount = Account.fromMultisig({
      address: account.address,
      ...config,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: currentAccount,
    })

    const pending = await client.accessKey.signAuthorization({
      accessKey,
      account: currentAccount,
      owner: owner_1,
    })
    expect(pending.status).toMatchInlineSnapshot(`"pending"`)
    expect(pending.multisig.config.version).toMatchInlineSnapshot(`1n`)

    const success = await client.accessKey.signAuthorization({
      hash: pending.hash,
      owner: owner_2,
    })
    expect(success.status).toMatchInlineSnapshot(`"success"`)
    expect(success.multisig.config.version).toMatchInlineSnapshot(`1n`)

    const { receipt } = await Actions.token.transferSync(client, {
      account: accessKey,
      amount: 1n,
      keyAuthorization: success,
      to: tempo.accounts[20].address,
      token: tempo.feeToken,
    })
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    expect(receipt.from).toBe(account.address.toLowerCase())

    await expect(
      sendTransactionSync(client, {
        account: accessKey,
        calls: [
          Actions.multisig.updateConfig.call({
            currentConfig: config,
            nextConfig: {
              owners: config.owners,
              threshold: config.threshold,
            },
          }),
        ],
      }),
    ).rejects.toThrowError(/Execution reverted/)
  })

  test('behavior: coordinates weighted access key authorization approvals', async () => {
    const [heavy, light_1, light_2] = [
      tempo.accounts[6],
      tempo.accounts[7],
      tempo.accounts[8],
    ].sort((a, b) => a.address.localeCompare(b.address))
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [
        { owner: heavy, weight: 2 },
        { owner: light_1, weight: 1 },
        { owner: light_2, weight: 1 },
      ],
      salt: toHex(0x106141, { size: 32 }),
      threshold: 3,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const pending = await client.accessKey.signAuthorization({
      accessKey,
      account: account,
      owner: heavy,
    })
    expect(pending.status).toMatchInlineSnapshot(`"pending"`)
    expect(pending.multisig.weight).toMatchInlineSnapshot(`2`)

    const success = await client.accessKey.signAuthorization({
      hash: pending.hash,
      owner: light_1,
    })
    expect(success.status).toMatchInlineSnapshot(`"success"`)
    expect(success.multisig.signatureCount).toMatchInlineSnapshot(`2`)
    expect(success.multisig.weight).toMatchInlineSnapshot(`3`)

    const { receipt } = await Actions.token.transferSync(client, {
      account: accessKey,
      amount: 1n,
      keyAuthorization: success,
      to: tempo.accounts[20].address,
      token: tempo.feeToken,
    })
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  })

  test('behavior: coordinates nested access key authorization approvals', async () => {
    const childOwner = tempo.accounts[9]
    const parentOwner = tempo.accounts[10]
    const child = Account.fromMultisig({
      address: 'infer',
      owners: [childOwner],
      salt: toHex(0x106142, { size: 32 }),
    })
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [child, parentOwner.address],
      salt: toHex(0x106143, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const pending = await client.accessKey.signAuthorization({
      accessKey,
      account: account,
      owner: child,
    })
    expect(pending.status).toMatchInlineSnapshot(`"pending"`)
    expect(pending.multisig.weight).toMatchInlineSnapshot(`1`)

    const success = await client.accessKey.signAuthorization({
      hash: pending.hash,
      owner: parentOwner,
    })
    expect(success.status).toMatchInlineSnapshot(`"success"`)
    expect(success.signature.type).toMatchInlineSnapshot(`"multisig"`)
    if (success.signature.type !== 'multisig') throw new Error('unreachable')
    expect(
      success.signature.signatures.map((signature) => signature.type).sort(),
    ).toMatchInlineSnapshot(`
      [
        "multisig",
        "secp256k1",
      ]
    `)

    const { receipt } = await Actions.token.transferSync(client, {
      account: accessKey,
      amount: 1n,
      keyAuthorization: success,
      to: tempo.accounts[20].address,
      token: tempo.feeToken,
    })
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  })

  test('behavior: coordinates mixed-key access key authorization approvals', async () => {
    const owners = [
      Account.fromSecp256k1(generatePrivateKey()),
      Account.fromP256(P256.randomPrivateKey()),
      Account.fromHeadlessWebAuthn(P256.randomPrivateKey(), {
        origin: 'https://example.com',
        rpId: 'example.com',
      }),
    ]
    const account = Account.fromMultisig({
      address: 'infer',
      owners,
      salt: toHex(0x106144, { size: 32 }),
      threshold: owners.length,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const pending = await client.accessKey.signAuthorization({
      accessKey,
      account: account,
      owner: owners[0],
    })
    const pending_2 = await client.accessKey.signAuthorization({
      hash: pending.hash,
      owner: owners[1],
    })
    expect(pending_2.status).toMatchInlineSnapshot(`"pending"`)
    const success = await client.accessKey.signAuthorization({
      hash: pending.hash,
      owner: owners[2],
    })
    expect(success.status).toMatchInlineSnapshot(`"success"`)
    if (success.signature.type !== 'multisig') throw new Error('unreachable')
    expect(
      success.signature.signatures.map((signature) => signature.type).sort(),
    ).toMatchInlineSnapshot(`
      [
        "p256",
        "secp256k1",
        "webAuthn",
      ]
    `)

    const { receipt } = await Actions.token.transferSync(client, {
      account: accessKey,
      amount: 1n,
      keyAuthorization: success,
      to: tempo.accounts[20].address,
      token: tempo.feeToken,
    })
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  })

  test('behavior: accepts multiple access key approvals in one request', async () => {
    const owner_1 = tempo.accounts[11]
    const owner_2 = tempo.accounts[12]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1, owner_2],
      salt: toHex(0x106145, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const authorization = await Actions.accessKey.signAuthorization(client, {
      accessKey,
      account,
    })
    const operation = MultisigOperation.fromRpc(
      (await client.request({
        method: 'multisig_approveKeyAuthorization',
        params: [{ keyAuthorization: KeyAuthorization.toRpc(authorization) }],
      } as never)) as MultisigOperation.KeyAuthorizationRpc,
    )
    expect(operation.status).toMatchInlineSnapshot(`"success"`)
    expect(operation.signatureCount).toMatchInlineSnapshot(`2`)
    const keyAuthorization_ = KeyAuthorization.deserialize(
      operation.keyAuthorization,
    )
    if (!keyAuthorization_.signature)
      throw new Error('Expected signed key authorization.')
    const keyAuthorization = keyAuthorization_ as KeyAuthorization.Signed

    const { receipt } = await Actions.token.transferSync(client, {
      account: accessKey,
      amount: 1n,
      keyAuthorization,
      to: tempo.accounts[20].address,
      token: tempo.feeToken,
    })
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  })

  test('behavior: invalidates a version-0 authorization after a config update', async () => {
    const owner_1 = tempo.accounts[13]
    const owner_2 = tempo.accounts[14]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1, owner_2],
      salt: toHex(0x106146, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const authorization = await client.accessKey.signAuthorization({
      accessKey,
      account: account,
      owner: owner_1,
    })
    expect(authorization.status).toMatchInlineSnapshot(`"pending"`)

    const { receipt: updatePending } = await Actions.multisig.updateConfigSync(
      client,
      {
        account: account,
        nextConfig: {
          owners: account.config.owners,
          threshold: account.config.threshold,
        },
        owner: owner_1,
      },
    )
    const updateSuccess = await sendTransactionSync(client, {
      account,
      hash: updatePending.transactionHash,
      owner: owner_2,
    })
    assertSuccess(updateSuccess)

    await expect(
      client.accessKey.signAuthorization({
        hash: authorization.hash,
        owner: owner_2,
      }),
    ).rejects.toThrowError(/Multisig config does not match account/)
    expect(
      (await client.multisig.getOperation({ hash: authorization.hash }))
        ?.status,
    ).toMatchInlineSnapshot(`"pending"`)
  })

  test('behavior: coordinates concurrent authorization quorum approvals', async () => {
    const owner_1 = tempo.accounts[15]
    const owner_2 = tempo.accounts[16]
    const owner_3 = tempo.accounts[17]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1, owner_2, owner_3],
      salt: toHex(0x106147, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const pending = await client.accessKey.signAuthorization({
      accessKey,
      account: account,
      owner: owner_1,
    })
    const [success_1, success_2] = await Promise.all([
      client.accessKey.signAuthorization({
        hash: pending.hash,
        owner: owner_2,
      }),
      client.accessKey.signAuthorization({
        hash: pending.hash,
        owner: owner_3,
      }),
    ])
    expect(success_1.multisig).toStrictEqual(success_2.multisig)
    expect(success_1.status).toMatchInlineSnapshot(`"success"`)
    expect(success_1.multisig.signatureCount).toMatchInlineSnapshot(`2`)

    const { receipt } = await Actions.token.transferSync(client, {
      account: accessKey,
      amount: 1n,
      keyAuthorization: success_1,
      to: tempo.accounts[20].address,
      token: tempo.feeToken,
    })
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  })

  test('behavior: rejects invalid authorization approvals', async () => {
    const owner_1 = tempo.accounts[18]
    const owner_2 = tempo.accounts[19]
    const outsider = tempo.accounts[20]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1, owner_2],
      salt: toHex(0x106148, { size: 32 }),
      threshold: 2,
    })
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })

    const pending = await client.accessKey.signAuthorization({
      accessKey,
      account: account,
      owner: owner_1,
    })
    await expect(
      client.accessKey.signAuthorization({
        hash: pending.hash,
        owner: outsider,
      }),
    ).rejects.toThrowError(/signature is from non-owner/)

    const signature = SignatureEnvelope.serialize(
      SignatureEnvelope.from(
        await owner_2.sign({ hash: toHex(1, { size: 32 }) }),
      ),
    )
    await expect(
      client.request({
        method: 'multisig_approveKeyAuthorization',
        params: [{ hash: pending.hash, signature }],
      } as never),
    ).rejects.toThrowError(/signature is from non-owner/)

    const authorization = await Actions.accessKey.signAuthorization(client, {
      accessKey,
      account,
    })
    await expect(
      client.request({
        method: 'multisig_approveKeyAuthorization',
        params: [
          {
            keyAuthorization: {
              ...KeyAuthorization.toRpc(authorization),
              account: outsider.address,
            },
          },
        ],
      } as never),
    ).rejects.toThrowError(
      /Multisig key authorization account does not match its signature/,
    )
  })

  test('behavior: upgrades a 1-of-1 account to a passkey-compatible 1-of-2 account', async () => {
    const owner = tempo.accounts[18]
    const passkeyOwner = Account.fromP256(P256.randomPrivateKey())
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner],
      salt: toHex(0x106135, { size: 32 }),
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })
    await Actions.token.transferSync(client, {
      account,
      amount: 1n,
      to: tempo.accounts[20].address,
      token: tempo.feeToken,
    })
    const { receipt } = await Actions.multisig.updateConfigSync(client, {
      account,
      currentConfig: account.config,
      nextConfig: {
        owners: [
          { owner: owner.address, weight: 1 },
          { owner: passkeyOwner.address, weight: 1 },
        ],
        threshold: 1,
      },
    })

    expect(receipt.status).toBe('success')
    expect(
      await Actions.multisig.getConfigCommitment(client, {
        account: account.address,
      }),
    ).toBe(
      MultisigConfig.getCommitment(
        MultisigConfig.from({
          owners: [
            { owner: owner.address, weight: 1 },
            { owner: passkeyOwner.address, weight: 1 },
          ],
          salt: account.config.salt,
          threshold: 1,
          version: 1,
        }),
      ),
    )
  })

  test('behavior: broadcasts multiple approvals from one submission', async () => {
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [tempo.accounts[3], tempo.accounts[4]],
      salt: toHex(0x106121, { size: 32 }),
      threshold: 2,
    })
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
    const { receipt } = await Actions.token.transferSync(client, {
      account,
      amount: 3n,
      to: recipient,
      token: tempo.feeToken,
    })
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
        "account": "0x2011a76f7366d2caf28d774bdb87a1166ba2e4c9",
        "config": {
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
          "version": 0n,
        },
        "signatures": Any<Array>,
        "type": "multisig",
      }
    `,
    )
  })

  test('behavior: serializes identical transactions when approvals cross quorum concurrently', async () => {
    const owner_1 = tempo.accounts[5]
    const owner_2 = tempo.accounts[6]
    const owner_3 = tempo.accounts[7]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1, owner_2, owner_3],
      salt: toHex(0x10612f, { size: 32 }),
      threshold: 2,
    })
    const store = Store.memory()
    let collect = false
    const broadcast = withResolvers<void>()
    const release = withResolvers<void>()
    const baseTransport = tempo.http()
    const transport: Transport = (options) => {
      const value = baseTransport(options)
      return {
        ...value,
        request: async (request) => {
          if (collect && request.method === 'eth_sendRawTransactionSync') {
            broadcast.resolve()
            await release.promise
          }
          return await value.request(request as never)
        },
      }
    }
    const client = createClient({
      chain: tempoLocalnet,
      experimental_multisig: { store },
      tokens: tempo.tokens,
      transport,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })
    const pending = await sendTransactionSync(client, {
      account: account,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      owner: owner_1,
    })
    expect(pending.status).toBe('pending')

    collect = true
    const submission_1 = sendTransactionSync(client, {
      account,
      hash: pending.transactionHash,
      owner: owner_2,
      timeout: 60_000,
    })
    await broadcast.promise
    const submitting = (
      await getTransaction(client, { hash: pending.transactionHash })
    ).multisig
    expect(submitting?.status).toMatchInlineSnapshot(`"submitting"`)
    if (submitting?.status !== 'submitting') throw new Error('unreachable')
    if (!submitting.submissionId) throw new Error('Expected submission ID.')
    expect(submitting.expiresAt).toBeGreaterThan(Date.now() + 60_000)

    const submission_2 = sendTransactionSync(client, {
      account,
      hash: pending.transactionHash,
      owner: owner_3,
    })
    await new Promise((resolve) => setTimeout(resolve, 100))

    release.resolve()
    const [receipt_1, receipt_2] = await Promise.all([
      submission_1,
      submission_2,
    ])
    expect(receipt_1.status).toMatchInlineSnapshot(`"success"`)
    expect(receipt_2).toStrictEqual(receipt_1)
    const operation = (
      await getTransaction(client, { hash: pending.transactionHash })
    ).multisig
    expect(operation?.status).toMatchInlineSnapshot(`"success"`)
    await expect(
      store.getItem(
        `multisig:submission:${pending.transactionHash}:${submitting.submissionId}`,
      ),
    ).resolves.toMatchInlineSnapshot(`null`)
  })

  test('behavior: removes an expired submission before retrying', async () => {
    const owner_1 = tempo.accounts[14]
    const owner_2 = tempo.accounts[15]
    const account = Account.fromMultisig({
      owners: [owner_1, owner_2],
      salt: toHex(0x10613d, { size: 32 }),
      threshold: 2,
    })
    const store = Store.memory()
    const client = createClient({
      chain: tempoLocalnet,
      experimental_multisig: { store },
      tokens: tempo.tokens,
      transport: tempo.http(),
    })
    const submissionId = `0x${'cc'.repeat(32)}` as const

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })
    const pending = await sendTransactionSync(client, {
      account,
      calls: [{ data: '0xdeadbeef', to: tempo.accounts[20].address }],
      owner: owner_1,
    })
    const operation = await OperationStore.read(store, pending.transactionHash)
    if (operation?.type !== 'transaction' || operation.status !== 'pending')
      throw new Error('Expected pending transaction operation.')
    const approvals = await MultisigOperation.selectApprovals({
      account: operation.account,
      approvals: [
        ...operation.approvals,
        SignatureEnvelope.serialize(
          SignatureEnvelope.from(await owner_2.sign({ hash: operation.hash })),
        ),
      ],
      config: operation.config,
      hash: operation.hash,
    })
    const submitting = MultisigOperation.from({
      ...operation,
      approvals: approvals.approvals,
      expiresAt: 0,
      signatureCount: approvals.signatureCount,
      status: 'submitting',
      submissionId,
      updatedAt: Date.now(),
      weight: approvals.weight,
    })
    await OperationStore.writeSubmission(
      store,
      operation.hash,
      submissionId,
      MultisigOperation.serializeTransaction(submitting, {
        approvals: approvals.selectedApprovals,
      }),
    )
    await OperationStore.update(store, operation.hash, (current) => {
      if (current?.type !== 'transaction')
        throw new Error('Expected transaction operation.')
      return submitting
    })
    const submissionKey = `multisig:submission:${operation.hash}:${submissionId}`
    expect(await store.getItem(submissionKey)).toBeTypeOf('string')

    const receipt = await sendTransactionSync(client, {
      account,
      hash: operation.hash,
      owner: owner_2,
    })

    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    await expect(store.getItem(submissionKey)).resolves.toMatchInlineSnapshot(
      `null`,
    )
  })

  test('behavior: reconciles a successful broadcast after a transport error', async () => {
    const owner_1 = tempo.accounts[5]
    const owner_2 = tempo.accounts[6]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1, owner_2],
      salt: toHex(0x106134, { size: 32 }),
      threshold: 2,
    })
    const controller = new AbortController()
    const store = Store.memory()
    let abortResponse = false
    const baseTransport = tempo.http()
    const transport: Transport = (options) => {
      const value = baseTransport(options)
      return {
        ...value,
        request: async (request, requestOptions) => {
          if (
            abortResponse &&
            request.method === 'eth_sendRawTransactionSync'
          ) {
            if (!Array.isArray(request.params) || request.params[1] !== 5_000)
              throw new Error('Expected forwarded synchronous timeout.')
            abortResponse = false
            await value.request(request as never, requestOptions)
            controller.abort()
            throw controller.signal.reason
          }
          return await value.request(request as never, requestOptions)
        },
      }
    }
    const client = createClient({
      chain: tempoLocalnet,
      experimental_multisig: { store },
      tokens: tempo.tokens,
      transport,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })
    const pending = await sendTransactionSync(client, {
      account: account,
      calls: [{ data: '0xdeadbeef', to: tempo.accounts[20].address }],
      owner: owner_1,
    })
    abortResponse = true
    const receipt = await sendTransactionSync(client, {
      account,
      hash: pending.transactionHash,
      owner: owner_2,
      timeout: 5_000,
    })
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)

    const stored = (
      await getTransaction(client, { hash: pending.transactionHash })
    ).multisig
    expect(stored?.status).toMatchInlineSnapshot(`"success"`)
  })

  test('behavior: ignores cleanup errors after a successful submission', async () => {
    const owner_1 = tempo.accounts[10]
    const owner_2 = tempo.accounts[11]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1.address, owner_2.address],
      salt: toHex(0x10613b, { size: 32 }),
      threshold: 2,
    })
    const backing = Store.memory()
    const store: Store.Atomic = {
      compareAndSet(key, expected, value, options) {
        return backing.compareAndSet(key, expected, value, options)
      },
      getItem(key) {
        return backing.getItem(key)
      },
      removeItem() {
        throw new Error('Cleanup failed.')
      },
      setItem(key, value) {
        return backing.setItem(key, value)
      },
    }
    const broadcast = withResolvers<void>()
    const release = withResolvers<void>()
    let hold = false
    const baseTransport = tempo.http()
    const transport: Transport = (options) => {
      const value = baseTransport(options)
      return {
        ...value,
        request: async (request, requestOptions) => {
          if (hold && request.method === 'eth_sendRawTransactionSync') {
            hold = false
            const result = await value.request(request as never, requestOptions)
            broadcast.resolve()
            await release.promise
            return result as never
          }
          return await value.request(request as never, requestOptions)
        },
      }
    }
    const client = createClient({
      chain: tempoLocalnet,
      experimental_multisig: { store },
      tokens: tempo.tokens,
      transport,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })
    const pending = await sendTransactionSync(client, {
      account: account,
      calls: [{ data: '0xdeadbeef', to: tempo.accounts[20].address }],
      owner: owner_1,
    })
    expect(pending.status).toMatchInlineSnapshot(`"pending"`)

    hold = true
    const submission = sendTransactionSync(client, {
      account,
      hash: pending.transactionHash,
      owner: owner_2,
    })
    await Promise.race([
      broadcast.promise,
      submission.then(() => {
        throw new Error('Expected blocked submission.')
      }),
    ])
    const transaction = await getTransaction(client, {
      hash: pending.transactionHash,
    })
    expect(transaction.multisig?.status).toMatchInlineSnapshot(`"success"`)

    release.resolve()
    const receipt = await submission
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  })

  test('behavior: does not settle a replaced submission', async () => {
    const owner_1 = tempo.accounts[12]
    const owner_2 = tempo.accounts[13]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1.address, owner_2.address],
      salt: toHex(0x10613c, { size: 32 }),
      threshold: 2,
    })
    const store = Store.memory()
    const replacementId = `0x${'bb'.repeat(32)}` as const
    const broadcast = withResolvers<void>()
    const release = withResolvers<void>()
    let hold = false
    let operationHash: `0x${string}` | undefined
    let replaceSubmission = false
    const baseTransport = tempo.http()
    const transport: Transport = (options) => {
      const value = baseTransport(options)
      return {
        ...value,
        request: async (request, requestOptions) => {
          if (hold && request.method === 'eth_sendRawTransactionSync') {
            hold = false
            const result = await value.request(request as never, requestOptions)
            broadcast.resolve()
            await release.promise
            return result as never
          }
          if (
            replaceSubmission &&
            request.method === 'eth_getTransactionByHash'
          ) {
            replaceSubmission = false
            if (!operationHash) throw new Error('Expected operation hash.')
            await OperationStore.update(store, operationHash, (current) => {
              if (
                current?.type !== 'transaction' ||
                current.status !== 'submitting'
              )
                throw new Error('Expected submitting operation.')
              return MultisigOperation.from({
                ...current,
                submissionId: replacementId,
                updatedAt: Date.now(),
              })
            })
          }
          return await value.request(request as never, requestOptions)
        },
      }
    }
    const client = createClient({
      chain: tempoLocalnet,
      experimental_multisig: { store },
      tokens: tempo.tokens,
      transport,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })
    const pending = await sendTransactionSync(client, {
      account: account,
      calls: [{ data: '0xdeadbeef', to: tempo.accounts[20].address }],
      owner: owner_1,
    })
    expect(pending.status).toMatchInlineSnapshot(`"pending"`)
    operationHash = pending.transactionHash

    hold = true
    const submission = sendTransactionSync(client, {
      account,
      hash: pending.transactionHash,
      owner: owner_2,
    })
    await Promise.race([
      broadcast.promise,
      submission.then(() => {
        throw new Error('Expected blocked submission.')
      }),
    ])
    const submitting = await OperationStore.read(store, operationHash)
    if (
      submitting?.type !== 'transaction' ||
      submitting.status !== 'submitting'
    )
      throw new Error('Expected submitting operation.')

    replaceSubmission = true
    await expect(
      getTransaction(client, { hash: operationHash }),
    ).rejects.toThrowError(OperationStore.InvalidStoreValueError)
    const replaced = await OperationStore.read(store, operationHash)
    if (replaced?.type !== 'transaction' || replaced.status !== 'submitting')
      throw new Error('Expected submitting operation.')
    expect(replaced.submissionId).toMatchInlineSnapshot(`"${replacementId}"`)

    await OperationStore.update(store, operationHash, (current) => {
      if (current?.type !== 'transaction' || current.status !== 'submitting')
        throw new Error('Expected submitting operation.')
      return MultisigOperation.from({
        ...current,
        submissionId: submitting.submissionId,
        updatedAt: Date.now(),
      })
    })
    release.resolve()
    const receipt = await submission
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  })

  test('behavior: retries the same transaction after submission fails', async () => {
    const owner_1 = tempo.accounts[8]
    const owner_2 = tempo.accounts[9]
    const account = Account.fromMultisig({
      address: 'infer',
      owners: [owner_1, owner_2],
      salt: toHex(0x106130, { size: 32 }),
      threshold: 2,
    })
    const store = Store.memory()
    let fail = false
    const broadcast = withResolvers<void>()
    const release = withResolvers<void>()
    const baseTransport = tempo.http()
    const transport: Transport = (options) => {
      const value = baseTransport(options)
      return {
        ...value,
        request: async (request, requestOptions) => {
          if (fail && request.method === 'eth_sendRawTransactionSync') {
            fail = false
            broadcast.resolve()
            await release.promise
            throw new Error('Submission failed.')
          }
          return await value.request(request as never, requestOptions)
        },
      }
    }
    const client = createClient({
      chain: tempoLocalnet,
      experimental_multisig: { store },
      tokens: tempo.tokens,
      transport,
    })

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })
    const pending = await sendTransactionSync(client, {
      account: account,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      owner: owner_1,
    })
    expect(pending.status).toBe('pending')

    fail = true
    const failed = sendTransactionSync(client, {
      account,
      hash: pending.transactionHash,
      owner: owner_2,
    })
    await broadcast.promise
    const submitting = (
      await getTransaction(client, { hash: pending.transactionHash })
    ).multisig
    expect(submitting?.status).toMatchInlineSnapshot(`"submitting"`)
    if (submitting?.status !== 'submitting' || !submitting.submissionId)
      throw new Error('Expected submitting operation.')
    release.resolve()
    await expect(failed).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [TransactionExecutionError: An error occurred.

      Request Arguments:
        from:  0xf5F1dD2cBaBd4aeC27De3C2CBe7F03C066fF208f

      Details: Submission failed.
      Version: viem@x.y.z]
    `,
    )
    const failedOperation = (
      await getTransaction(client, { hash: pending.transactionHash })
    ).multisig
    expect(failedOperation?.status).toBe('pending')
    expect(failedOperation?.weight).toBe(2)
    await expect(
      store.getItem(
        `multisig:submission:${pending.transactionHash}:${submitting.submissionId}`,
      ),
    ).resolves.toMatchInlineSnapshot(`null`)

    const success = await sendTransactionSync(client, {
      account,
      hash: pending.transactionHash,
      owner: owner_2,
    })
    assertSuccess(success)
    const operation = (
      await getTransaction(client, { hash: pending.transactionHash })
    ).multisig
    expect(operation?.status).toBe('success')
    if (operation?.status !== 'success') throw new Error('unreachable')
    expect(operation.transactionHash).toBe(success.transactionHash)
  })
})

function assertSuccess(
  receipt: Transaction.TransactionReceipt,
): asserts receipt is Transaction.TransactionReceipt<
  bigint,
  number,
  'success'
> {
  if (receipt.status !== 'success') throw new Error('Expected success.')
}

async function getReceipt(
  receipt: Transaction.TransactionReceipt,
): Promise<Transaction.TransactionReceipt> {
  assertSuccess(receipt)
  return receipt
}
