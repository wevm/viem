// Generated with `pnpm gen:abis`. Do not modify manually.

import type { Abi, ExtractAbiFunctionNames } from 'abitype'
import type * as Hex from 'ox/Hex'
import type * as Abis from './Abis.js'

type FunctionSelectors<abi extends Abi, excluded extends string = never> = {
  readonly [name in Exclude<ExtractAbiFunctionNames<abi>, excluded>]: Hex.Hex
}

type OverloadedFunctionSelectors<names extends string> = {
  readonly [name in names]: Record<string, Hex.Hex>
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
  swapExactAmountIn: '0xf8856c0f',
  swapExactAmountOut: '0xf0122b75',
  tickToPrice: '0x269a311d',
  withdraw: '0x08fab167',
} as const satisfies FunctionSelectors<typeof Abis.stablecoinDex>

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

export const tip403Registry = {
  compoundPolicyData: '0xb6266019',
  createCompoundPolicy: '0x5da414ee',
  createPolicy: '0xca5d55f6',
  createPolicyWithAccounts: '0xa2d3044f',
  isAuthorized: '0x55a1179e',
  isAuthorizedMintRecipient: '0xb389e305',
  isAuthorizedRecipient: '0x6fbc13d6',
  isAuthorizedSender: '0x14abd81d',
  modifyPolicyBlacklist: '0xc62b27d4',
  modifyPolicyWhitelist: '0x71ec67a3',
  policyData: '0x50214329',
  policyExists: '0x330f5637',
  policyIdCounter: '0x3cc32f9c',
  receivePolicy: '0xe111e611',
  setPolicyAdmin: '0x25f7d376',
  setReceivePolicy: '0xdda03d86',
  validateReceivePolicy: '0xb72b0c59',
} as const satisfies FunctionSelectors<typeof Abis.tip403Registry>

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
