export type CheckBaseCostParameters = {
  baseCost: bigint
  value: bigint | Promise<bigint>
}

export async function checkBaseCost(
  parameters: CheckBaseCostParameters,
): Promise<void> {
  if (parameters.baseCost > (await parameters.value)) {
    throw new Error(
      `The base cost of performing the priority operation is higher than the provided value parameter for the transaction: baseCost: ${parameters.baseCost}, provided value: ${parameters.value}!`,
    )
  }
}
