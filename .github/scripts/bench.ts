import { context, getOctokit } from '@actions/github'

type Report = {
  testResults: {
    [name: string]: {
      hz: number
      mean: number
      name: string
      rank: number
      samples: number[]
      totalTime: number
    }[]
  }
}
;(async () => {
  let report
  try {
    report = (
      await import('../../bench/report.json', { assert: { type: 'json' } })
    ).default
  } catch {}

  if (!report) {
    console.log('No modules to bench against.')
    return
  }

  const table = getResultsTable(report as Report)

  const octokit = getOctokit(process.env.GITHUB_TOKEN!)

  const args = {
    body: `## Benchmark Report\n\n${table}`,
    owner: context.repo.owner,
    repo: context.repo.repo,
  }

  if (context.eventName === 'pull_request') {
    const { data: comments } = await octokit.rest.issues.listComments({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
    })
    const comment = comments.find((comment) =>
      comment.body?.includes('Benchmark Report'),
    )
    if (comment) {
      await octokit.rest.issues.updateComment({
        ...args,
        comment_id: comment.id,
      })
    } else {
      await octokit.rest.issues.createComment({
        ...args,
        issue_number: context.issue.number,
      })
    }
  } else {
    await octokit.rest.repos.createCommitComment({
      ...args,
      commit_sha: context.sha,
    })
  }
})()

function getResultsTable(report: Report) {
  let table = ''

  const testResults = Object.entries(report.testResults)
  for (let i = 0; i < testResults.length; i++) {
    const [name, results] = testResults[i]

    table += `| **${name}** | **ops/s** | **Mean (ms)** | **Total Time (ms)** | **# Samples**  | |\n`
    if (i === 0) table += '|:---|:---|:---|:---|:---|:---|\n'

    const maxHz = Math.max(...results.map((r) => r.hz))
    for (const { name, hz, mean, samples, totalTime } of results) {
      let label = ''
      if (results.length > 1) {
        const multiplier = maxHz / hz
        if (multiplier < 1.03) label = '**Winner** 🏆'
        else label = `_**${multiplier.toFixed(2)}x** slower_`
      }
      table += `| ${name} | \`${hz.toFixed(2)}\` | \`${mean.toFixed(
        3,
      )}\` | \`${totalTime.toFixed(3)}\` | ${samples.length} | ${label} |\n`
    }
    table += '| | | | | | |\n'
  }

  return table
}
