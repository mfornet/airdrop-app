import { useMetaMask } from 'metamask-react'
import { useEffect } from 'react'
import LoginButton from './LoginButton'
import metamaskIcon from '../assets/img/metamask.svg'

async function signInMetamask(status: string, connect: any, chainId: string) {
    if (status === 'unavailable') {
        alert('Install metamask')
        return
    }

    if (status !== 'connected') {
        await connect()
    }

    if (chainId !== window.airdropConfig.AURORA_CHAIN_ID) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: window.airdropConfig.AURORA_CHAIN_ID }],
            })
        } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: window.airdropConfig.AURORA_CHAIN_ID,
                                chainName: 'Aurora Mainnet',
                                nativeCurrency: {
                                    name: 'ETH',
                                    symbol: 'ETH',
                                    decimals: 18,
                                },
                                rpcUrls: [window.airdropConfig.AURORA_ENDPOINT],
                                blockExplorerUrls: [
                                    window.airdropConfig.AURORA_EXPLORER,
                                ],
                            },
                        ],
                    })
                } catch (addError) {
                    alert('Switch MetaMask to Aurora Network')
                }
            } else {
                alert('Switch MetaMask to Aurora Network')
            }
        }
    }
}

async function signOutMetaMask() {}

function MetaMaskButton(props: { mm: Boolean; setMm: any }) {
    const { account, chainId, status, connect } = useMetaMask()
    const { mm, setMm } = props
    const address = (account || '').slice(0, 10)

    useEffect(() => {
        if (
            status === 'connected' &&
            chainId === window.airdropConfig.AURORA_CHAIN_ID
        ) {
            setMm(true)
        } else {
            setMm(false)
        }
    }, [status, chainId, setMm])

    return (
        <LoginButton
            logged={mm}
            header={'Metamask'}
            user={address}
            iconSource={metamaskIcon}
            signinFlow={async () =>
                await signInMetamask(status, connect, chainId || '')
            }
            signoutFlow={signOutMetaMask}
        />
    )
}

export default MetaMaskButton
