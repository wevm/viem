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
    name: 'calculateWithdrawalFee',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'gasLimit', type: 'uint64' }],
    outputs: [{ name: 'fee', type: 'uint128' }],
  },
] as const
