import { TxEnvelopeTempo } from 'ox/tempo'
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

  test('example: repeatable initial witness', async () => {
    const owner_1 = accounts[1]
    const owner_2 = accounts[2]
    const config = MultisigConfig.from({
      threshold: 2,
      owners: [
        { owner: owner_1.address, weight: 1 },
        { owner: owner_2.address, weight: 1 },
      ],
    })
    const account = Account.fromMultisig({ address: 'initial', ...config })

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
      address: 'initial',
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
      multisig: child,
    })
    assertSuccess(childSuccess)

    const account = Account.fromMultisig({
      address: 'initial',
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
        account: child,
        calls: [{ to, value: 0n }],
        feeToken,
        multisig: account,
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
    const account = Account.fromMultisig({ address: 'initial', ...config })

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
    const account = Account.fromMultisig({ address: 'initial', ...config })

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

  test('example: initial witness and immediate access key use', async () => {
    const owner_1 = accounts[18]
    const owner_2 = accounts[19]
    const account = Account.fromMultisig({
      address: 'initial',
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

  test('example: independent transaction and access key witnesses', async () => {
    const owner_1 = accounts[19]
    const owner_2 = accounts[20]
    const account = Account.fromMultisig({
      address: 'initial',
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
      address: 'initial',
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
      address: 'initial',
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
    const account = Account.fromMultisig({ address: 'initial', ...config })

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
    const account = Account.fromMultisig({ address: 'initial', ...config })

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
      expect(request.multisigWitness?.approvals).toMatchInlineSnapshot(
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
      address: 'initial',
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
      address: 'initial',
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
      address: 'initial',
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

  test('behavior: address requires a config witness', async () => {
    const account = Account.fromMultisig(accounts[0].address)

    await expect(
      sendTransactionSync(client, {
        account: accounts[0],
        calls: [{ to, value: 0n }],
        feeToken,
        multisig: account,
      }),
    ).rejects.toThrow(
      'A multisig config witness is required to prepare a transaction.',
    )
  })

  test('behavior: external owners authorize an access key', async () => {
    const owner_1 = accounts[18]
    const owner_2 = accounts[19]
    const account = Account.fromMultisig({
      address: 'initial',
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

  test('example: repeatable initial witness', async () => {
    const owner_1 = tempo.accounts[1]
    const owner_2 = tempo.accounts[2]
    const account = Account.fromMultisig({
      address: 'initial',
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
      account: owner_1,
      amount: 1n,
      multisig: account,
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
      account: owner_1,
      hash,
    })

    const pendingOperation = (await getTransaction(client, { hash })).multisig
    expect(pendingOperation).toStrictEqual({
      ...pendingResult,
      updatedAt: expect.any(Number),
    })

    const success = await sendTransactionSync(client, {
      account: owner_2,
      hash,
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
        "account": "0x717a5616be548146187031a15fa458b78f2ef75f",
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
      account: owner_1,
      calls: [
        Actions.token.transfer.call(client, {
          amount: 2n,
          to: recipient,
          token: tempo.feeToken,
        }),
      ],
      multisig: account,
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
      account: owner_2,
      hash: secondHash,
    })
    expect(secondSuccess.status).toMatchInlineSnapshot(`"success"`)
    expect(
      (await getTransaction(client, { hash: secondHash })).multisig,
    ).toMatchObject({ hash: secondHash, status: 'success', weight: 2 })
    const replayedReceipt = await sendTransactionSync(client, {
      account: owner_2,
      hash: secondHash,
    })
    expect(replayedReceipt).toMatchObject({
      multisig: { hash: secondHash, status: 'success', weight: 2 },
      status: 'success',
    })
  })

  test('example: nested ownership', async () => {
    const childOwner = tempo.accounts[17]
    const child = Account.fromMultisig({
      address: 'initial',
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
      account: childOwner,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      multisig: child,
    })
    assertSuccess(childSuccess)

    const account = Account.fromMultisig({
      address: 'initial',
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
        account: child,
        calls: [{ to: tempo.accounts[20].address, value: 0n }],
        multisig: account,
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
      address: 'initial',
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
      account: heavy,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      multisig: account,
    })
    expect(initialPending.status).toBe('pending')
    expect(initialPending.multisig?.weight).toBe(2)
    const initialSuccess = await sendTransactionSync(client, {
      hash: initialPending.transactionHash,
      account: light_1,
    })
    assertSuccess(initialSuccess)

    const validPending = await sendTransactionSync(client, {
      account: heavy,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      multisig: account,
    })
    expect(validPending.status).toBe('pending')
    const validSuccess = await sendTransactionSync(client, {
      hash: validPending.transactionHash,
      account: light_2,
    })
    assertSuccess(validSuccess)

    const lightPending_1 = await sendTransactionSync(client, {
      account: light_1,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      multisig: account,
    })
    expect(lightPending_1.status).toBe('pending')
    expect(lightPending_1.multisig?.weight).toBe(1)
    const lightPending_2 = await sendTransactionSync(client, {
      hash: lightPending_1.transactionHash,
      account: light_2,
    })
    expect(lightPending_2.status).toBe('pending')
    expect(lightPending_2.multisig?.weight).toBe(2)
    const success = await sendTransactionSync(client, {
      hash: lightPending_1.transactionHash,
      account: heavy,
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
      address: 'initial',
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
      account: owner_1,
      feePayer: tempo.accounts[0],
      multisig: account,
      to: account.address,
      value: 0n,
    })
    expect(pending.status).toBe('pending')
    const success = await sendTransactionSync(client, {
      hash: pending.transactionHash,
      account: owner_2,
    })

    const receipt = await getReceipt(success)
    expect(receipt.from).toBe(account.address.toLowerCase())
    expect(receipt.feePayer).toBe(tempo.accounts[0].address.toLowerCase())
  })

  test('example: initial witness and immediate access key use', async () => {
    const owner_1 = tempo.accounts[18]
    const owner_2 = tempo.accounts[19]
    const account = Account.fromMultisig({
      address: 'initial',
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

  test('example: independent transaction and access key witnesses', async () => {
    const owner_1 = tempo.accounts[19]
    const owner_2 = tempo.accounts[20]
    const account = Account.fromMultisig({
      address: 'initial',
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
      address: 'initial',
      owners: [owner_1, owner_2],
      salt: toHex(0x10612e, { size: 32 }),
      threshold: 2,
    })
    const initialConfig = account.config

    await Actions.token.transferSync(client, {
      account: tempo.accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: tempo.feeToken,
    })

    const initialPending = await sendTransactionSync(client, {
      account: owner_1,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      multisig: account,
    })
    expect(initialPending.multisig?.config.version).toBe(0n)
    expect(initialPending.status).toBe('pending')
    const initialSuccess = await sendTransactionSync(client, {
      hash: initialPending.transactionHash,
      account: owner_2,
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
        account: owner_1,
        currentConfig: initialConfig,
        multisig: account,
        nextConfig: {
          owners: [
            { owner: owner_3.address, weight: 1 },
            { owner: owner_4.address, weight: 1 },
          ],
          threshold: 2,
        },
      },
    )
    expect(updatePending.multisig?.account).toBe(account.address.toLowerCase())
    expect(updatePending.multisig?.config.version).toBe(0n)
    expect(updatePending.status).toBe('pending')
    const updateSuccess = await sendTransactionSync(client, {
      hash: updatePending.transactionHash,
      account: owner_2,
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

    const pending = await sendTransactionSync(client, {
      account: owner_3,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      multisig: currentAccount,
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
      hash: pending.transactionHash,
      account: owner_4,
    })

    const receipt = await getReceipt(success)
    expect(receipt.from).toBe(currentAccount.address.toLowerCase())
  })

  test('behavior: rejects a JSON-RPC owner account', async () => {
    const owner = tempo.accounts[1]
    const account = Account.fromMultisig({
      address: 'initial',
      owners: [owner.address],
      salt: toHex(0x106139, { size: 32 }),
    })

    await expect(
      sendTransactionSync(client, {
        account: owner.address,
        calls: [{ data: '0xdeadbeef', to: tempo.accounts[20].address }],
        multisig: account,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [TransactionExecutionError: An error occurred.

      Request Arguments:
        from:  0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650

      Details: A local owner account is required to approve a multisig transaction.
      Version: viem@2.55.19]
    `,
    )
  })

  test('behavior: rejects keychain owner approvals', async () => {
    const owner_1 = tempo.accounts[3]
    const owner_2 = tempo.accounts[4]
    const account = Account.fromMultisig({
      address: 'initial',
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
      account: owner_1,
      calls: [{ data: '0xdeadbeef', to: tempo.accounts[20].address }],
      multisig: account,
    })

    await expect(
      sendTransactionSync(client, {
        account: accessKey,
        hash: pending.transactionHash,
      }),
    ).rejects.toThrow('keychain signatures cannot approve a multisig operation')

    const receipt = await sendTransactionSync(client, {
      account: owner_2,
      hash: pending.transactionHash,
    })
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
  })

  test('behavior: 2-of-3 (M-of-N): threshold subset of owners approves', async () => {
    const owner_1 = tempo.accounts[3]
    const owner_2 = tempo.accounts[4]
    const owner_3 = tempo.accounts[5]
    const account = Account.fromMultisig({
      address: 'initial',
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
      account: owner_1,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      multisig: account,
    })
    expect(pending.status).toBe('pending')

    const success = await sendTransactionSync(client, {
      hash: pending.transactionHash,
      account: owner_3,
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
      address: 'initial',
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
        account: owners[0],
        calls: [{ to: tempo.accounts[20].address, value: 0n }],
        multisig: account,
      })
      for (const owner of owners.slice(1, -1)) {
        const operation = await sendTransactionSync(client, {
          hash: pending.transactionHash,
          account: owner,
        })
        expect(operation.status).toBe('pending')
      }
      const success = await sendTransactionSync(client, {
        hash: pending.transactionHash,
        account: owners[3],
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
      address: 'initial',
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
        account: externalOwner,
        calls: [{ to: tempo.accounts[20].address, value: 0n }],
        multisig: account,
      })
      expect(pending.status).toBe('pending')
      const success = await sendTransactionSync(client, {
        hash: pending.transactionHash,
        account: localOwner,
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
      address: 'initial',
      owners: [childOwner],
      salt: toHex(0x106136, { size: 32 }),
    })
    const parent = Account.fromMultisig({
      address: 'initial',
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
      account: childOwner,
      calls: [{ data: '0xdeadbeef', to: tempo.accounts[20].address }],
      multisig: child,
    })
    const pending = await sendTransactionSync(client, {
      account: child,
      calls: [{ data: '0xdeadbeef', to: tempo.accounts[20].address }],
      multisig: parent,
    })
    expect(pending.status).toBe('pending')

    const rotation = await sendTransactionSync(client, {
      account: childOwner,
      calls: [
        Actions.multisig.updateConfig.call({
          currentConfig: child.config,
          nextConfig: {
            owners: child.config.owners,
            threshold: child.config.threshold,
          },
        }),
      ],
      multisig: child,
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
      account: parentOwner,
      hash: pending.transactionHash,
    })
    expect(refreshed).toMatchObject({
      multisig: { signatureCount: 1, status: 'pending', weight: 1 },
      status: 'pending',
    })

    const success = await sendTransactionSync(client, {
      account: currentChild,
      hash: pending.transactionHash,
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
      address: 'initial',
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
        account: owner_1,
        calls: [{ data: '0x01', to: tempo.accounts[20].address }],
        multisig: account,
      }),
      sendTransactionSync(client, {
        account: owner_1,
        calls: [{ data: '0x02', to: tempo.accounts[20].address }],
        multisig: account,
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
        account: owner_2,
        hash: pending_1.transactionHash,
      }),
      sendTransactionSync(client, {
        account: owner_2,
        hash: pending_2.transactionHash,
      }),
    ])
    expect(success_1.status).toBe('success')
    expect(success_2.status).toBe('success')
  })

  test('behavior: submits a complete local multisig envelope', async () => {
    const owner_1 = tempo.accounts[8]
    const owner_2 = tempo.accounts[9]
    const account = Account.fromMultisig({
      address: 'initial',
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

  test('behavior: address requires a config witness', async () => {
    const account = Account.fromMultisig(tempo.accounts[0].address)

    await expect(
      sendTransactionSync(client, {
        account: tempo.accounts[0],
        calls: [{ to: tempo.accounts[20].address, value: 0n }],
        multisig: account,
      }),
    ).rejects.toThrow(
      'A multisig config witness is required to prepare a transaction.',
    )
  })

  test('behavior: external owners authorize an access key', async () => {
    const owner_1 = tempo.accounts[18]
    const owner_2 = tempo.accounts[19]
    const account = Account.fromMultisig({
      address: 'initial',
      owners: [owner_1.address, owner_2.address],
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
    const { receipt } = await Actions.token.transferSync(client, {
      account: accessKey,
      amount: 1n,
      keyAuthorization,
      to: tempo.accounts[20].address,
      token: tempo.feeToken,
    })

    expect(receipt.status).toBe('success')
    expect(receipt.from).toBe(account.address.toLowerCase())
  })

  test('behavior: upgrades a 1-of-1 account to a passkey-compatible 1-of-2 account', async () => {
    const owner = tempo.accounts[18]
    const passkeyOwner = Account.fromP256(P256.randomPrivateKey())
    const account = Account.fromMultisig({
      address: 'initial',
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
      address: 'initial',
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
        "account": "0xd6122b3b15e50339ea1035b7afbb2fa676017bdb",
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
      address: 'initial',
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
      account: owner_1,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      multisig: account,
    })
    expect(pending.status).toBe('pending')

    collect = true
    const submission_1 = sendTransactionSync(client, {
      hash: pending.transactionHash,
      account: owner_2,
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
      hash: pending.transactionHash,
      account: owner_3,
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

  test('behavior: reconciles a successful broadcast after a transport error', async () => {
    const owner_1 = tempo.accounts[5]
    const owner_2 = tempo.accounts[6]
    const account = Account.fromMultisig({
      address: 'initial',
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
      account: owner_1,
      calls: [{ data: '0xdeadbeef', to: tempo.accounts[20].address }],
      multisig: account,
    })
    abortResponse = true
    const receipt = await sendTransactionSync(client, {
      account: owner_2,
      hash: pending.transactionHash,
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
      address: 'initial',
      owners: [owner_1.address, owner_2.address],
      salt: toHex(0x10613b, { size: 32 }),
      threshold: 2,
    })
    const backing = Store.memory()
    const store: Store.Atomic = {
      compareAndSet(key, expected, value) {
        return backing.compareAndSet(key, expected, value)
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
      account: owner_1,
      calls: [{ data: '0xdeadbeef', to: tempo.accounts[20].address }],
      multisig: account,
    })
    expect(pending.status).toMatchInlineSnapshot(`"pending"`)

    hold = true
    const submission = sendTransactionSync(client, {
      account: owner_2,
      hash: pending.transactionHash,
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
      address: 'initial',
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
      account: owner_1,
      calls: [{ data: '0xdeadbeef', to: tempo.accounts[20].address }],
      multisig: account,
    })
    expect(pending.status).toMatchInlineSnapshot(`"pending"`)
    operationHash = pending.transactionHash

    hold = true
    const submission = sendTransactionSync(client, {
      account: owner_2,
      hash: pending.transactionHash,
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
      address: 'initial',
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
      account: owner_1,
      calls: [{ to: tempo.accounts[20].address, value: 0n }],
      multisig: account,
    })
    expect(pending.status).toBe('pending')

    fail = true
    const failed = sendTransactionSync(client, {
      hash: pending.transactionHash,
      account: owner_2,
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
        from:  0x9ac4fDC8e5D72AaADE30F9Ff52D392D60c68A64a

      Details: Submission failed.
      Version: viem@2.55.19]
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
      hash: pending.transactionHash,
      account: owner_2,
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
