export function stringify(value: unknown) {
  return JSON.stringify(value, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value,
  )
}
