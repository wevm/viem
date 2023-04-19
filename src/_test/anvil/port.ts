import getPort from 'get-port'

// TODO: This is a workaround. Let's figure out if we can fix `vitest` so that it reliably reaps all child processes.
const expectedPort = 8545 + Number(process.env.VITEST_POOL_ID ?? 1)
export const anvilPort = await getPort({
  port: expectedPort,
})

if (expectedPort !== anvilPort) {
  console.warn(
    // rome-ignore lint/style/useTemplate: multiline
    `Couldn't start anvil on port ${expectedPort} and chose ${anvilPort} as a fallback. ` +
      `This likely means that there's a zombie anvil process lingering from a previous run. ` +
      'Consider closing it manually to free up resources. ' +
      `You can use \`lsof -i :${expectedPort}\` to find the process.`,
  )
}
