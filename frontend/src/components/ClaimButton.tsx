import { ethers } from 'ethers'
import Airdrop from 'airdrop-backend'
import { useMetaMask } from 'metamask-react'
import { getLSDrops, lastKCharacters, setLSDrops } from '../common'

const MESSAGE_WHEN_NO_METAMASK = `Enter Aurora address to receive the tokens.

Metamask is not logged in. Enter the address to receive the tokens. Notice that in order to later manipulate the tokens, you should have full control of this address on Aurora Mainnet. We strongly recommend using MetaMask wallet.
`

async function claim(
    secret: string,
    mm: Boolean,
    account: string | null,
    setDrops: any
) {
    const drops = getLSDrops()
    const index = drops.findIndex((drop) => drop.secret === secret)

    if (index === -1) {
        alert('Failed to find link drop')
        return
    } else if (drops[index].used) {
        alert('Link drop was already claimed')
        return
    }

    const wallet = new ethers.Wallet(secret)
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    let address, signer

    if (mm) {
        address = account || ''
        signer = provider.getSigner()
    } else {
        address = window.prompt(MESSAGE_WHEN_NO_METAMASK) || ''

        signer = ethers.Wallet.createRandom()
        signer = signer.connect(provider)
    }

    const airdrop = Airdrop.contract(signer)
    console.log('Using address:', address)

    try {
        address = ethers.utils.getAddress(
            lastKCharacters(address, 40).toLocaleLowerCase()
        )
    } catch (e) {
        alert(`Invalid address <${address}>`)
        return
    }

    const addressB = Buffer.from(lastKCharacters(address, 40), 'hex')
    console.log({ address })

    const signedMessage = await wallet.signMessage(addressB)
    const sig = ethers.utils.splitSignature(signedMessage)
    console.log('Airdrop id:', wallet.address)
    const tx = await airdrop.claim(sig.v, sig.r, sig.s)
    console.log('Transaction:', tx)
    const receipt = await tx.wait(5)
    console.log('Receipt:', receipt)

    const dropStatus = await airdrop.linkStatus(wallet.address)
    console.log('Airdrop status (after)', dropStatus)

    if (dropStatus.claimed === address) {
        drops[index].used = true
        setLSDrops(drops)
        setDrops(drops)
    }
}

function ClaimButton(props: {
    className: string
    text: string
    secret: string
    mm: Boolean
    setDrops: any
}) {
    const { account } = useMetaMask()
    return (
        <button
            className={props.className}
            onClick={async () =>
                await claim(props.secret, props.mm, account, props.setDrops)
            }
        >
            {props.text}
        </button>
    )
}
export default ClaimButton
