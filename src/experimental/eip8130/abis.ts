import { parseAbi } from 'abitype'

/**
 * ABI for the EIP-8130 Account Configuration system contract
 * (`IAccountConfiguration`) at `ACCOUNT_CONFIG_ADDRESS`.
 */
export const accountConfigurationAbi = parseAbi([
  'struct InitialActor { bytes32 actorId; address authenticator; }',
  'struct ActorConfig { address authenticator; uint8 scope; uint48 expiry; uint8 policyType; }',
  'struct ActorChange { uint8 changeType; bytes32 actorId; bytes data; }',
  'struct ChangeSequences { uint64 multichain; uint64 local; }',

  'event ActorAuthorized(address indexed account, bytes32 indexed actorId, ActorConfig config, address policyManager, bytes32 policyCommitment)',
  'event ActorRevoked(address indexed account, bytes32 indexed actorId)',
  'event AccountCreated(address indexed account, bytes32 userSalt, bytes32 codeHash)',
  'event AccountImported(address indexed account)',
  'event DelegationChanged(address indexed account, address target)',
  'event AccountLocked(address indexed account, uint16 unlockDelay)',
  'event AccountUnlockInitiated(address indexed account, uint40 unlocksAt)',

  'function createAccount(bytes32 userSalt, bytes bytecode, InitialActor[] initialActors) returns (address)',
  'function computeAddress(bytes32 userSalt, bytes bytecode, InitialActor[] initialActors) view returns (address)',
  'function importAccount(address account, InitialActor[] initialActors, bytes signature)',
  'function applySignedActorChanges(address account, uint64 chainId, ActorChange[] actorChanges, bytes auth)',
  'function lock(uint16 unlockDelay)',
  'function initiateUnlock()',
  'function verifySignature(address account, bytes32 hash, bytes signature) view returns (bool verified)',
  'function authenticateActor(address account, bytes32 hash, bytes auth) view returns (uint8 scope)',
  'function isActor(address account, bytes32 actorId) view returns (bool)',
  'function getActorConfig(address account, bytes32 actorId) view returns (ActorConfig)',
  'function getPolicy(address account, bytes32 actorId) view returns (address target, bytes32 commitment)',
  'function getChangeSequences(address account) view returns (ChangeSequences)',
  'function isLocked(address account) view returns (bool)',
  'function getLockStatus(address account) view returns (bool locked, bool hasInitiatedUnlock, uint40 unlocksAt, uint16 unlockDelay)',
])

/** ABI for an EIP-8130 authenticator contract (`IAuthenticator`). */
export const authenticatorAbi = parseAbi([
  'function authenticate(bytes32 hash, bytes data) view returns (bytes32 actorId)',
])

/** ABI for the Transaction Context precompile (`ITransactionContext`). */
export const transactionContextAbi = parseAbi([
  'function getTransactionSender() view returns (address)',
  'function getTransactionPayer() view returns (address)',
  'function getTransactionSenderActorId() view returns (bytes32)',
])

/** ABI for the Nonce Manager precompile (`INonceManager`). */
export const nonceManagerAbi = parseAbi([
  'function getNonce(address account, uint256 nonceKey) view returns (uint64)',
])
