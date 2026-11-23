'use client'

import { type ReactNode, useEffect, useState } from 'react'

/** The report `.github/workflows/uphill.yml` publishes every night from `main`. */
const reportUrl = 'https://wevm.github.io/viem/hillclimb/report.json'

/** Uphill's own page for the same run, which also draws each metric's trend. */
const fullReportUrl = 'https://wevm.github.io/viem/hillclimb/'

/** How many rows a list shows before "Show all", as Uphill's HTML report does. */
const rows = 100

type Band = 'average' | 'good' | 'none' | 'poor'
type Kind = 'check' | 'count' | 'size' | 'time'
type Value = boolean | number

type Item = {
  name: string
  note: string | null
  target: Value | null
  value: Value
}

type Metric = {
  better: 'higher' | 'lower'
  default: Value | null
  description: string | null
  item: string | null
  items: readonly Item[]
  kind: Kind
  name: string
  note: string | null
  rollup: string | null
  score: number | null
  target: Value | null
  title: string
  value: number
}

type Category = {
  description: string | null
  error?: { details: string; message: string } | undefined
  metrics?: readonly Metric[] | undefined
  name: string
  rounds?: number | undefined
  score: number | null
  title: string
}

type Opportunity = {
  category: string
  gain: number
  item: string | null
  items: number
  metric: string
  target: Value
  value: Value
}

type Change = {
  after: Value | null
  before: Value | null
  category: string
  change: 'better' | 'gone' | 'looser' | 'new' | 'tighter' | 'worse'
  item: string | null
  metric: string
}

type Report = {
  categories: readonly Category[]
  changes: readonly Change[] | null
  opportunities: readonly Opportunity[]
}

type State =
  | { status: 'error' }
  | { status: 'loading' }
  | { report: Report; status: 'ready'; updated: string | undefined }

const bands = {
  average: {
    shape: 'bg-[#ffa400]',
    stroke: '#ffa400',
    text: 'text-[#c33300] dark:text-[#ffa400]',
    tint: 'bg-[#ffa400]/10',
  },
  good: {
    shape: 'bg-[#0cce6b] rounded-full',
    stroke: '#0cce6b',
    text: 'text-[#008800] dark:text-[#0cce6b]',
    tint: 'bg-[#0cce6b]/10',
  },
  none: {
    shape: 'bg-(--vocs-text-color-muted) rounded-full',
    stroke: 'transparent',
    text: 'text-(--vocs-text-color-muted)',
    tint: 'bg-(--vocs-text-color-muted)/10',
  },
  poor: {
    shape: 'bg-[#ff4e42] [clip-path:polygon(50%_0,100%_100%,0_100%)]',
    stroke: '#ff4e42',
    text: 'text-[#cc0000] dark:text-[#ff4e42]',
    tint: 'bg-[#ff4e42]/10',
  },
} as const satisfies Record<Band, Record<string, string>>

const directions = {
  better: 'good',
  gone: 'none',
  looser: 'average',
  new: 'none',
  tighter: 'good',
  worse: 'poor',
} as const satisfies Record<Change['change'], Band>

/** Orders changes worst first, as Uphill's reports do. */
const ranks = {
  better: 5,
  gone: 3,
  looser: 1,
  new: 2,
  tighter: 4,
  worse: 0,
} as const satisfies Record<Change['change'], number>

const sizes = [
  ['B', 1],
  ['kB', 1e3],
  ['MB', 1e6],
  ['GB', 1e9],
] as const

const times = [
  ['ns', 1],
  ['µs', 1e3],
  ['ms', 1e6],
  ['s', 1e9],
] as const

export function Hillclimb() {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    fetch(reportUrl)
      .then(async (response) => {
        if (!response.ok) throw new Error(`${response.status}`)
        const report = (await response.json()) as Report
        const modified = response.headers.get('last-modified')
        const updated = modified
          ? new Date(modified).toLocaleDateString(undefined, {
              dateStyle: 'medium',
            })
          : undefined
        setState({ report, status: 'ready', updated })
      })
      .catch(() => setState({ status: 'error' }))
  }, [])

  if (state.status === 'loading')
    return <p className={muted}>Loading the latest report…</p>

  if (state.status === 'error')
    return (
      <p className={muted}>
        The report isn't available right now. See{' '}
        <a className={link} href={fullReportUrl}>
          Uphill's report
        </a>{' '}
        instead.
      </p>
    )

  const { report, updated } = state

  return (
    <div className="mt-6 flex flex-col gap-12">
      <p className={muted}>
        {updated ? `Measured on ${updated}. ` : ''}
        <a className={link} href={fullReportUrl}>
          Uphill's report
        </a>{' '}
        shows the same run with each metric's trend.
      </p>

      <Gauges categories={report.categories} />
      <Opportunities report={report} />
      {report.changes && <Changes changes={report.changes} report={report} />}
      {report.categories.map((category) => (
        <CategorySection category={category} key={category.name} />
      ))}
    </div>
  )
}

