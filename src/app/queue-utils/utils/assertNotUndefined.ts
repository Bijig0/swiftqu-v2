export function assertNotUndefined<T>(val: T): asserts val is NonNullable<T> {
  if (val === undefined) {
    throw new Error(`${val} is undefined`)
  }
}
