/** Zone factory contract ABI. */
export const zoneFactory = [
  {
    name: 'ZoneCreated',
    type: 'event',
    inputs: [
      { indexed: true, name: 'zoneId', type: 'uint32' },
      { indexed: true, name: 'portal', type: 'address' },
      { indexed: true, name: 'messenger', type: 'address' },
      { indexed: false, name: 'initialToken', type: 'address' },
      { indexed: false, name: 'admin', type: 'address' },
      { indexed: false, name: 'sequencer', type: 'address' },
      { indexed: false, name: 'verifier', type: 'address' },
      { indexed: false, name: 'genesisBlockHash', type: 'bytes32' },
      { indexed: false, name: 'genesisTempoBlockHash', type: 'bytes32' },
      { indexed: false, name: 'genesisTempoBlockNumber', type: 'uint64' },
    ],
  },
  {
    name: 'createZone',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'initialToken', type: 'address' },
          { name: 'admin', type: 'address' },
          { name: 'sequencer', type: 'address' },
          { name: 'verifier', type: 'address' },
          {
            name: 'zoneParams',
            type: 'tuple',
            components: [
              { name: 'genesisBlockHash', type: 'bytes32' },
              { name: 'genesisTempoBlockHash', type: 'bytes32' },
              { name: 'genesisTempoBlockNumber', type: 'uint64' },
            ],
          },
          { name: 'rpcUrl', type: 'string' },
        ],
      },
    ],
    outputs: [
      { name: 'zoneId', type: 'uint32' },
      { name: 'portal', type: 'address' },
    ],
  },
  {
    name: 'verifier',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
] as const

/** Zone portal contract ABI. */
export const zonePortal = [
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_token', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint128' },
      { name: 'memo', type: 'bytes32' },
      { name: 'bouncebackRecipient', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    name: 'depositEncrypted',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint128' },
      { name: 'keyIndex', type: 'uint256' },
      {
        name: 'encrypted',
        type: 'tuple',
        components: [
          { name: 'ephemeralPubkeyX', type: 'bytes32' },
          { name: 'ephemeralPubkeyYParity', type: 'uint8' },
          { name: 'ciphertext', type: 'bytes' },
          { name: 'nonce', type: 'bytes12' },
          { name: 'tag', type: 'bytes16' },
        ],
      },
      { name: 'bouncebackRecipient', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    name: 'sequencerEncryptionKey',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'x', type: 'bytes32' },
      { name: 'yParity', type: 'uint8' },
    ],
  },
  {
    name: 'encryptionKeyCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

/** Zone outbox contract ABI. */
export const zoneOutbox = [
  {
    name: 'requestWithdrawal',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint128' },
      { name: 'memo', type: 'bytes32' },
      { name: 'gasLimit', type: 'uint64' },
      { name: 'fallbackRecipient', type: 'address' },
      { name: 'data', type: 'bytes' },
      { name: 'revealTo', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    name: 'calculateWithdrawalFee',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'gasLimit', type: 'uint64' }],
    outputs: [{ name: 'fee', type: 'uint128' }],
  },
] as const
