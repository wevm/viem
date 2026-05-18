export class LruMap<value = unknown> extends Map<string, value> {
  readonly maxSize: number

  constructor(size: number) {
    super()
    this.maxSize = size
  }

  override get(key: string) {
    const value = super.get(key)
    if (!super.has(key)) return value
    super.delete(key)
    super.set(key, value as value)
    return value
  }

  override set(key: string, value: value) {
    if (super.has(key)) super.delete(key)
    super.set(key, value)
    if (this.maxSize && this.size > this.maxSize) {
      const firstKey = super.keys().next().value
      if (firstKey !== undefined) super.delete(firstKey)
    }
    return this
  }
}
