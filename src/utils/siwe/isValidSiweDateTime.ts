/**
 * EIP-4361 `date-time` (ISO 8601 / RFC 3339 profile used by SIWE).
 *
 * @see https://eips.ethereum.org/EIPS/eip-4361
 */
const siweDateTimeRegex =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/

export function isValidSiweDateTime(value: string): boolean {
  if (!siweDateTimeRegex.test(value)) return false
  return !Number.isNaN(new Date(value).getTime())
}
