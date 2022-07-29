import type { NextPage } from 'next'

const Home: NextPage = () => {
  return (
    <div className="container">
      <svg
        width={64}
        height={64}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 462 436"
      >
        <path
          d="M290.669 38.7V.9h171v37.8l-50.4 10.8-147.6 386.1h-53.1L47.669 46.8l-46.8-8.1V.9h236.7v37.8l-69.3 10.8 99 261 89.1-260.1-65.7-11.7Z"
          className="path"
        />
      </svg>
      <style jsx>
        {`
          .container {
            display: flex;
            height: -webkit-fill-available;
            align-items: center;
            justify-content: center;
          }

          .path {
            fill: black;
          }

          @media (prefers-color-scheme: dark) {
            .path {
              fill: white;
            }
          }
        `}
      </style>
    </div>
  )
}

export default Home
