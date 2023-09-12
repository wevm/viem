import whichPmRuns from 'which-pm-runs'

const pm = whichPmRuns()
if (pm?.name !== 'bun')
  throw new Error(
    `\`${pm?.name} install\` is not supported. Please run \`bun install\``,
  )
