import { getOctokit, context } from '@actions/github'
;(async () => {
  const octokit = getOctokit(process.env.GITHUB_TOKEN!)

  const args = {
    owner: context.repo.owner,
    repo: context.repo.repo,
  }

  const { data } = await octokit.rest.pulls.get({
    ...args,
    pull_number: context.issue.number,
  })

  let body = ''
  if (data.body && /<!--\ncopilot:summary/.test(data.body)) {
    body = data.body.replace(/<!--\ncopilot:summary.*/s, 'copilot:summary')
  } else {
    body = `${data.body}\n\n---\n\n### Automated Summary\n\ncopilot:summary`
  }

  await octokit.rest.pulls.update({
    ...args,
    body,
    pull_number: context.issue.number,
  })
})()
