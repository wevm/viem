import { Server } from 'prool/vitest'
import { inject } from 'vitest'

if (!process.env.SKIP_GLOBAL_SETUP) {
  const { anvils, bundlers } = inject('coreServers')
  const errors: unknown[] = []
  for (const contexts of [Object.values(bundlers), Object.values(anvils)]) {
    const results = await Promise.allSettled(
      contexts.map((context) =>
        Server.get(context).reset({ signal: AbortSignal.timeout(30_000) }),
      ),
    )
    errors.push(
      ...results.flatMap((result) =>
        result.status === 'rejected' ? [result.reason] : [],
      ),
    )
  }
  if (errors.length)
    throw new AggregateError(errors, 'Failed to reset core servers.')
}
