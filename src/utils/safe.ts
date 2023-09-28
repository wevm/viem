export function safe<errorType, returnType>(fn: () => any) {
  try {
    return [null, fn()] as [null, returnType]
  } catch (err) {
    return [err, undefined] as [errorType, undefined]
  }
}

export async function safeAsync<errorType, returnType>(fn: () => Promise<any>) {
  try {
    return [null, await fn()] as [null, returnType]
  } catch (err) {
    return [err, undefined] as [errorType, undefined]
  }
}
