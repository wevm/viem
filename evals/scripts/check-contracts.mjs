import * as fs from 'node:fs'
import * as path from 'node:path'

const tasksDir = path.resolve('evals/tasks')
const errors = []
let count = 0

for (const name of fs.readdirSync(tasksDir)) {
  const taskDir = path.join(tasksDir, name)
  const taskFile = path.join(taskDir, 'task.toml')
  if (!fs.existsSync(taskFile)) continue

  count++
  const task = fs.readFileSync(taskFile, 'utf8')
  const contract = task.match(/^contract = "([^"]+)"$/m)?.[1]
  if (!contract) {
    errors.push(`${name}: missing metadata contract`)
    continue
  }

  if (contract === 'migration') {
    if (!name.startsWith('migration-'))
      errors.push(
        `${name}: only migration tasks may use the migration contract`,
      )
    continue
  }

  if (contract !== 'example') {
    errors.push(`${name}: invalid contract ${JSON.stringify(contract)}`)
    continue
  }

  const fixtureFile = path.join(taskDir, 'environment/fixture/src/index.ts')
  if (
    !fs.existsSync(fixtureFile) ||
    fs.readFileSync(fixtureFile, 'utf8').trim() !== '// TODO(agent): implement'
  )
    errors.push(`${name}: feature fixture must contain only the TODO marker`)

  const solutionFile = path.join(taskDir, 'solution/src/index.ts')
  if (!fs.existsSync(solutionFile)) {
    errors.push(`${name}: missing reference solution`)
    continue
  }
  const solution = fs.readFileSync(solutionFile, 'utf8')
  const example = solution.match(
    /^export (?:async )?function example\(([^)]*)\)/m,
  )
  if (!example)
    errors.push(
      `${name}: solution must export a function declaration named example`,
    )
  else if (example[1]?.trim())
    errors.push(`${name}: example must take no parameters`)

  if (solution.match(/^export\b/gm)?.length !== 1)
    errors.push(`${name}: example tasks may only export example`)
  if (
    solution.includes('Client.create(') &&
    !/^const \w*client = Client\.create\(/im.test(solution)
  )
    errors.push(`${name}: solution client must be a module-scope constant`)

  const graderFile = path.join(taskDir, 'tests/EVAL.ts')
  if (!fs.existsSync(graderFile)) {
    errors.push(`${name}: missing grader`)
    continue
  }
  const grader = fs.readFileSync(graderFile, 'utf8')
  const candidateImport = grader.match(
    /import\s*\{([^}]*)\}\s*from\s*['"]\.\.\/src\/index\.ts['"]/,
  )

  if (!candidateImport) {
    errors.push(`${name}: grader must import the candidate module`)
    continue
  }

  const imports = candidateImport[1]
    ?.split(',')
    .map((name) =>
      name
        .trim()
        .split(/\s+as\s+/)
        .at(-1),
    )
    .filter(Boolean)

  if (!imports?.includes('example'))
    errors.push(`${name}: grader must import example`)
  if (imports?.length !== 1 || imports[0] !== 'example')
    errors.push(`${name}: example grader may only import example`)
  if (!grader.includes('expectTypeOf(example).parameters.toEqualTypeOf<[]>()'))
    errors.push(`${name}: grader must assert that example takes no parameters`)
  if (!grader.includes('example()'))
    errors.push(`${name}: grader must call example`)
  if (/^\s*(?:await\s+)?example\(\)\s*;?\s*$/m.test(grader))
    errors.push(`${name}: grader must assert the value returned by example`)
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`checked ${count} eval task contracts`)
