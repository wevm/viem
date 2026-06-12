// Generated with `pnpm gen:abis`. Do not modify manually.

import type { Abi, ExtractAbiFunctionNames } from 'abitype'
import type { Hex } from '../types/misc.js'
import type * as Abis from './Abis.js'

type FunctionSelectors<abi extends Abi, excluded extends string = never> = {
  readonly [name in Exclude<ExtractAbiFunctionNames<abi>, excluded>]: Hex
}

type OverloadedFunctionSelectors<names extends string> = {
  readonly [name in names]: Record<string, Hex>
}

export const tip20ChannelReserve = {
  CLOSE_GRACE_PERIOD: '0x956c8327',
  VOUCHER_TYPEHASH: '0x94739e87',
  open: '0xedc53b00',
  settle: '0x97fb5104',
  topUp: '0xdc48471e',
  close: '0x73b57f74',
  requestClose: '0x675402e5',
  withdraw: '0x41e2c664',
  getChannel: '0xeef95313',
  getChannelState: '0xd18da8b1',
  getChannelStatesBatch: '0xd1f4cda2',
  computeChannelId: '0x185eeeac',
  getVoucherDigest: '0xf3b349e8',
  domainSeparator: '0xf698da25',
} as const satisfies FunctionSelectors<typeof Abis.tip20ChannelReserve>

export const tip20 = {
  name: '0x06fdde03',
  symbol: '0x95d89b41',
  decimals: '0x313ce567',
  totalSupply: '0x18160ddd',
  quoteToken: '0x217a4b70',
  nextQuoteToken: '0x7d0819b7',
  balanceOf: '0x70a08231',
  transfer: '0xa9059cbb',
  approve: '0x095ea7b3',
  allowance: '0xdd62ed3e',
  transferFrom: '0x23b872dd',
  mint: '0x40c10f19',
  burn: '0x42966c68',
  currency: '0xe5a6b10f',
  supplyCap: '0x8f770ad0',
  paused: '0x5c975abb',
  transferPolicyId: '0x9c4bad29',
  logoURI: '0x6bb38b28',
  setLogoURI: '0xc30ff6df',
  burnBlocked: '0xec0cf3dc',
  mintWithMemo: '0xe44f0b12',
  burnWithMemo: '0x38f23b0b',
  transferWithMemo: '0x95777d59',
  transferFromWithMemo: '0x929c2539',
  changeTransferPolicyId: '0xfd5e9420',
  setSupplyCap: '0xb6a3f59a',
  pause: '0x8456cb59',
  unpause: '0x3f4ba83a',
  setNextQuoteToken: '0x4593223f',
  completeQuoteTokenUpdate: '0x638bc4a3',
  PAUSE_ROLE: '0x389ed267',
  UNPAUSE_ROLE: '0x309756fb',
  ISSUER_ROLE: '0x82aefa24',
  BURN_BLOCKED_ROLE: '0x32ad9be8',
  permit: '0xd505accf',
  nonces: '0x7ecebe00',
  DOMAIN_SEPARATOR: '0x3644e515',
  distributeReward: '0x940a4e45',
  setRewardRecipient: '0xe521136f',
  claimRewards: '0x372500ab',
  optedInSupply: '0x8ef39dce',
  globalRewardPerToken: '0x726ce324',
  userRewardInfo: '0x360b8ed9',
  getPendingRewards: '0xf6ed2017',
  hasRole: '0xac4ab3fb',
  getRoleAdmin: '0x248a9ca3',
  grantRole: '0x2f2ff15d',
  revokeRole: '0xd547741f',
  renounceRole: '0x8bb9c5bf',
  setRoleAdmin: '0x1e4e0091',
} as const satisfies FunctionSelectors<typeof Abis.tip20>

