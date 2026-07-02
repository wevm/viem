import * as Abi from 'ox/Abi'

const universalResolverErrors = [
  'error DNSDecodingFailed(bytes dns)',
  'error DNSEncodingFailed(string ens)',
  'error EmptyAddress()',
  'error HttpError(uint16 status, string message)',
  'error InvalidBatchGatewayResponse()',
  'error ResolverError(bytes errorData)',
  'error ResolverNotContract(bytes name, address resolver)',
  'error ResolverNotFound(bytes name)',
  'error ReverseAddressMismatch(string primary, bytes primaryAddress)',
  'error UnsupportedResolverProfile(bytes4 selector)',
] as const

export const universalResolverResolveAbi = /*#__PURE__*/ Abi.from([
  ...universalResolverErrors,
  'function resolveWithGateways(bytes name, bytes data, string[] gateways) view returns (bytes, address)',
])

export const universalResolverReverseAbi = /*#__PURE__*/ Abi.from([
  ...universalResolverErrors,
  'function reverseWithGateways(bytes reverseName, uint256 coinType, string[] gateways) view returns (string resolvedName, address resolver, address reverseResolver)',
])

export const universalResolverFindResolverAbi = /*#__PURE__*/ Abi.from([
  ...universalResolverErrors,
  'function findResolver(bytes) view returns (address, bytes32, uint256)',
])

export const addressResolverAbi = /*#__PURE__*/ Abi.from([
  'function addr(bytes32 name) view returns (address)',
  'function addr(bytes32 name, uint256 coinType) view returns (bytes)',
])

export const textResolverAbi = /*#__PURE__*/ Abi.from([
  'function text(bytes32 name, string key) view returns (string)',
])
