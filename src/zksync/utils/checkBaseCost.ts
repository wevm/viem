export async function checkBaseCost(
  baseCost: bigint,
  value: bigint | Promise<bigint>,
): Promise<void> {
  if (baseCost > (await value)) {
    throw new Error(
      `The base cost of performing the priority operation is higher than the provided value parameter for the transaction: baseCost: ${baseCost}, provided value: ${value}!`,
    )
  }
}