export const validatorConfigV2 = {
  getActiveValidators: '0x9de70258',
  getInitializedAtHeight: '0xf926b083',
  owner: '0x8da5cb5b',
  validatorCount: '0x0f43a677',
  validatorByIndex: '0xecb14a34',
  validatorByAddress: '0x1a6dda94',
  validatorByPublicKey: '0x1b425d5e',
  getNextNetworkIdentityRotationEpoch: '0x42739f79',
  isInitialized: '0x392e53cd',
  addValidator: '0x6dcf616a',
  deactivateValidator: '0x8f289544',
  rotateValidator: '0x82f20dbe',
  setFeeRecipient: '0x572e4068',
  setIpAddresses: '0x55f25dc6',
  transferValidatorOwnership: '0x9e38a5f1',
  transferOwnership: '0xf2fde38b',
  setNetworkIdentityRotationEpoch: '0xcb8425d2',
  migrateValidator: '0xc8e73200',
  initializeIfMigrated: '0x2f88bb4f',
} as const satisfies FunctionSelectors<typeof Abis.validatorConfigV2>

export const signatureVerifier = {
  recover: '0x19045a25',
  verify: '0x1a86b550',
  verifyKeychain: '0x6c0c731e',
  verifyKeychainAdmin: '0x5f6fc5b7',
} as const satisfies FunctionSelectors<typeof Abis.signatureVerifier>

export const stablecoinDex = {
  createPair: '0x9ccb0744',
  place: '0x63813125',
  placeFlip: '0x922828f1',
  cancel: '0x81649d06',
  cancelStaleOrder: '0x928b0e7f',
  swapExactAmountIn: '0xf8856c0f',
  swapExactAmountOut: '0xf0122b75',
  quoteSwapExactAmountIn: '0xe7c98f1a',
  quoteSwapExactAmountOut: '0x1576fa0e',
  balanceOf: '0xf7888aec',
  withdraw: '0x08fab167',
  getOrder: '0x117d4128',
  getTickLevel: '0x949bc662',
  pairKey: '0xcd27ca82',
  nextOrderId: '0x2a58b330',
  books: '0x0c0dee70',
  MIN_TICK: '0xa1634b14',
  MAX_TICK: '0x6882a888',
  TICK_SPACING: '0x46ca626b',
  PRICE_SCALE: '0xc33f59d3',
  MIN_ORDER_AMOUNT: '0x40bf2aa4',
  MIN_PRICE: '0xad9f20a6',
  MAX_PRICE: '0x01c11d96',
  tickToPrice: '0x269a311d',
  priceToTick: '0x87b4e352',
} as const satisfies FunctionSelectors<typeof Abis.stablecoinDex>

export const addressRegistry = {
  registerVirtualMaster: '0x5c559d20',
  getMaster: '0xd84ab166',
  resolveRecipient: '0xfbea9d67',
  resolveVirtualAddress: '0xe2fc56ef',
  isVirtualAddress: '0xd501235a',
  decodeVirtualAddress: '0xb35d6fb9',
  isImplicitlyApproved: '0xa8da6aa7',
} as const satisfies FunctionSelectors<typeof Abis.addressRegistry>

export const feeManager = {
  userTokens: '0xed498fa8',
  validatorTokens: '0x6dc54a7a',
  setUserToken: '0xe7897444',
  setValidatorToken: '0xb60d2ddb',
  distributeFees: '0xa6c07924',
  collectedFees: '0x4c97f766',
} as const satisfies FunctionSelectors<typeof Abis.feeManager>

export const feeAmm = {
  M: '0x693f917e',
  N: '0xc9e525df',
  SCALE: '0xeced5526',
  MIN_LIQUIDITY: '0x21b77d63',
  getPoolId: '0x2ef61c21',
  getPool: '0x531aa03e',
  pools: '0xb5217bb4',
  mint: '0xf1aa8cb8',
  burn: '0xfa291e53',
  totalSupply: '0xb524abcf',
  liquidityBalances: '0x4fb5bf7f',
  rebalanceSwap: '0x1bd94ac7',
} as const satisfies FunctionSelectors<typeof Abis.feeAmm>

