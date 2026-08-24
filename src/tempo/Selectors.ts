// Generated with `pnpm gen:tempo-abis`. Do not modify manually.

import type { Abi, ExtractAbiFunctionNames } from 'abitype'
import type { Hex } from '../types/misc.js'
import type * as Abis from './Abis.js'

type FunctionSelectors<abi extends Abi, excluded extends string = never> = {
  readonly [name in Exclude<ExtractAbiFunctionNames<abi>, excluded>]: Hex
}

type OverloadedFunctionSelectors<names extends string> = {
  readonly [name in names]: Record<string, Hex>
}

export const accountKeychain = {
  authorizeAdminKey: '0x9a424307',
  authorizeKey: {
    'authorizeKey(address,uint8,(uint64,bool,(address,uint256,uint64)[],bool,(address,(bytes4,address[])[])[]))':
      '0x980a6025',
    'authorizeKey(address,uint8,(uint64,bool,(address,uint256,uint64)[],bool,(address,(bytes4,address[])[])[]),bytes32)':
      '0xe3c154d2',
    'authorizeKey(address,uint8,uint64,bool,(address,uint256)[])': '0x54063a55',
  },
  burnKeyAuthorizationWitness: '0xcff31c46',
  getAllowedCalls: '0x0163e7ec',
  getKey: '0xbc298553',
  getRemainingLimit: '0x63b4290d',
  getRemainingLimitWithPeriod: '0xa7f72cab',
  getTransactionKey: '0xb07fbc1a',
  isAdminKey: '0x9009a18d',
  isKeyAuthorizationWitnessBurned: '0x8e6c7e11',
  removeAllowedCalls: '0xf3941811',
  revokeKey: '0x5ae7ab32',
  setAllowedCalls: '0xf5456703',
  updateSpendingLimit: '0xcbbb4480',
} as const satisfies FunctionSelectors<
  typeof Abis.accountKeychain,
  'authorizeKey'
> &
  OverloadedFunctionSelectors<'authorizeKey'>

export const addressRegistry = {
  decodeVirtualAddress: '0xb35d6fb9',
  getMaster: '0xd84ab166',
  isImplicitlyApproved: '0xa8da6aa7',
  isVirtualAddress: '0xd501235a',
  registerVirtualMaster: '0x5c559d20',
  resolveRecipient: '0xfbea9d67',
  resolveVirtualAddress: '0xe2fc56ef',
} as const satisfies FunctionSelectors<typeof Abis.addressRegistry>

export const nativeMultisig = {
  deriveAccount: '0xce8e071c',
  getConfig: '0xe48a5f7b',
  isMultisigAccount: '0x9fbf029a',
  updateConfig: '0xe175d479',
} as const satisfies FunctionSelectors<typeof Abis.nativeMultisig>

export const currentCommittee = {
  getCommitteeMembers: '0xb2a275f9',
  setCommitteeMembers: '0x229bdd9c',
} as const satisfies FunctionSelectors<typeof Abis.currentCommittee>

export const nonce = {
  getNonce: '0x89535803',
} as const satisfies FunctionSelectors<typeof Abis.nonce>

export const receivePolicyGuard = {
  balanceOf: '0x78415365',
  burnBlockedReceipt: '0x96c1264c',
  claim: '0xbb1757cf',
} as const satisfies FunctionSelectors<typeof Abis.receivePolicyGuard>

export const signatureVerifier = {
  recover: '0x19045a25',
  verify: '0x1a86b550',
  verifyKeychain: '0x6c0c731e',
  verifyKeychainAdmin: '0x5f6fc5b7',
} as const satisfies FunctionSelectors<typeof Abis.signatureVerifier>

