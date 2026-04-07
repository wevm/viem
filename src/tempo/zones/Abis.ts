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
    ],
    outputs: [],
  },
  {
    name: 'requestEncryptedWithdrawal',
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
