export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        src="https://cdn.usefathom.com/script.js"
        data-site="BYCJMNBD"
        defer
      />
      {children}
    </>
  )
}
