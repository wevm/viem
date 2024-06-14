function createIdStore() {
  return {
    current: 0,
    take() {
      return this.current++
    },
    reset() {
      this.current = 0
    },
  }
}

export const idCache = /*#__PURE__*/ createIdStore()
