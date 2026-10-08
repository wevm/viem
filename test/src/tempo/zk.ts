import type { ZkSignature } from 'ox/tempo'

/** A ZK credential that expires in 2100. Its proof is not valid. */
export const credential = {
  addressSeed: `0x${'01'.repeat(32)}`,
  issuedAt: 4_102_444_000,
  issuer: `0x${'02'.repeat(32)}`,
  keyHash: `0x${'03'.repeat(32)}`,
  proof: `0x${'04'.repeat(256)}`,
  publisherId: `0x${'05'.repeat(32)}`,
  scheme: 1,
  validUntil: 4_102_444_540,
} as const satisfies ZkSignature.Credential

/** A ZK credential that expired in 2025. Its proof is not valid. */
export const expiredCredential = {
  ...credential,
  issuedAt: 1_760_000_000,
  validUntil: 1_760_000_540,
} as const satisfies ZkSignature.Credential

// A ZK-authorized transaction captured from a Tempo dev node with TIP-1131 enabled. Its key
// authorization carries a ZK signature over a real proof, and the authorized access key signs
// the transaction itself.

/** The transaction, as `eth_getRawTransactionByHash` returns it. */
export const rawTransaction =
  '0x76f902da820539808447868c00832dc6c0f85ef85c9420c000000000000000000000000000000000000080b844a9059cbb000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000001c0808080809420c000000000000000000000000000000000000080c0f901f6d9820539809422d5d8d66e2f3316c61c5d8b5fd5034ae1935022b901d906f901d501a0b2fdbde0aad8da84287b254c3b0e164af920692de35ca2fd27f6ea150ee143aca01656ea090c49c9b4a8872fc6540d3c210b34ad42859aff31f059c28e999ba45da014d3f177c646a83e556512bc1cd8168982e09509d281dad23664b24d0e89cddba005667e1ce177c0206e082a863a572ba92d755d50a314e680f5036f504395b5bb846ac6aa54846ac6ac70b90100011da325c2ed023f0e86b297a0dd45066bff191e4f180eccf13a1ba6403b3ad218af8bb3e7f90ee19b137aeb4f32d55ece9c9d014d282985b55d25e81c2f5e5a1d0b2a75de6a7ea4ccae1d569d1fe2768aed72536987af797e27e2df68c7ae7e00129977205036d99d6c77f05f6a62b78985204ef4ed32b717a61a369a22a2220daea83c9ac75ef501e02c6083af719ecfb225748e036315c16f3dbbd3d654e70260bc8a78b2d2e39b94f3f56be927d332bef9704e516d9e77af8167303e29a514eae25fe90c9ba78da7b89db2cb4f289db58a1950f9f8f8740a9d609f386d6a1fda77142707ff6d00dc15191c12734271ae57bfe753b49992fa0bab662f7e5db841c605f3e77f5b26c4b45fd0975a734a8b23991319139241a7a32d0869fed342c41410987cad02b45194ae0f4eb5f3da0f6b96253b9ee6199c92b346f413cded371cb85604ada6063f1aade8b2516566a2a7e77d214b7f34f9e2f893f492a448cb9ee8d25f2fbdb7f62db5f2f20a8ff56dd4c8713a1018f18e28733f7b1f1204900cb52e1d0f4388f8d866de17717ef8ecc2d627b1bc7531e01c'

/** The transaction, as `eth_getTransactionByHash` returns it. */
export const transaction = {
  type: '0x76',
  chainId: '0x539',
  feeToken: '0x20c0000000000000000000000000000000000000',
  maxPriorityFeePerGas: '0x0',
  maxFeePerGas: '0x47868c00',
  gas: '0x2dc6c0',
  calls: [
    {
      to: '0x20c0000000000000000000000000000000000000',
      value: '0x0',
      input:
        '0xa9059cbb000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000001',
      data: null,
    },
  ],
  accessList: [],
  nonceKey: '0x0',
  nonce: '0x0',
  feePayerSignature: null,
  validBefore: null,
  validAfter: null,
  keyAuthorization: {
    chainId: '0x539',
    keyType: 'secp256k1',
    keyId: '0x22d5d8d66e2f3316c61c5d8b5fd5034ae1935022',
    expiry: null,
    limits: null,
    allowedCalls: null,
    witness: null,
    isAdmin: false,
    account: null,
    signature: {
      scheme: '0x1',
      publisherId:
        '0xb2fdbde0aad8da84287b254c3b0e164af920692de35ca2fd27f6ea150ee143ac',
      issuer:
        '0x1656ea090c49c9b4a8872fc6540d3c210b34ad42859aff31f059c28e999ba45d',
      keyHash:
        '0x14d3f177c646a83e556512bc1cd8168982e09509d281dad23664b24d0e89cddb',
      addressSeed:
        '0x05667e1ce177c0206e082a863a572ba92d755d50a314e680f5036f504395b5bb',
      issuedAt: '0x6ac6aa54',
      validUntil: '0x6ac6ac70',
      proof:
        '0x011da325c2ed023f0e86b297a0dd45066bff191e4f180eccf13a1ba6403b3ad218af8bb3e7f90ee19b137aeb4f32d55ece9c9d014d282985b55d25e81c2f5e5a1d0b2a75de6a7ea4ccae1d569d1fe2768aed72536987af797e27e2df68c7ae7e00129977205036d99d6c77f05f6a62b78985204ef4ed32b717a61a369a22a2220daea83c9ac75ef501e02c6083af719ecfb225748e036315c16f3dbbd3d654e70260bc8a78b2d2e39b94f3f56be927d332bef9704e516d9e77af8167303e29a514eae25fe90c9ba78da7b89db2cb4f289db58a1950f9f8f8740a9d609f386d6a1fda77142707ff6d00dc15191c12734271ae57bfe753b49992fa0bab662f7e5d',
      accessKeySignature: {
        type: 'secp256k1',
        r: '0xc605f3e77f5b26c4b45fd0975a734a8b23991319139241a7a32d0869fed342c4',
        s: '0x1410987cad02b45194ae0f4eb5f3da0f6b96253b9ee6199c92b346f413cded37',
        yParity: '0x1',
        v: '0x1',
      },
    },
  },
  aaAuthorizationList: [],
  signature: {
    userAddress: '0xada6063f1aade8b2516566a2a7e77d214b7f34f9',
    signature: {
      type: 'secp256k1',
      r: '0xe2f893f492a448cb9ee8d25f2fbdb7f62db5f2f20a8ff56dd4c8713a1018f18e',
      s: '0x28733f7b1f1204900cb52e1d0f4388f8d866de17717ef8ecc2d627b1bc7531e0',
      yParity: '0x1',
      v: '0x1',
    },
    version: 'v2',
    keyId: '0x22d5d8d66e2f3316c61c5d8b5fd5034ae1935022',
  },
  hash: '0x6e27c05af2811da14b5ef8bc07f19e594aa0d748574d1e933501a9e57f7efb1a',
  blockHash:
    '0x0e0d3f176757bebd3b789071003c33a58e54512e28e10e45fe4475ad24e8daf2',
  blockNumber: '0x1e',
  transactionIndex: '0x0',
  from: '0xada6063f1aade8b2516566a2a7e77d214b7f34f9',
  gasPrice: '0x23c34600',
  blockTimestamp: '0x6ac6aa67',
} as const
