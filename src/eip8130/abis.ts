import { parseAbi } from 'abitype'

/**
 * ABI for the EIP-8130 Keystore system contract at `keystoreAddress`.
 */
export const keystoreAbi = parseAbi([
  'struct InitialActor { bytes32 actorId; address authenticator; uint16 scope; bytes policyData; }',
  'struct ActorConfig { address authenticator; uint48 expiry; uint16 scope; }',
  'struct Actor { bytes32 actorId; ActorConfig config; bytes policyData; }',
  'struct AccountChange { uint8 changeType; bytes payload; }',
  'struct SignedAccountChanges { uint8 channel; uint64 sequence; AccountChange[] changes; bytes signature; }',
  'struct ChangeSequences { uint64 multichain; uint32 localEpoch; uint32 localSequence; }',

  // `actorData` is tightly packed: authenticator(20) || expiry(6) || scope(2) ||
  // reserved(4 zero bytes) = 32 bytes, plus manager(20) || commitment(32) when
  // policy is attached (84 bytes total). Policy attachment is decided by payload
  // length (empty vs 52 bytes), not by any scope bit — there is no `policyType`
  // field; the co-located `ActorRecord` stores `config`, then `policyManager`,
  // then `policyCommitment` in consecutive slots.
  'event ActorAuthorized(address indexed account, bytes32 indexed actorId, bytes actorData)',
  'event ActorRevoked(address indexed account, bytes32 indexed actorId)',
  'event AccountCreated(address indexed account, bytes32 userSalt, bytes32 codeHash)',
  'event AccountImported(address indexed account)',
  'event DelegationApplied(address indexed account, address target)',
  'event AccountLocked(address indexed account, uint16 unlockDelay)',
  'event AccountUnlockInitiated(address indexed account, uint40 unlocksAt)',

  'function createAccount(bytes32 userSalt, bytes bytecode, InitialActor[] initialActors) returns (address)',
  'function computeAddress(bytes32 userSalt, bytes bytecode, InitialActor[] initialActors) view returns (address)',
  // Import is authorized by the account's own code, not by a signature: the
  // account itself must call this (`msg.sender`), and its code returns the actor
  // set + `computeImportDigest` from `IKeystoreImport.confirmKeystoreImport()`.
  'function importAccount()',
  'function computeImportDigest(address account, InitialActor[] initialActors) pure returns (bytes32)',
  'function applySignedAccountChanges(address account, SignedAccountChanges s)',
  // Canonical validation of a typed-envelope user signature (`sigType(1) ||
  // authenticator(20) || data`) over an app `hash`. Reverts on failure; returns
  // the verified actor + its scope. Supersedes ERC-1271 for 8130 accounts (an
  // account's `isValidSignature` is built on this + `Scopes.isOperator`).
  'function validateSignature(address account, bytes32 hash, bytes auth) view returns (bytes32 actorId, uint16 scope)',
  'function authenticateActor(address account, bytes32 hash, bytes auth) view returns (bytes32 actorId, uint16 scope)',
  'function getActorConfig(address account, bytes32 actorId) view returns (ActorConfig)',
  'function getActorWithPolicy(address account, bytes32 actorId) view returns (ActorConfig config, address policyManager, bytes32 policyCommitment)',
  'function getPolicyCommitment(address account, bytes32 actorId) view returns (bytes32)',
  'function getPolicyManager(address account, bytes32 actorId) view returns (address)',
  'function getChangeSequences(address account) view returns (ChangeSequences)',
  'function isLocked(address account) view returns (bool)',
  'function getLockStatus(address account) view returns (bool locked, bool hasInitiatedUnlock, uint40 unlocksAt, uint16 unlockDelay)',
])

/**
 * ABI for the canonical EIP-8130 wallet implementation
 * (`BackwardCompatibleERC4337Account`) — the account behind the ERC-1167 proxy.
 * Used for ERC-4337 execution on non-8130 chains. Validation is delegated to the
 * Keystore contract via `authenticateActor`.
 */
export const erc4337AccountAbi = parseAbi([
  'struct Call { address target; uint256 value; bytes data; }',
  'struct PackedUserOperation { address sender; uint256 nonce; bytes initCode; bytes callData; bytes32 accountGasLimits; uint256 preVerificationGas; bytes32 gasFees; bytes paymasterAndData; bytes signature; }',
  'event CallerAuthorized(address indexed caller)',
  'event CallerRevoked(address indexed caller)',
  'function executeBatch(Call[] calls)',
  'function authorizeCaller(address caller)',
  'function revokeCaller(address caller)',
  'function isAuthorizedCaller(address caller) view returns (bool)',
  'function validateUserOp(PackedUserOperation userOp, bytes32 userOpHash, uint256 missingAccountFunds) returns (uint256 validationData)',
  'function isValidSignature(bytes32 hash, bytes signature) view returns (bytes4)',
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