export const stablecoinDex = {
  MAX_PRICE: '0x01c11d96',
  MAX_TICK: '0x6882a888',
  MIN_ORDER_AMOUNT: '0x40bf2aa4',
  MIN_PRICE: '0xad9f20a6',
  MIN_TICK: '0xa1634b14',
  PRICE_SCALE: '0xc33f59d3',
  TICK_SPACING: '0x46ca626b',
  balanceOf: '0xf7888aec',
  bookIndexForKey: '0x61285475',
  bookKeyForIndex: '0x3c047a7a',
  books: '0x0c0dee70',
  cancel: '0x81649d06',
  cancelStaleOrder: '0x928b0e7f',
  createPair: '0x9ccb0744',
  getOrder: '0x117d4128',
  getTickLevel: '0x949bc662',
  nextOrderId: '0x2a58b330',
  pairKey: '0xcd27ca82',
  place: '0x63813125',
  placeFlip: '0x922828f1',
  priceToTick: '0x87b4e352',
  quoteSwapExactAmountIn: '0xe7c98f1a',
  quoteSwapExactAmountOut: '0x1576fa0e',
  setBookIndex: '0xaecbd005',
  storageCredits: '0x4d65338b',
  swapExactAmountIn: '0xf8856c0f',
  swapExactAmountOut: '0xf0122b75',
  tickToPrice: '0x269a311d',
  withdraw: '0x08fab167',
} as const satisfies FunctionSelectors<typeof Abis.stablecoinDex>

export const storageCredits = {
  balanceOf: '0x70a08231',
  budgetOf: '0x7865e71f',
  modeOf: '0x13668995',
  setBudget: '0xffe295c3',
  setMode: '0x21175b4a',
} as const satisfies FunctionSelectors<typeof Abis.storageCredits>

export const feeManager = {
  collectedFees: '0x4c97f766',
  distributeFees: '0xa6c07924',
  setUserToken: '0xe7897444',
  setValidatorToken: '0xb60d2ddb',
  userTokens: '0xed498fa8',
  validatorTokens: '0x6dc54a7a',
} as const satisfies FunctionSelectors<typeof Abis.feeManager>

export const feeAmm = {
  M: '0x693f917e',
  MIN_LIQUIDITY: '0x21b77d63',
  N: '0xc9e525df',
  SCALE: '0xeced5526',
  burn: '0xfa291e53',
  getPool: '0x531aa03e',
  getPoolId: '0x2ef61c21',
  liquidityBalances: '0x4fb5bf7f',
  mint: '0xf1aa8cb8',
  pools: '0xb5217bb4',
  rebalanceSwap: '0x1bd94ac7',
  totalSupply: '0xb524abcf',
} as const satisfies FunctionSelectors<typeof Abis.feeAmm>

export const tip20ChannelReserve = {
  CLOSE_GRACE_PERIOD: '0x956c8327',
  VOUCHER_TYPEHASH: '0x94739e87',
  close: '0x73b57f74',
  computeChannelId: '0x185eeeac',
  domainSeparator: '0xf698da25',
  getChannel: '0xeef95313',
  getChannelState: '0xd18da8b1',
  getChannelStatesBatch: '0xd1f4cda2',
  getVoucherDigest: '0xf3b349e8',
  open: '0xedc53b00',
  requestClose: '0x675402e5',
  settle: '0x97fb5104',
  storageCredits: '0x4d65338b',
  topUp: '0xdc48471e',
  withdraw: '0x41e2c664',
} as const satisfies FunctionSelectors<typeof Abis.tip20ChannelReserve>

export const tip20Factory = {
  createToken: {
    'createToken(string,string,string,address,address,bytes32)': '0x68130445',
    'createToken(string,string,string,address,address,bytes32,string)':
      '0x5323d222',
  },
  getTokenAddress: '0x9ed7cd64',
  isTIP20: '0x35ec42c9',
} as const satisfies FunctionSelectors<
  typeof Abis.tip20Factory,
  'createToken'
> &
  OverloadedFunctionSelectors<'createToken'>

