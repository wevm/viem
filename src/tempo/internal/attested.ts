/**
 * ABI of the experimental Attested Key Registry precompile (TIP-1161).
 *
 * Source: tempoxyz/tempo@c507923 (`crates/contracts/src/precompiles/attested_key_registry.rs`,
 * branch `exp/attested-signers`), which adds key slots and `maxKeyLifetime` to the TIP-1161 interface.
 *
 * @internal
 */
export const abi = [
  {
    name: 'PolicyCreated',
    type: 'event',
    inputs: [
      { type: 'bytes32', name: 'policyId', indexed: true },
      { type: 'address', name: 'creator', indexed: true },
      { type: 'uint8', name: 'scheme' },
      { type: 'address', name: 'owner' },
      { type: 'address', name: 'guardian' },
      { type: 'uint64', name: 'delay' },
      { type: 'uint64', name: 'maxKeyLifetime' },
    ],
  },
  {
    name: 'MeasurementProposed',
    type: 'event',
    inputs: [
      { type: 'bytes32', name: 'policyId', indexed: true },
      { type: 'bytes32', name: 'measurement', indexed: true },
      { type: 'uint64', name: 'activeAt' },
    ],
  },
  {
    name: 'MeasurementRemoved',
    type: 'event',
    inputs: [
      { type: 'bytes32', name: 'policyId', indexed: true },
      { type: 'bytes32', name: 'measurement', indexed: true },
      { type: 'uint64', name: 'epoch' },
    ],
  },
  {
    name: 'AnchorProposed',
    type: 'event',
    inputs: [
      { type: 'bytes32', name: 'policyId', indexed: true },
      { type: 'bytes32', name: 'anchor', indexed: true },
      { type: 'uint64', name: 'activeAt' },
    ],
  },
  {
    name: 'AnchorRemoved',
    type: 'event',
    inputs: [
      { type: 'bytes32', name: 'policyId', indexed: true },
      { type: 'bytes32', name: 'anchor', indexed: true },
    ],
  },
  {
    name: 'ProposalCancelled',
    type: 'event',
    inputs: [
      { type: 'bytes32', name: 'policyId', indexed: true },
      { type: 'bytes32', name: 'entry', indexed: true },
      { type: 'bool', name: 'isAnchor' },
    ],
  },
  {
    name: 'KeysRevoked',
    type: 'event',
    inputs: [
      { type: 'bytes32', name: 'policyId', indexed: true },
      { type: 'uint64', name: 'epoch' },
    ],
  },
  {
    name: 'PolicyPaused',
    type: 'event',
    inputs: [
      { type: 'bytes32', name: 'policyId', indexed: true },
      { type: 'bool', name: 'paused' },
    ],
  },
  {
    name: 'DelayChanged',
    type: 'event',
    inputs: [
      { type: 'bytes32', name: 'policyId', indexed: true },
      { type: 'uint64', name: 'newDelay' },
      { type: 'uint64', name: 'effectiveAt' },
    ],
  },
  {
    name: 'MaxKeyLifetimeChanged',
    type: 'event',
    inputs: [
      { type: 'bytes32', name: 'policyId', indexed: true },
      { type: 'uint64', name: 'newMaxKeyLifetime' },
      { type: 'uint64', name: 'effectiveAt' },
    ],
  },
  {
    name: 'GuardianChanged',
    type: 'event',
    inputs: [
      { type: 'bytes32', name: 'policyId', indexed: true },
      { type: 'address', name: 'previousGuardian', indexed: true },
      { type: 'address', name: 'newGuardian', indexed: true },
    ],
  },
  {
    name: 'OwnershipTransferred',
    type: 'event',
    inputs: [
      { type: 'bytes32', name: 'policyId', indexed: true },
      { type: 'address', name: 'previousOwner', indexed: true },
      { type: 'address', name: 'newOwner', indexed: true },
    ],
  },
  {
    name: 'KeyRegistered',
    type: 'event',
    inputs: [
      { type: 'bytes32', name: 'policyId', indexed: true },
      { type: 'bytes32', name: 'keyId', indexed: true },
      { type: 'bytes32', name: 'measurement', indexed: true },
      { type: 'uint8', name: 'slot' },
      { type: 'uint64', name: 'validUntil' },
    ],
  },
  { name: 'Unauthorized', type: 'error', inputs: [] },
  { name: 'PolicyExists', type: 'error', inputs: [] },
  { name: 'PolicyNotFound', type: 'error', inputs: [] },
  { name: 'PolicyIsPaused', type: 'error', inputs: [] },
  { name: 'UnknownScheme', type: 'error', inputs: [] },
  { name: 'ZeroAddress', type: 'error', inputs: [] },
  { name: 'DelayTooLong', type: 'error', inputs: [] },
  { name: 'TooManyEntries', type: 'error', inputs: [] },
  { name: 'InvalidAnchor', type: 'error', inputs: [] },
  { name: 'AlreadyListed', type: 'error', inputs: [] },
  { name: 'NotListed', type: 'error', inputs: [] },
  { name: 'NotPending', type: 'error', inputs: [] },
  { name: 'InvalidProgramKey', type: 'error', inputs: [] },
  { name: 'InvalidAttestation', type: 'error', inputs: [] },
  { name: 'AnchorNotActive', type: 'error', inputs: [] },
  { name: 'MeasurementNotActive', type: 'error', inputs: [] },
  { name: 'StaleAttestation', type: 'error', inputs: [] },
  { name: 'InvalidSlot', type: 'error', inputs: [] },
  { name: 'InvalidKeyLifetime', type: 'error', inputs: [] },
  {
    name: 'createPolicy',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'bytes32', name: 'salt' },
      { type: 'uint8', name: 'scheme' },
      { type: 'address', name: 'owner' },
      { type: 'address', name: 'guardian' },
      { type: 'uint64', name: 'delay' },
      { type: 'uint64', name: 'maxKeyLifetime' },
      { type: 'bytes32[]', name: 'measurements' },
      { type: 'bytes32[]', name: 'anchors' },
    ],
    outputs: [{ type: 'bytes32', name: 'policyId' }],
  },
  {
    name: 'computePolicyId',
    type: 'function',
    stateMutability: 'pure',
    inputs: [
      { type: 'address', name: 'creator' },
      { type: 'bytes32', name: 'salt' },
    ],
    outputs: [{ type: 'bytes32' }],
  },
  {
    name: 'proposeMeasurement',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'bytes32', name: 'policyId' },
      { type: 'bytes32', name: 'measurement' },
    ],
    outputs: [],
  },
  {
    name: 'proposeAnchor',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'bytes32', name: 'policyId' },
      { type: 'bytes32', name: 'anchor' },
    ],
    outputs: [],
  },
  {
    name: 'cancelProposal',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'bytes32', name: 'policyId' },
      { type: 'bytes32', name: 'entry' },
      { type: 'bool', name: 'isAnchor' },
    ],
    outputs: [],
  },
  {
    name: 'removeMeasurement',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'bytes32', name: 'policyId' },
      { type: 'bytes32', name: 'measurement' },
    ],
    outputs: [],
  },
  {
    name: 'removeAnchor',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'bytes32', name: 'policyId' },
      { type: 'bytes32', name: 'anchor' },
    ],
    outputs: [],
  },
  {
    name: 'revokeKeys',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ type: 'bytes32', name: 'policyId' }],
    outputs: [],
  },
  {
    name: 'pause',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ type: 'bytes32', name: 'policyId' }],
    outputs: [],
  },
  {
    name: 'unpause',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ type: 'bytes32', name: 'policyId' }],
    outputs: [],
  },
  {
    name: 'setDelay',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'bytes32', name: 'policyId' },
      { type: 'uint64', name: 'newDelay' },
    ],
    outputs: [],
  },
  {
    name: 'setMaxKeyLifetime',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'bytes32', name: 'policyId' },
      { type: 'uint64', name: 'newMaxKeyLifetime' },
    ],
    outputs: [],
  },
  {
    name: 'setGuardian',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'bytes32', name: 'policyId' },
      { type: 'address', name: 'newGuardian' },
    ],
    outputs: [],
  },
  {
    name: 'transferOwnership',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'bytes32', name: 'policyId' },
      { type: 'address', name: 'newOwner' },
    ],
    outputs: [],
  },
  {
    name: 'registerKey',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'bytes32', name: 'policyId' },
      { type: 'uint8', name: 'slot' },
      { type: 'bytes', name: 'document' },
      { type: 'bytes32', name: 'programKeyX' },
      { type: 'bytes32', name: 'programKeyY' },
      { type: 'uint64', name: 'lifetime' },
    ],
    outputs: [{ type: 'uint64', name: 'validUntil' }],
  },
  {
    name: 'policy',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ type: 'bytes32', name: 'policyId' }],
    outputs: [
      { type: 'address', name: 'owner' },
      { type: 'address', name: 'guardian' },
      { type: 'uint8', name: 'scheme' },
      { type: 'bool', name: 'paused' },
      { type: 'uint64', name: 'epoch' },
      { type: 'uint64', name: 'delay' },
      { type: 'uint64', name: 'pendingDelay' },
      { type: 'uint64', name: 'pendingDelayAt' },
      { type: 'uint64', name: 'maxKeyLifetime' },
      { type: 'uint64', name: 'pendingMaxKeyLifetime' },
      { type: 'uint64', name: 'pendingMaxKeyLifetimeAt' },
    ],
  },
  {
    name: 'measurementActiveAt',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { type: 'bytes32', name: 'policyId' },
      { type: 'bytes32', name: 'measurement' },
    ],
    outputs: [{ type: 'uint64' }],
  },
  {
    name: 'anchorActiveAt',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { type: 'bytes32', name: 'policyId' },
      { type: 'bytes32', name: 'anchor' },
    ],
    outputs: [{ type: 'uint64' }],
  },
  {
    name: 'keyValidUntil',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { type: 'bytes32', name: 'policyId' },
      { type: 'bytes32', name: 'programKeyX' },
      { type: 'bytes32', name: 'programKeyY' },
    ],
    outputs: [{ type: 'uint64' }],
  },
] as const
