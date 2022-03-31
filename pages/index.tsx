import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'

const Home: NextPage = () => {
  return (
    <div className="">
      <Head>
        <title>NFT challenge</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="text-red-100 font-bold">welcome from nft challenge</h1>
    </div>
  )
}

export default Home