export const tip20 = {
  BURN_BLOCKED_ROLE: '0x32ad9be8',
  DOMAIN_SEPARATOR: '0x3644e515',
  ISSUER_ROLE: '0x82aefa24',
  PAUSE_ROLE: '0x389ed267',
  UNPAUSE_ROLE: '0x309756fb',
  allowance: '0xdd62ed3e',
  approve: '0x095ea7b3',
  balanceOf: '0x70a08231',
  burn: '0x42966c68',
  burnBlocked: '0xec0cf3dc',
  burnWithMemo: '0x38f23b0b',
  changeTransferPolicyId: '0xfd5e9420',
  claimRewards: '0x372500ab',
  completeQuoteTokenUpdate: '0x638bc4a3',
  currency: '0xe5a6b10f',
  decimals: '0x313ce567',
  distributeReward: '0x940a4e45',
  getPendingRewards: '0xf6ed2017',
  getRoleAdmin: '0x248a9ca3',
  globalRewardPerToken: '0x726ce324',
  grantRole: '0x2f2ff15d',
  hasRole: '0xac4ab3fb',
  logoURI: '0x6bb38b28',
  mint: '0x40c10f19',
  mintWithMemo: '0xe44f0b12',
  name: '0x06fdde03',
  nextQuoteToken: '0x7d0819b7',
  nonces: '0x7ecebe00',
  optedInSupply: '0x8ef39dce',
  pause: '0x8456cb59',
  paused: '0x5c975abb',
  permit: '0xd505accf',
  quoteToken: '0x217a4b70',
  renounceRole: '0x8bb9c5bf',
  revokeRole: '0xd547741f',
  setLogoURI: '0xc30ff6df',
  setNextQuoteToken: '0x4593223f',
  setRewardRecipient: '0xe521136f',
  setRoleAdmin: '0x1e4e0091',
  setSupplyCap: '0xb6a3f59a',
  supplyCap: '0x8f770ad0',
  symbol: '0x95d89b41',
  totalSupply: '0x18160ddd',
  transfer: '0xa9059cbb',
  transferFrom: '0x23b872dd',
  transferFromWithMemo: '0x929c2539',
  transferPolicyId: '0x9c4bad29',
  transferWithMemo: '0x95777d59',
  unpause: '0x3f4ba83a',
  userRewardInfo: '0x360b8ed9',
} as const satisfies FunctionSelectors<typeof Abis.tip20>

export const tip403Registry = {
  compoundPolicyData: '0xb6266019',
  createCompoundPolicy: '0x5da414ee',
  createPolicy: '0xca5d55f6',
  createPolicyWithAccounts: '0xa2d3044f',
  isAuthorized: '0x55a1179e',
  isAuthorizedMintRecipient: '0xb389e305',
  isAuthorizedRecipient: '0x6fbc13d6',
  isAuthorizedSender: '0x14abd81d',
  migrateTransferPolicyIds: '0xa783dc99',
  modifyPolicyBlacklist: '0xc62b27d4',
  modifyPolicyWhitelist: '0x71ec67a3',
  policyData: '0x50214329',
  policyExists: '0x330f5637',
  policyIdCounter: '0x3cc32f9c',
  receivePolicy: '0xe111e611',
  setPolicyAdmin: '0x25f7d376',
  setReceivePolicy: '0xdda03d86',
  tokenTransferPolicyId: '0x23143aff',
  validateReceivePolicy: '0xb72b0c59',
} as const satisfies FunctionSelectors<typeof Abis.tip403Registry>

export const validatorConfigV2 = {
  addValidator: '0x6dcf616a',
  deactivateValidator: '0x8f289544',
  getActiveValidators: '0x9de70258',
  getInitializedAtHeight: '0xf926b083',
  getNextNetworkIdentityRotationEpoch: '0x42739f79',
  initializeIfMigrated: '0x2f88bb4f',
  isInitialized: '0x392e53cd',
  migrateValidator: '0xc8e73200',
  owner: '0x8da5cb5b',
  rotateValidator: '0x82f20dbe',
  setFeeRecipient: '0x572e4068',
  setIpAddresses: '0x55f25dc6',
  setNetworkIdentityRotationEpoch: '0xcb8425d2',
  transferOwnership: '0xf2fde38b',
  transferValidatorOwnership: '0x9e38a5f1',
  validatorByAddress: '0x1a6dda94',
  validatorByIndex: '0xecb14a34',
  validatorByPublicKey: '0x1b425d5e',
  validatorCount: '0x0f43a677',
} as const satisfies FunctionSelectors<typeof Abis.validatorConfigV2>