function Gauges(props: { categories: readonly Category[] }) {
  return (
    <nav aria-label="Categories" className="flex flex-col items-center gap-4">
      <div className="grid w-full grid-cols-4 gap-x-1 gap-y-5 sm:grid-cols-8">
        {props.categories.map((category) => (
          <a
            className="flex min-w-0 flex-col items-center gap-2 text-center no-underline"
            href={`#${category.name}`}
            key={category.name}
          >
            <Gauge failed={!!category.error} score={category.score} />
            <span className="text-[13px] leading-tight font-medium text-(--vocs-text-color-heading)">
              {category.title}
            </span>
          </a>
        ))}
      </div>
      <div className={`flex gap-4 text-[13px] ${muted}`}>
        <Legend band="poor">0–49</Legend>
        <Legend band="average">50–89</Legend>
        <Legend band="good">90–100</Legend>
      </div>
    </nav>
  )
}

function Legend(props: { band: Band; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <Shape band={props.band} />
      {props.children}
    </span>
  )
}

function Opportunities(props: { report: Report }) {
  const { report } = props
  if (report.opportunities.length === 0) return null

  const most = Math.max(...report.opportunities.map((entry) => entry.gain))

  return (
    <section>
      <Heading>Opportunities</Heading>
      <p className={muted}>
        The changes that would raise each category most, in category points.
      </p>
      <ul className={list}>
        {report.opportunities.map((opportunity) => {
          const category = find(report, opportunity.category)
          const metric = category?.metrics?.find(
            (metric) => metric.name === opportunity.metric,
          )
          const kind = metric?.kind ?? 'count'
          return (
            <li
              className={row}
              key={`${opportunity.category}.${opportunity.metric}.${opportunity.item}`}
            >
              <span className="w-10 shrink-0 font-semibold text-[#008800] dark:text-[#0cce6b]">
                +{Math.round(opportunity.gain)}
              </span>
              <span className="hidden h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-(--vocs-text-color-muted)/15 sm:block">
                <span
                  className="block h-full rounded-full bg-[#0cce6b]"
                  style={{ width: `${(opportunity.gain / most) * 100}%` }}
                />
              </span>
              <What
                category={category?.title ?? opportunity.category}
                count={opportunity.items}
                item={opportunity.item}
                title={metric?.title ?? opportunity.metric}
              />
              <span className="shrink-0 tabular-nums">
                {format(kind, opportunity.value)} →{' '}
                {format(kind, opportunity.target)}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Changes(props: { changes: readonly Change[]; report: Report }) {
  const { report } = props
  const [all, setAll] = useState(false)

  const changes = [...props.changes].sort(
    (a, b) => ranks[a.change] - ranks[b.change],
  )
  const counts = new Map<Change['change'], number>()
  for (const change of changes)
    counts.set(change.change, (counts.get(change.change) ?? 0) + 1)

  return (
    <section>
      <Heading>Changes since the baseline</Heading>
      {changes.length === 0 ? (
        <p className={muted}>No changes.</p>
      ) : (
        <>
          <p className={muted}>
            Values that moved since the baselines in{' '}
            <Code>.agents/uphill.yaml</Code>:{' '}
            {[...counts]
              .map(([direction, count]) => `${count} ${direction}`)
              .join(', ')}
            .
          </p>
          <ul className={list}>
            {changes.slice(0, all ? undefined : 10).map((change) => {
              const category = find(report, change.category)
              const metric = category?.metrics?.find(
                (metric) => metric.name === change.metric,
              )
              return (
                <li
                  className={row}
                  key={`${change.category}.${change.metric}.${change.item}`}
                >
                  <Chip band={directions[change.change]}>{change.change}</Chip>
                  <What
                    category={category?.title ?? change.category}
                    count={1}
                    item={change.item}
                    title={metric?.title ?? change.metric}
                  />
                  <span className="shrink-0 tabular-nums">
                    {values(metric?.kind ?? 'count', change)}
                  </span>
                </li>
              )
            })}
          </ul>
          {changes.length > 10 && (
            <More all={all} count={changes.length} onClick={setAll} />
          )}
        </>
      )}
    </section>
  )
}

function CategorySection(props: { category: Category }) {
  const { category } = props
  const metrics = category.metrics ?? []
  const lists = metrics.filter((metric) => metric.items.length > 0)
  const passed = lists.filter((metric) => {
    const judged = metric.items.flatMap((item) => misses(item, metric) ?? [])
    return judged.length > 0 && !judged.includes(true)
  })
  const open = lists.filter((metric) => !passed.includes(metric))

  return (
    <section className="scroll-mt-20" id={category.name}>
      <header className="flex items-center gap-4 border-t border-(--vocs-border-color-primary) pt-8">
        <Gauge failed={!!category.error} score={category.score} size={72} />
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-medium tracking-tight text-(--vocs-text-color-heading)">
            {category.title}
          </h2>
          {category.description && (
            <p className={muted}>
              <Inline text={category.description} />
            </p>
          )}
        </div>
      </header>

      {category.error && (
        <div className="mt-4 flex flex-col gap-2">
          <p className={bands.poor.text}>✗ {category.error.message}</p>
          {category.error.details && (
            <pre className="overflow-x-auto text-xs">
              {category.error.details}
            </pre>
          )}
        </div>
      )}

      {metrics.length > 0 && (
        <>
          <Subheading>Metrics</Subheading>
          {(category.rounds ?? 1) > 1 && (
            <p className={`mb-3 text-sm ${muted}`}>
              Values that vary between runs are the median of {category.rounds}{' '}
              rounds.
            </p>
          )}
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {metrics.map((metric) => (
              <MetricCard key={metric.name} metric={metric} />
            ))}
          </ul>
        </>
      )}

      {lists.length > 0 && (
        <>
          <Subheading>Items</Subheading>
          <ul className={list}>
            {open.map((metric) => (
              <Audit key={metric.name} metric={metric} />
            ))}
          </ul>
          {passed.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer py-2 text-sm font-medium">
                Passed <span className={muted}>({passed.length})</span>
              </summary>
              <ul className={list}>
                {passed.map((metric) => (
                  <Audit key={metric.name} metric={metric} />
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </section>
  )
}

function MetricCard(props: { metric: Metric }) {
  const { metric } = props
  const band = scoreBand(metric.score)
  const check = metric.kind === 'check'
  const count = metric.items.length
  const target = typeof metric.target === 'number' ? metric.target : undefined

  const at = (() => {
    if (check || count === 0) return undefined
    const items = `${count} ${count === 1 ? 'item' : 'items'}`
    if (metric.rollup === 'sum') return <>Sum of {items}</>
    if (metric.item)
      return (
        <>
          {metric.rollup} of {items}, at <Code>{metric.item}</Code>
        </>
      )
    return (
      <>
        {metric.rollup} of {items}
      </>
    )
  })()

  return (
    <li className="flex flex-col gap-1.5 rounded-lg border border-(--vocs-border-color-primary) p-4">
      <div className="flex items-center gap-2 text-sm">
        <Shape band={band} />
        <span className="flex-1 font-medium">{metric.title}</span>
        <span className={`tabular-nums ${bands[band].text}`}>
          {metric.score ?? '–'}
        </span>
      </div>
      <div className={`text-2xl tabular-nums ${bands[band].text}`}>
        {headline(metric)}
      </div>
      {at && <div className={`text-xs ${muted}`}>{at}</div>}
      {check && count > 0 && <Ratio value={metric.value} />}
      {!check && target !== undefined && (
        <Bar
          band={band}
          better={metric.better}
          target={target}
          value={metric.value}
        />
      )}
      {!check && (
        <div className={`text-xs ${muted}`}>
          {metric.target === null
            ? 'No target'
            : `Target ${format(metric.kind, metric.target)}`}
        </div>
      )}
      {metric.note && (
        <p className={`text-xs ${muted}`}>
          <Inline text={metric.note} />
        </p>
      )}
      {metric.description && (
        <p className={`text-xs ${muted}`}>
          <Inline text={metric.description} />
        </p>
      )}
    </li>
  )
}

function Audit(props: { metric: Metric }) {
  const { metric } = props
  const [all, setAll] = useState(false)

  const check = metric.kind === 'check'
  const count = metric.items.length
  const judged = metric.items.flatMap((item) => misses(item, metric) ?? [])
  const missed = judged.filter(Boolean).length

  const summary = (() => {
    if (check)
      return missed === 0 ? `All ${count} pass` : `${missed} of ${count} fail`
    if (judged.length === 0) return `${count} items`
    if (missed === 0) return `All ${count} meet their target`
    return `${missed} of ${count} miss their target`
  })()

  return (
    <li>
      <details>
        <summary className="flex cursor-pointer items-center gap-3 py-3 text-sm">
          <Shape band={scoreBand(metric.score)} />
          <span className="flex-1 font-medium">{metric.title}</span>
          <span className={muted}>{summary}</span>
        </summary>
        <div className="overflow-x-auto pb-3">
          <table className="w-full text-sm">
            <thead>
              <tr className={`text-left text-xs ${muted}`}>
                <th className="py-1.5 pr-3 font-normal">Item</th>
                <th className="py-1.5 pr-3 font-normal">
                  {check ? 'Result' : 'Value'}
                </th>
                {!check && (
                  <>
                    <th className="py-1.5 pr-3 font-normal">Target</th>
                    <th className="w-28 py-1.5 font-normal">
                      <span className="sr-only">Against target</span>
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {metric.items.slice(0, all ? undefined : rows).map((item) => (
                <ItemRow item={item} key={item.name} metric={metric} />
              ))}
            </tbody>
          </table>
          {count > rows && <More all={all} count={count} onClick={setAll} />}
        </div>
      </details>
    </li>
  )
}

function ItemRow(props: { item: Item; metric: Metric }) {
  const { item, metric } = props
  const target = targetOf(item, metric)

  const cells = (() => {
    if (typeof item.value === 'boolean')
      return (
        <td className="py-2 pr-3 align-top">
          <Chip band={item.value ? 'good' : 'poor'}>
            {item.value ? 'pass' : 'fail'}
          </Chip>
        </td>
      )
    const band =
      target === undefined
        ? 'none'
        : valueBand(item.value, target, metric.better)
    return (
      <>
        <td
          className={`py-2 pr-3 align-top whitespace-nowrap tabular-nums ${target === undefined ? '' : bands[band].text}`}
        >
          {format(metric.kind, item.value)}
        </td>
        <td
          className={`py-2 pr-3 align-top whitespace-nowrap tabular-nums ${muted}`}
        >
          {target === undefined ? '' : format(metric.kind, target)}
        </td>
        <td className="py-2 align-top">
          {target !== undefined && (
            <Bar
              band={band}
              better={metric.better}
              target={target}
              value={item.value}
            />
          )}
        </td>
      </>
    )
  })()

  return (
    <tr className="border-t border-(--vocs-border-color-primary)">
      <td className="py-2 pr-3 align-top">
        <Name>{item.name}</Name>
        {item.note && (
          <div className={`mt-0.5 text-xs break-words ${muted}`}>
            <Inline text={item.note} />
          </div>
        )}
      </td>
      {cells}
    </tr>
  )
}

function Gauge(props: {
  failed: boolean
  score: number | null
  size?: number | undefined
}) {
  const { failed, score, size = 64 } = props
  const band = scoreBand(score)
  return (
    <span
      className="relative inline-flex shrink-0"
      style={{ height: size, width: size }}
    >
      <svg
        aria-hidden="true"
        className={`rounded-full ${bands[band].tint}`}
        viewBox="0 0 120 120"
      >
        <circle
          className="stroke-(--vocs-text-color-muted)/15"
          cx="60"
          cy="60"
          fill="none"
          r="52"
          strokeWidth="8"
        />
        {score !== null && (
          <circle
            cx="60"
            cy="60"
            fill="none"
            pathLength={100}
            r="52"
            stroke={bands[band].stroke}
            strokeDasharray={`${score} 100`}
            strokeLinecap="round"
            strokeWidth="8"
            transform="rotate(-90 60 60)"
          />
        )}
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center font-semibold tabular-nums ${bands[band].text}`}
        style={{ fontSize: size * 0.32 }}
      >
        {score ?? (failed ? '✗' : '–')}
      </span>
    </span>
  )
}

/**
 * A value against its target on a bar of the three score bands, as Uphill draws it: where lower
 * is better it runs to three times the target, so the target sits a third along; where higher is
 * better it runs to one and a half times the target, so the target sits two thirds along.
 */
function Bar(props: {
  band: Band
  better: Metric['better']
  target: number
  value: number
}) {
  const { band, better, target, value } = props
  const span = better === 'lower' ? 3 * target : 1.5 * target
  const tick = better === 'lower' ? 100 / 3 : 200 / 3
  const at = Math.min(Math.max(value / span, 0), 1) * 100
  return (
    <div
      aria-hidden="true"
      className="relative my-1.5 h-1.5 rounded-full bg-(--vocs-text-color-muted)/15"
    >
      <span
        className="absolute -top-1 h-3.5 w-px bg-(--vocs-text-color-muted)"
        style={{ left: `${tick}%` }}
      />
      <span
        className="absolute -top-0.5 size-2.5 -translate-x-1/2 rounded-full"
        style={{ background: bands[band].stroke, left: `${at}%` }}
      />
    </div>
  )
}

function Ratio(props: { value: number }) {
  return (
    <div
      aria-hidden="true"
      className="my-1.5 h-1.5 overflow-hidden rounded-full bg-[#ff4e42]/30"
    >
      <span
        className="block h-full bg-[#0cce6b]"
        style={{ width: `${props.value * 100}%` }}
      />
    </div>
  )
}

function Shape(props: { band: Band }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block size-2.5 shrink-0 ${bands[props.band].shape}`}
    />
  )
}

function Chip(props: { band: Band; children: ReactNode }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${bands[props.band].tint} ${bands[props.band].text}`}
    >
      {props.children}
    </span>
  )
}

function More(props: {
  all: boolean
  count: number
  onClick: (all: boolean) => void
}) {
  return (
    <button
      className={`mt-2 cursor-pointer text-sm ${link}`}
      onClick={() => props.onClick(!props.all)}
      type="button"
    >
      {props.all ? 'Show fewer' : `Show all ${props.count}`}
    </button>
  )
}

function Heading(props: { children: ReactNode }) {
  return (
    <h2 className="mb-1 text-xl font-medium tracking-tight text-(--vocs-text-color-heading)">
      {props.children}
    </h2>
  )
}

function Subheading(props: { children: ReactNode }) {
  return (
    <h3 className="mt-6 mb-2 text-base font-medium text-(--vocs-text-color-heading)">
      {props.children}
    </h3>
  )
}

/** A row's category and metric, then its item, or the number of items an opportunity covers. */
function What(props: {
  category: string
  count: number
  item: string | null
  title: string
}) {
  return (
    <span className="flex min-w-0 flex-1 flex-col">
      <span>
        <span className={muted}>{props.category}</span> {props.title}
        {!props.item && props.count > 1 ? `, ${props.count} items` : ''}
      </span>
      {props.item && <Name>{props.item}</Name>}
    </span>
  )
}

/** Inline code in prose, styled as the docs style it. */
function Code(props: { children: ReactNode }) {
  return <code data-v="">{props.children}</code>
}

/** An export or function name, which wraps only where it overflows. */
function Name(props: { children: ReactNode }) {
  return (
    <code className="px-0 text-[13px] [overflow-wrap:anywhere]">
      {props.children}
    </code>
  )
}

/** Renders the `code` spans of Uphill's descriptions and notes. */
function Inline(props: { text: string }) {
  const parts = props.text.split('`')
  if (parts.length % 2 === 0) return <>{props.text}</>
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? <Code key={index}>{part}</Code> : part,
      )}
    </>
  )
}

const muted = 'text-(--vocs-text-color-muted)'
const link = 'text-(--vocs-text-color-link) hover:underline'
const list = 'divide-y divide-(--vocs-border-color-primary)'
const row = 'flex items-center gap-3 py-2.5 text-sm'

function find(report: Report, name: string) {
  return report.categories.find((category) => category.name === name)
}

/** A check's share of passing items, or its result, else the metric's value in its unit. */
function headline(metric: Metric) {
  if (metric.kind !== 'check') return amount(metric.kind, metric.value)
  if (metric.items.length === 0) return metric.value >= 1 ? 'pass' : 'fail'
  const passed = metric.items.filter((item) => item.value === true).length
  return `${passed} of ${metric.items.length} pass`
}

/** Whether an item misses its target, or `undefined` when neither it nor its metric has one. */
function misses(item: Item, metric: Metric) {
  if (typeof item.value === 'boolean') return !item.value
  const target = targetOf(item, metric)
  if (target === undefined) return undefined
  return metric.better === 'lower' ? item.value > target : item.value < target
}

/** The target an item must meet: its own, from its line or a `targets` pattern, or else the metric's default. */
function targetOf(item: Item, metric: Metric) {
  const target = item.target ?? metric.default
  return typeof target === 'number' ? target : undefined
}

function scoreBand(score: number | null): Band {
  if (score === null) return 'none'
  if (score >= 90) return 'good'
  if (score >= 50) return 'average'
  return 'poor'
}

/** The band a value falls in against its target: at the target or better, up to twice as far, or beyond. */
function valueBand(
  value: number,
  target: number,
  better: Metric['better'],
): Band {
  const ratio = (() => {
    if (better === 'lower') return value / target
    if (value <= 0) return Number.POSITIVE_INFINITY
    return target / value
  })()
  if (ratio <= 1) return 'good'
  if (ratio <= 2) return 'average'
  return 'poor'
}

/** Formats a change's values so that two that differ read differently, as Uphill does. */
function values(kind: Kind, change: Change) {
  const target = change.change === 'looser' || change.change === 'tighter'
  const missing = target ? 'none' : ''
  const [before, after] =
    change.before !== null && change.after !== null
      ? pair(kind, change.before, change.after)
      : [
          change.before === null ? missing : format(kind, change.before),
          change.after === null ? missing : format(kind, change.after),
        ]
  if (target) return `target ${before} → ${after}`
  if (change.before !== null && change.after !== null)
    return `${before} → ${after}`
  return change.before !== null ? before : after
}

function pair(kind: Kind, before: Value, after: Value) {
  const shown = [format(kind, before), format(kind, after)] as const
  if (
    typeof before === 'boolean' ||
    typeof after === 'boolean' ||
    shown[0] !== shown[1]
  )
    return shown
  for (let extra = 1; extra <= 3; extra++) {
    const more = [
      amount(kind, before, extra),
      amount(kind, after, extra),
    ] as const
    if (more[0] !== more[1]) return more
  }
  return [base(kind, before), base(kind, after)] as const
}

function format(kind: Kind, value: Value) {
  if (typeof value === 'boolean') return value ? 'pass' : 'fail'
  return amount(kind, value)
}

/** Sizes and times in the largest unit that keeps the number at 1 or more, with one decimal place. */
function amount(kind: Kind, value: number, extra = 0) {
  if (kind === 'size') return scaled(value, sizes, 1 + extra)
  if (kind === 'time') return scaled(value, times, 1 + extra)
  return decimal(value, 2 + extra)
}

function base(kind: Kind, value: number) {
  if (kind === 'size') return `${decimal(value, 3)} B`
  if (kind === 'time') return `${decimal(value, 3)} ns`
  return decimal(value, 6)
}

function scaled(
  value: number,
  units: typeof sizes | typeof times,
  places: number,
) {
  let index = 0
  for (const [i, [, factor]] of units.entries())
    if (Math.abs(value) >= factor) index = i
  // Rounding can carry into the next unit, such as 999.96 kB, which shows as 1 MB.
  const scale = 10 ** places
  const next = units[index + 1]
  if (
    next &&
    Math.round((Math.abs(value) / units[index]![1]) * scale) >= 1000 * scale
  )
    index += 1
  const [unit, factor] = units[index]!
  return `${decimal(value / factor, places)} ${unit}`
}

/** A number with at most `places` decimal places and no trailing zeros. */
function decimal(value: number, places: number) {
  const text = value.toFixed(places)
  if (!text.includes('.')) return text
  const trimmed = text.replace(/0+$/, '').replace(/\.$/, '')
  return trimmed === '-0' ? '0' : trimmed
}
