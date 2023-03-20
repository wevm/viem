import type { TestClientArg } from '../../clients'

export type GetAutomineReturnType = boolean

export async function getAutomine(
  client: TestClientArg,
): Promise<GetAutomineReturnType> {
  return await client.request({
    method: `${client.mode}_getAutomine`,
  })
}