export const validatorConfig = {
  addValidator: '0xffb4822e',
  changeOwner: '0xa6f9dae1',
  changeValidatorStatus: '0xa1b3f4a9',
  changeValidatorStatusByIndex: '0x5aa3d0e1',
  getNextFullDkgCeremony: '0x281a69ec',
  getValidators: '0xb7ab4db5',
  owner: '0x8da5cb5b',
  setNextFullDkgCeremony: '0xc3576d46',
  updateValidator: '0x09970c76',
  validatorCount: '0x0f43a677',
  validators: '0xfa52c7d8',
  validatorsArray: '0x031fadbd',
} as const satisfies FunctionSelectors<typeof Abis.validatorConfig>

export const zoneFactory = {
  createZone: {
    'createZone((address,address,address,address,(bytes32,bytes32,uint64),string))':
      '0x2d45796a',
    'createZone((address,bool,bool,address[],address[],address,address[],uint8,string))':
      '0x89677d9e',
  },
  isZonePortal: '0x01b290d3',
  nextZoneId: '0x266db436',
  owner: '0x8da5cb5b',
  transferOwnership: '0xf2fde38b',
  verifier: '0x2b7ac3f3',
  zones: '0x90b7f6fd',
} as const satisfies FunctionSelectors<typeof Abis.zoneFactory, 'createZone'> &
  OverloadedFunctionSelectors<'createZone'>

export const zonePortal = {
  FIXED_DEPOSIT_GAS: '0xf706cfbf',
  MAX_DEPOSITS_PER_TEMPO_BLOCK: '0x1bf00ca8',
  MAX_GAS_FEE_RATE: '0xf490ca96',
  MAX_TOKENS_ENABLED_PER_TEMPO_BLOCK: '0x3fcf7df4',
  MAX_TOKEN_METADATA_BYTES: '0x996329a2',
  MAX_WITHDRAWAL_GAS_LIMIT: '0x86f47e55',
  abdicate: '0xbf4c5411',
  abdicationEffectiveAt: '0x04a3b098',
  acceptAdmin: '0x0e18b681',
  admin: '0xf851a440',
  areDepositsActive: '0x37f981d8',
  blockHash: '0xf22a195e',
  bouncebackGas: '0xfb2f1206',
  calculateBouncebackFee: '0x83a146b3',
  calculateDepositFee: '0x8976248d',
  claimRefund: '0xbffa55d5',
  currentDepositQueueHash: '0x45c5d2fb',
  deliverWithdrawal: '0x005d97ef',
  deposit: {
    'deposit(address,address,uint128,bytes32,address)': '0x09a0a234',
    'deposit(address,uint128,uint256,(bytes32,uint8,bytes,bytes12,bytes16),address)':
      '0x03dd6f34',
  },
  depositCount: '0x2dfdf0b5',
  depositEncrypted: '0xb01f22e4',
  enableToken: '0xc690908a',
  enabledTokenAt: '0xb02690f2',
  enabledTokenCount: '0xe4717849',
  encryptionKeyAt: '0x9a97784b',
  encryptionKeyAtBlock: '0x39dc015d',
  encryptionKeyCount: '0x4256ce38',
  hasRole: '0x95a8c58d',
  initialize: '0x86829b82',
  isAccessEnforced: '0x71649b6e',
  isEncryptionKeyValid: '0x9ecd4cc0',
  isGatewayOpen: '0x1b32199b',
  isSequencer: '0x6d46e987',
  isTokenEnabled: '0x748538d9',
  lastProcessedDepositNumber: '0xe84abe69',
  lastSyncedTempoBlockNumber: '0xbe2a63ee',
  leader: '0x40eedabb',
  leaderActivationTempoBlock: '0xb83c755f',
  leaderEpoch: '0x3a6b889b',
  maxTempoGasRate: '0x8d8bd5fb',
  messenger: '0x3cb747bf',
  pause: '0x8456cb59',
  pauseDeposits: '0x27c71b50',
  pauseExpiry: '0xf125af6b',
  paused: '0x5c975abb',
  pendingAdmin: '0x26782247',
  processWithdrawals: '0x91aa3f04',
  refunds: '0x857e85f8',
  resume: '0x046f7da2',
  resumeDeposits: '0x00ebfdb4',
  rpcUrl: '0x959f47c3',
  sequencerAt: '0x129c8240',
  sequencerCount: '0x84b71123',
  sequencerEncryptionKey: '0x3488ce0d',
  sequencerSetVersion: '0x83888ecc',
  sequencerThreshold: '0x1950dd11',
  setAccessMode: '0xf6087442',
  setAllowedAccount: '0x90f59598',
  setBouncebackGas: '0xe09eae10',
  setGateway: '0x10cea857',
  setGatewayMode: '0x0f3804b8',
  setLeader: '0x4fdf2ec2',
  setMaxTempoGasRate: '0x78d8599e',
  setPauseGuardian: '0x35577962',
  setRpcUrl: '0x652ef10b',
  setSequencerEncryptionKey: '0xef10b187',
  setSequencerSet: '0x86012b45',
  setZoneGasRate: '0x0e86bbdc',
  submitBatch: '0x78fb159b',
  tokenConfig: '0xfe136c4e',
  tokenEnablementHash: '0xb456c0dd',
  transferAdmin: '0x75829def',
  verifier: '0x2b7ac3f3',
  withdrawalBatchIndex: '0x2c37826e',
  withdrawalQueueHead: '0x94ce88b0',
  withdrawalQueueSlot: '0xcfaabb4d',
  withdrawalQueueTail: '0x8081a8b2',
  zoneGasRate: '0xecf79a4e',
  zoneHeight: '0x430f8b4f',
  zoneId: '0xd179978a',
} as const satisfies FunctionSelectors<typeof Abis.zonePortal, 'deposit'> &
  OverloadedFunctionSelectors<'deposit'>

