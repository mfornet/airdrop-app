import { useState, ChangeEvent } from 'react'
import './App.css'
import { Alert, Form, Button } from 'react-bootstrap'
import { MetaMaskProvider, useMetaMask } from 'metamask-react'
import Airdrop from 'airdrop-backend'
import { ethers } from 'ethers'

/*
  Top bar allows log in with different services:
    - Twitter
    - Facebook
    - Instagram

  List with all available airdrops:
    Only if there is at least one airdrop.

  Claim airdrop sections:
    - Textbox auto-populated with private key from the url
    - Check mark to use custom address:
      In this case a new textbox will appear where the address must be specified.
      Warning: Make sure to use a private key that you have access in aurora network.
    - Button to claim
      Connect to metamask, pointing to Aurora before being able to claim

  This is a different page (and requires metamask usage)

  Create airdrop page:
    Trusted mode:
      ...

    Trustless mode:
      ...
*/

declare global {
    interface Window {
        ethereum: any
    }
}

const AURORA_CHAIN_ID = '0x4e454152'
const AURORA_EXPLORER = 'https://explorer.mainnet.aurora.dev'
const AURORA_ENDPOINT = 'http://mainnet.aurora.dev'

function AlertInfo(props: { variant: string; message: string }) {
    return props.message === '' ? (
        <div />
    ) : (
        <div className="row justify-content-center mb-5">
            <Alert
                variant={props.variant}
                className="col-lg-4 mt-2 hidden text-muted"
                style={{
                    marginBottom: '1px',
                    height: '30px',
                    lineHeight: '30px',
                    padding: '0px 15px',
                }}
            >
                {props.message}
            </Alert>
        </div>
    )
}

function lastKCharacters(text: string, suffixSize: number) {
    if (text.length > suffixSize) {
        text = text.slice(text.length - suffixSize)
    }
    return text
}

