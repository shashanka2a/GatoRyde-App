import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="description" content="GatoRyde - Safe, Shared, Smart rides for students. Connect with fellow students for affordable and eco-friendly rides across campus and beyond." />
        <meta name="keywords" content="rideshare, students, campus, transportation, eco-friendly, affordable" />
        <meta name="author" content="GatoRyde" />
        <meta property="og:title" content="GatoRyde - Ride the Gator Way" />
        <meta property="og:description" content="Safe, Shared, Smart rides for students. Connect with fellow students for affordable and eco-friendly rides." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GatoRyde - Ride the Gator Way" />
        <meta name="twitter:description" content="Safe, Shared, Smart rides for students." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0d9488" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}