export const receivePolicyGuard = {
  balanceOf: '0x78415365',
  claim: '0xbb1757cf',
  burnBlockedReceipt: '0x96c1264c',
} as const satisfies FunctionSelectors<typeof Abis.receivePolicyGuard>

export const accountKeychain = {
  authorizeKey: {
    'authorizeKey(address,uint8,uint64,bool,(address,uint256)[])': '0x54063a55',
    'authorizeKey(address,uint8,(uint64,bool,(address,uint256,uint64)[],bool,(address,(bytes4,address[])[])[]))':
      '0x980a6025',
    'authorizeKey(address,uint8,(uint64,bool,(address,uint256,uint64)[],bool,(address,(bytes4,address[])[])[]),bytes32)':
      '0xe3c154d2',
  },
  authorizeAdminKey: '0x9a424307',
  burnKeyAuthorizationWitness: '0xcff31c46',
  revokeKey: '0x5ae7ab32',
  updateSpendingLimit: '0xcbbb4480',
  setAllowedCalls: '0xf5456703',
  removeAllowedCalls: '0xf3941811',
  getKey: '0xbc298553',
  getRemainingLimit: '0x63b4290d',
  getRemainingLimitWithPeriod: '0xa7f72cab',
  getAllowedCalls: '0x0163e7ec',
  isKeyAuthorizationWitnessBurned: '0x8e6c7e11',
  isAdminKey: '0x9009a18d',
  getTransactionKey: '0xb07fbc1a',
} as const satisfies FunctionSelectors<
  typeof Abis.accountKeychain,
  'authorizeKey'
> &
  OverloadedFunctionSelectors<'authorizeKey'>

export const nonce = {
  getNonce: '0x89535803',
} as const satisfies FunctionSelectors<typeof Abis.nonce>

export const tip20Factory = {
  createToken: {
    'createToken(string,string,string,address,address,bytes32)': '0x68130445',
    'createToken(string,string,string,address,address,bytes32,string)':
      '0x5323d222',
  },
  isTIP20: '0x35ec42c9',
  getTokenAddress: '0x9ed7cd64',
} as const satisfies FunctionSelectors<
  typeof Abis.tip20Factory,
  'createToken'
> &
  OverloadedFunctionSelectors<'createToken'>

export const tip403Registry = {
  policyIdCounter: '0x3cc32f9c',
  policyExists: '0x330f5637',
  policyData: '0x50214329',
  isAuthorized: '0x55a1179e',
  isAuthorizedSender: '0x14abd81d',
  isAuthorizedRecipient: '0x6fbc13d6',
  isAuthorizedMintRecipient: '0xb389e305',
  compoundPolicyData: '0xb6266019',
  receivePolicy: '0xe111e611',
  validateReceivePolicy: '0xb72b0c59',
  createPolicy: '0xca5d55f6',
  createPolicyWithAccounts: '0xa2d3044f',
  setPolicyAdmin: '0x25f7d376',
  modifyPolicyWhitelist: '0x71ec67a3',
  modifyPolicyBlacklist: '0xc62b27d4',
  createCompoundPolicy: '0x5da414ee',
  setReceivePolicy: '0xdda03d86',
} as const satisfies FunctionSelectors<typeof Abis.tip403Registry>

export const validatorConfig = {
  getValidators: '0xb7ab4db5',
  addValidator: '0xffb4822e',
  updateValidator: '0x09970c76',
  changeValidatorStatus: '0xa1b3f4a9',
  changeValidatorStatusByIndex: '0x5aa3d0e1',
  owner: '0x8da5cb5b',
  changeOwner: '0xa6f9dae1',
  getNextFullDkgCeremony: '0x281a69ec',
  setNextFullDkgCeremony: '0xc3576d46',
  validatorsArray: '0x031fadbd',
  validators: '0xfa52c7d8',
  validatorCount: '0x0f43a677',
} as const satisfies FunctionSelectors<typeof Abis.validatorConfig>
