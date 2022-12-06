import { useMemo, useState } from 'react'
import { local } from 'viem/chains'

import { SuiteItem, getSuite } from '../suite'
import { benchmark } from '../utils/benchmark'

type Result = { name: string; duration: number; err?: Error }
type ResultsMap = {
  [key in SuiteItem['key']]: Result[] | null
}

export default function Index() {
  const [url, setUrl] = useState<string>(local.rpcUrls.default.http)
  const suite = useMemo(() => getSuite({ url }), [url])

  ////////////////////////////////////////////////////////

  const [pendingMap, setPendingMap] = useState<{ [key: string]: boolean }>({})
  const [resultsMap, setResultsMap] = useState<ResultsMap>({} as ResultsMap)
  const [runs, setRuns] = useState('100')

  const clearAll = async () => {
    setResultsMap({} as ResultsMap)
  }

  const run = async (suiteItem: SuiteItem) => {
    setPendingMap({ ...pendingMap, [suiteItem.key]: true })

    let result: Result[] = []
    for (const [name, fn] of Object.entries(suiteItem.fns)) {
      try {
        const duration = await benchmark(fn, { runs: Number(runs) })
        result.push({ name, duration })
      } catch (err) {
        result.push({ name, duration: 0, err: err as Error })
      }
    }
    setResultsMap((resultsMap) => ({ ...resultsMap, [suiteItem.key]: result }))
    setPendingMap({ ...pendingMap, [suiteItem.key]: false })
  }

  const runAll = async () => {
    clearAll()
    for (const suiteItem of suite) {
      await run(suiteItem)
    }
  }

  ////////////////////////////////////////////////////////

  return (
    <div style={{ padding: '0 20px' }}>
      <h1>Benchmark</h1>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        <div>
          <div>RPC URL</div>
          <input
            onChange={(e) => setUrl(e.target.value)}
            value={url}
            style={{ height: 30, width: 300 }}
          />
        </div>
        <div>
          <div># of runs</div>
          <input
            onChange={(e) => setRuns(e.target.value)}
            value={runs}
            style={{ height: 30, width: 100 }}
          />
        </div>
      </div>
      <div style={{ height: 20 }} />
      <table>
        <thead>
          <tr>
            <th></th>
            {Object.keys(suite[0].fns).map((name) => (
              <th key={name} style={{ width: '200px', textAlign: 'right' }}>
                {name}
              </th>
            ))}
            <th>
              <button onClick={() => runAll()}>Run all</button>
            </th>
            <th />
          </tr>
        </thead>
        <tbody>
          {suite.map((suiteItem) => (
            <tr key={suiteItem.key}>
              <td>{suiteItem.title}</td>
              {resultsMap[suiteItem.key] ? (
                <>
                  {resultsMap[suiteItem.key]?.map(({ name, duration }) => (
                    <td key={name} style={{ textAlign: 'right' }}>
                      {duration > 0 ? `${duration.toFixed(2)} ms` : 'error'}
                    </td>
                  ))}
                </>
              ) : (
                <td colSpan={2} />
              )}
              <td style={{ textAlign: 'right' }}>
                <button onClick={() => run(suiteItem)}>Run</button>
              </td>
              <td>{pendingMap[suiteItem.key] && 'loading...'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