export const zoneOutbox = {
  AUTHENTICATED_WITHDRAWAL_CIPHERTEXT_LENGTH: '0x43c3cb83',
  MAX_CALLBACK_DATA_SIZE: '0x53a8d739',
  MAX_WITHDRAWAL_GAS_LIMIT: '0x86f47e55',
  REVEAL_TO_KEY_LENGTH: '0x378fa8fa',
  WITHDRAWAL_BASE_GAS: '0xc9b6ca9b',
  calculateWithdrawalFee: '0x7b9c9aa4',
  consumeFallbackRecipient: '0xa3a124c3',
  enqueueDepositBounceBack: '0xe2e3ee5c',
  finalizeWithdrawalBatch: '0xce7025e9',
  getPendingWithdrawals: '0xc37fc8a8',
  lastBatch: '0x48aa4108',
  lastFallbackNonce: '0x3d1c5a93',
  lastFinalizedTimestamp: '0x413e9cde',
  maxWithdrawalsPerBlock: '0x545525f1',
  nextWithdrawalIndex: '0xbba9282e',
  pendingWithdrawalsCount: '0xd93af1d2',
  requestWithdrawal: '0xb3b200aa',
  setMaxWithdrawalsPerBlock: '0xb9d1fd68',
  setTempoGasRate: '0x79fa3289',
  tempoGasRate: '0x34065272',
} as const satisfies FunctionSelectors<typeof Abis.zoneOutbox>

export const zoneMessenger = {
  relayMessage: '0x11da5261',
} as const satisfies FunctionSelectors<typeof Abis.zoneMessenger>

export const zoneVerifier = {
  verify: '0x7106a43e',
} as const satisfies FunctionSelectors<typeof Abis.zoneVerifier>
