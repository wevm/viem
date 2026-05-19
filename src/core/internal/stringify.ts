export const stringify: typeof JSON.stringify = (value, replacer, space) =>
  JSON.stringify(
    value,
    (key, value_) => {
      const value = typeof value_ === 'bigint' ? value_.toString() : value_
      if (typeof replacer === 'function') return replacer(key, value)
      return value
    },
    space,
  )
