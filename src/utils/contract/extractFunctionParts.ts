import type { ErrorType } from '../../errors/utils.js'

const paramsRegex = /((function|event)\s)?(.*)(\((.*)\))/

export type ExtractFunctionPartsErrorType = ErrorType

/** @deprecated – use `parseAbiItem` from `abitype`. */
export function extractFunctionParts(def: string) {
  const parts = def.match(paramsRegex)
  const type = parts?.[2] || undefined
  const name = parts?.[3]
  const params = parts?.[5] || undefined
  return { type, name, params }
}

export type ExtractFunctionNameErrorType = ErrorType

/** @deprecated – use `parseAbiItem` from `abitype`. */
export function extractFunctionName(def: string) {
  return extractFunctionParts(def).name
}

export type ExtractFunctionParamsErrorType = ErrorType

/** @deprecated – use `parseAbiItem` from `abitype`. */
export function extractFunctionParams(def: string) {
  const params = extractFunctionParts(def).params
  const splitParams = params?.split(',').map((x) => x.trim().split(' '))
  return splitParams?.map((param) => ({
    type: param[0],
    name: param[1] === 'indexed' ? param[2] : param[1],
    ...(param[1] === 'indexed' ? { indexed: true } : {}),
  }))
}

export type ExtractFunctionTypeErrorType = ErrorType

/** @deprecated – use `parseAbiItem` from `abitype`. */
export function extractFunctionType(def: string) {
  return extractFunctionParts(def).type
}
