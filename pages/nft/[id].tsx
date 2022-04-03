import {useAddress, useDisconnect, useMetamask, useNFTDrop} from "@thirdweb-dev/react";
import {BigNumber} from "ethers";
import {GetServerSideProps} from "next";
import Link from "next/link";
import {useEffect, useState} from "react";
import {sanityClient, urlFor} from "../../sanity";
import {Collection} from "../../typing"
import toast, {Toaster} from "react-hot-toast";

interface Props {
    collection: Collection
}

const NFT_drop_page = ({collection}: Props) => {

    const [claimedSupply, setClaimedSupply] = useState<number>(0);
    const [totalSupply, setTotalSupply] = useState<BigNumber>();
    const [price, setPrice] = useState<string>()
    const nftDrop = useNFTDrop(collection.address)
    const [loading, setLoading] = useState<boolean>(true)

    //auth
    const connectWithMetamask = useMetamask();
    const address = useAddress();
    const disconnect = useDisconnect();





    useEffect(()=>{
        if (!nftDrop) {
            return
        }
        const fetchPrice = async () => {
            const claimConditions = await nftDrop.claimConditions.getAll()
            setPrice(claimConditions?.[0].currencyMetadata.displayValue)


        }
        fetchPrice()
    }, [nftDrop])

    useEffect(() => {

        if (!nftDrop) {
            return
        }
        const fetchNftDropData = async () => {
            setLoading(true)
            const claimed = await nftDrop.getAllClaimed();
            const total = await nftDrop.totalSupply();
            console.log("total", total)
            setClaimedSupply(claimed.length)
            setTotalSupply(total)
            setLoading(false)
        }
        fetchNftDropData()

    }, [nftDrop])

    const mintNft = () => {
            if(!nftDrop || !address) {
                return
            }
            const quantity = 1
            setLoading(true)
            const notification = toast.loading("Minting",{
                style: {
                    background: "white",
                    color: "green",
                    fontWeight: "bolder",
                    fontSize: "17px",
                    padding: "20px"
                }
            })
        nftDrop.claimTo(address, quantity).then(async (tx)=> {
            const receipt = tx[0].receipt
            const claimedTokenId = tx[0].id
            const claimedNFT = await tx[0].data()
            toast("hooowee you succefully minted", {
                duration: 8000,
                style: {
                    background: "green",
                    color: "white",
                    fontWeight: "bolder",
                    fontSize: "17px",
                    padding: "20px"
                }
            })
            console.log("receipt", receipt)
            console.log("claimed token", claimedTokenId)
            console.log("claimed nft", claimedNFT)
        }).catch(err=> {
            console.log(err)
            toast("whoops... something went wrong", {
                style:{
                    background: "red",
                    color: "white",
                    fontWeight: "bolder",
                    fontSize: "17px",
                    padding: "20px"
                }


            })
        })
            .finally(()=>{
                setLoading(false)
                toast.dismiss(notification)
            })
    }


    return (
        <div className="flex h-screen flex-col lg:grid lg:grid-cols-10">
            <Toaster position="bottom-center"/>
            {/* left */}
            <div className=" lg:col-span-4 bg-gradient-to-br from-cyan-800 to-rose-500">
                <div className="flex flex-col items-center justify-center py-2 lg:min-h-screen">
                    <div className="bg-gradient-to-br from-yellow-400 to-purple-600 p-2 rounded-xl">
                        <img className="w-44 rounded-xl object-cover lg:h-96 lg:w-72"
                             src={urlFor(collection.previewImage).url()} alt=""/>
                    </div>
                    <div className="text-center p-5 space-y-2">
                        <h1 className="text-4xl font-bold text-white"> {collection.nftCollectionName}</h1>
                        <h2 className="text-xl text-gray-300">{collection.description}</h2>
                    </div>
                </div>
            </div>

            {/* right  */}
            <div className="flex flex-1 flex-col p-12 lg:col-span-6">

                {/* Header */}
                <header className="flex items-center justify-between">
                    <Link href={'/'}>
                        <h1 className="w-52 cursor-pointer text-xl font-extralight sm:w-80">The <span
                            className="font-extrabold underline decoration-pink-600/50"> Ayoub </span>Nft Market place
                        </h1>
                    </Link>
                    <button onClick={() => (address ? disconnect() : connectWithMetamask())}
                            className="rounded-full bg-rose-400 text-white px-4 py-2 text-xs font-bold lg:px-5 lg:py-3 lg:text-base">{address ? 'Sign out' : 'Sign in'}</button>
                </header>
                <hr className="my-2 border"/>

                {address && (
                    <p className="text-center text-sm text-rose-400">You're logged in with
                        wallet {address.substring(0, 5)}...{address.substring(address.length - 5)}
                    </p>
                )}

                {/* Content */}
                <div
                    className="mt-10 flex flex-1 flex-col items-center space-y-6 text-center lg:space-y-0 lg:justify-center">
                    <img className="w-80 object-cover pb-10 lg:h-40" src={urlFor(collection.mainImage).url()} alt=""/>
                    <h1 className="text-3xl font-bold lg:text-5xl lg:font-extrabold">{collection.title}</h1>
                    {
                        loading ? ( <p className="animate-pulse pt-2 text-xl text-green-500">Loading supply count ....</p> ): (<p className="pt-2 text-xl text-green-500">{claimedSupply}/{totalSupply?.toString()}NFT's
                            claimed</p>

                        )
                    }
                    {
                        loading && (
                            <img className="w-30 h-30 object-contain" src="https://wpamelia.com/wp-content/uploads/2018/11/ezgif-2-6d0b072c3d3f.gif" alt =""/>
                        )
                    }

                </div>

                {/* Mint button */}
                <button onClick={mintNft} disabled={loading || claimedSupply === totalSupply?.toNumber() || !address } className="h-16 w-full bg-red-600 text-white rounded-full disabled:bg-gray-400">

                    {
                        loading ? (
                            <>Loading</>
                        ): (
                            claimedSupply === totalSupply?.toNumber() ? (
                                <>Sold Out</>
                            ): (
                                !address ? (<>Please sign in</>) : (<span className={"font-bold "}>Mint NFT ({price} ETH)</span>)
                            )
                        )
                    }
                </button>

            </div>
        </div>
    )
}

export default NFT_drop_page

export const getServerSideProps: GetServerSideProps = async ({params}) => {

    const query = `*[_type=="collection" && slug.current == $id][0]{
        _id,
        title,
        address,
        description,
        nftCollectionName,
        mainImage {
          asset
        },
        previewImage{
          asset
        },
      creator-> {
           _id,
           name,
           address,
           slug {
            current
           },
         },
        
        slug {
          current
        },
         
        
      }`

    const collection = await sanityClient.fetch(query, {id: params?.id})
    if (!collection) {
        return {
            notFound: true
        }
    }
    return {
        props: {
            collection
        }
    }

}