import type { AppProps } from 'next/app'
import '../styles/globals.css'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import DinoAnimation from '../components/DinoAnimation'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Nav />
      <main>
        <Component {...pageProps} />
      </main>
      <Footer />
      <DinoAnimation />
    </>
  )
}