function Claim() {
    // Parse query string first
    const params = new URLSearchParams(window.location.search)
    const secret = params.get('link') || ''

    // Props declaration
    const [checkedMetamaskStatus, setCheckedMetamaskStatus] = useState(false)
    const [secretInput, setSecretInput] = useState(secret)
    const [useCustomAddress, setUseCustomAddress] = useState(false)
    const [customAddress, setCustomAddress] = useState('')
    const [message, setMessage] = useState({ variant: 'success', message: '' })

    // Message helpers
    const msg_success = (msg: string) => {
        setMessage({ variant: 'success', message: msg })
    }
    const msg_info = (msg: string) => {
        setMessage({ variant: 'info', message: msg })
    }
    const msg_warning = (msg: string) => {
        setMessage({ variant: 'warning', message: msg })
    }
    const msg_clear = () => {
        setMessage({ variant: 'success', message: '' })
    }

    // Configure metamask
    const { account, chainId, status, connect } = useMetaMask()

    if (!checkedMetamaskStatus) {
        if (status === 'unavailable') {
            setUseCustomAddress(true)
            setCheckedMetamaskStatus(true)
        }
    }

    // Hooks
    const inputChange = async (e: ChangeEvent<HTMLInputElement>) => {
        setSecretInput(e.target.value)
    }

    const addressInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
        setCustomAddress(e.target.value)
    }

    const claim = async () => {
        // Get address

        let signer, address, provider

        if (useCustomAddress) {
            provider = new ethers.providers.JsonRpcProvider(AURORA_ENDPOINT)
            address = customAddress
            signer = ethers.Wallet.createRandom()
            signer = signer.connect(provider)
        } else {
            // Try to get address from metamask
            if (status === 'unavailable') {
                msg_warning('Install metamask')
                return
            } else if (status !== 'connected') {
                msg_warning('Connect to metamask')
                await connect()
            } else if (chainId !== AURORA_CHAIN_ID) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: AURORA_CHAIN_ID }],
                    })
                } catch (switchError: any) {
                    // This error code indicates that the chain has not been added to MetaMask.
                    if (switchError.code === 4902) {
                        try {
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [
                                    {
                                        chainId: AURORA_CHAIN_ID,
                                        chainName: 'Aurora Mainnet',
                                        nativeCurrency: {
                                            name: 'ETH',
                                            symbol: 'ETH',
                                            decimals: 18,
                                        },
                                        rpcUrls: [AURORA_ENDPOINT],
                                        blockExplorerUrls: [AURORA_EXPLORER],
                                    },
                                ],
                            })
                        } catch (addError) {
                            msg_warning('Switch MetaMask to Aurora Network')
                        }
                    } else {
                        msg_warning('Switch MetaMask to Aurora Network')
                    }
                }
            } else {
                msg_clear()
            }

            provider = new ethers.providers.Web3Provider(window.ethereum)
            signer = provider.getSigner()
            address = account
        }

        if (address === null) {
            return
        } else {
            address = '0x' + lastKCharacters(address, 40)
        }

        if (!ethers.utils.isAddress(address)) {
            msg_warning('Invalid target address')
            return
        }

        /// Parse secret input
        const privateKey = '0x' + lastKCharacters(secretInput, 64)
        console.log(`Address: ${address}, Secret key: ${secretInput}`)

        /// Connect to the contract and claim the tokens for our account
        let wallet = null
        try {
            wallet = new ethers.Wallet(privateKey)
            console.log('Private Key:', privateKey)
        } catch (e) {
            console.log('Invalid private key', privateKey, e)
            msg_warning('Invalid link drop')
            return
        }

        const airdrop = Airdrop.contract(signer)
        let dropStatus = await airdrop.linkStatus(wallet.address.slice(2))
        console.log('Airdrop status (before)', dropStatus)

        if (!dropStatus.exist) {
            msg_warning('Invalid link drop')
        } else if (
            dropStatus.claimed !== '0x0000000000000000000000000000000000000000'
        ) {
            msg_warning('Airdrop already claimed')
        } else {
            try {
                msg_info(
                    `Claiming airdrop. Token: ${dropStatus.token} Amount: ${dropStatus.amount}`
                )
                console.log('Using address:', address)
                const signedMessage = await wallet.signMessage(
                    Buffer.from(lastKCharacters(address, 40), 'hex')
                )
                const sig = ethers.utils.splitSignature(signedMessage)
                console.log('Airdrop id:', wallet.address)
                const tx = await airdrop.claim(sig.v, sig.r, sig.s)
                console.log('Transaction:', tx)
                const receipt = await tx.wait(5)
                console.log('Receipt:', receipt)

                dropStatus = await airdrop.linkStatus(wallet.address)
                console.log('Airdrop status (after)', dropStatus)

                dropStatus.claimed.toLowerCase() === address.toLowerCase()
                    ? msg_success('Successfully claimed airdrop')
                    : msg_warning('Failed to claimed link drop')
            } catch (e) {
                console.log(e)
                msg_warning('Failed to claimed link drop')
            }
        }
    }

    const metamaskToggle = async (e: any) => {
        setUseCustomAddress(e.target.checked)
    }

    // Body
    return (
        <div className="container">
            <div className="row mt-2">
                <Form.Control
                    placeholder="Airdrop link"
                    className="col-1"
                    value={secretInput}
                    onChange={inputChange}
                />
            </div>
            <div className="row mt-2">
                <Button variant="primary" onClick={claim}>
                    Claim
                </Button>{' '}
            </div>
            <div className="row mt-2">
                <Form.Check
                    type="checkbox"
                    id={`use-metamask`}
                    checked={useCustomAddress}
                    label={'Use custom address (No metamask required)'}
                    onChange={metamaskToggle}
                />
            </div>
            {useCustomAddress ? (
                <div className="row mt-2">
                    <Form.Control
                        placeholder="You address"
                        className="col-1"
                        onChange={addressInputChange}
                    />
                </div>
            ) : (
                <div />
            )}
            <div className="row mt-2">
                <AlertInfo
                    variant={message.variant}
                    message={message.message}
                />
            </div>
        </div>
    )
}

function App() {
    return (
        <MetaMaskProvider>
            <Claim />
        </MetaMaskProvider>
    )
}

export default App
