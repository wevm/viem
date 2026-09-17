import { TxEnvelopeTempo } from 'ox/tempo'
import { parseSignature, toHex } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import {
  getTransaction,
  prepareTransactionRequest,
  sendRawTransactionSync,
  sendTransactionSync,
  signTransaction,
} from 'viem/actions'
import {
  Account,
  Actions,
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
      expect(tx.signature.config).toMatchObject({ threshold: 2 })
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
      expect(tx.signature.config).toMatchObject({ threshold: 2 })
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
      expect(request.multisigSimulation?.approvals).toHaveLength(4)
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

  test('behavior: rejects nested multisig owners', () => {
    const child = Account.fromMultisig({ owners: [accounts[1]] })
    expect(() => Account.fromMultisig({ owners: [child] })).toThrow(
      'Multisig owners must use primitive signatures.',
    )
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

  test('behavior: reconstructs an address with an explicit current config', async () => {
    const original = Account.fromMultisig({
      salt: toHex(0x83f3, { size: 32 }),
      owners: [accounts[1]],
    })
    const account = Account.fromMultisig(original.address)
    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })
    const request = await prepareTransactionRequest(client, {
      account,
      multisig: { account: account.address, config: original.config },
      calls: [{ to }],
      feeToken,
    })
    const signature = await signTransaction(client, {
      ...request,
      account: accounts[1],
    })
    const receipt = await sendTransactionSync(client, {
      ...request,
      signatures: [signature],
    })
    expect(receipt.status).toBe('success')
  })

  test('behavior: address requires the current config', async () => {
    const account = Account.fromMultisig(accounts[0].address)

    await expect(
      prepareTransactionRequest(client, {
        account,
        calls: [{ to, value: 0n }],
        feeToken,
      }),
    ).rejects.toThrow(
      'Current multisig config is required. Provide it in the multisig request.',
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
    expect(immediateTransaction.keyAuthorization.signature.config).toBeDefined()
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
    expect(bootstrapResult.signature.config).toBeDefined()
    expect(bootstrapResult.keyAuthorization?.signature.type).toBe('multisig')
    if (bootstrapResult.keyAuthorization?.signature.type !== 'multisig')
      throw new Error('unreachable')
    expect(bootstrapResult.keyAuthorization.signature.config).toBeDefined()

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
    const account = Account.fromMultisig({
      salt: toHex(0x106105, { size: 32 }),
      threshold: 2,
      owners: [accounts[14], accounts[15]],
    })
    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })
    await sendTransactionSync(client, { account, calls: [{ to }], feeToken })
    const nextOwners = [accounts[16], accounts[17]]
    const {
      receipt,
      account: address,
      ...config
    } = await Actions.multisig.updateConfigSync(client, {
      account,
      current: account.config,
      threshold: 2,
      owners: nextOwners.map((owner) => ({ owner: owner.address, weight: 1 })),
      feeToken,
    })
    expect(receipt.status).toBe('success')
    expect(address).toBe(account.address)
    expect(config.version).toBe(1n)
    expect(
      await Actions.multisig.getConfigCommitment(client, { account: address }),
    ).toBe(MultisigConfig.getCommitment(config))
    await expect(
      prepareTransactionRequest(client, { account, calls: [{ to }], feeToken }),
    ).rejects.toThrow('Multisig config does not match the on-chain commitment.')
    const updated = Account.fromMultisig(
      { ...config, owners: nextOwners },
      { address },
    )
    const result = await sendTransactionSync(client, {
      account: updated,
      calls: [{ to }],
      feeToken,
    })
    expect(result.status).toBe('success')
    expect(result.from).toBe(address.toLowerCase())
  })
})
