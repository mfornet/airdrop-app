import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import nearcover from '../assets/img/redpacket-cover.svg'
import { Drop, getLSDrops, lastKCharacters, setLSDrops } from '../common'
import ClaimButton from '../components/ClaimButton'
import MetaMaskButton from '../components/MetaMaskButton'

function Claim(props: { mm: Boolean; setMm: any }) {
    const params = useParams()
    const secret = lastKCharacters(params['key'] || '', 64)

    console.log({ secret })

    const [status, setStatus] = useState(true)
    const [amount, setAmount] = useState('0')
    const [symbol, setSymbol] = useState('')

    const update = (drop: Drop) => {
        if (drop.amount !== undefined) {
            setAmount(drop.getAmount() || '0')
        }

        if (drop.tokenSymbol !== undefined) {
            setSymbol(drop.tokenSymbol)
        }

        setStatus(drop.exist !== false && drop.used !== true)
    }

    useEffect(() => {
        const drops = getLSDrops()
        const drop = drops.find((drop) => drop.secret === secret)

        if (drop !== undefined) {
            update(drop)
        } else {
            const drop = new Drop(secret, 'link')
            drop.update()
                .then(() => {
                    drops.push(drop)
                    setLSDrops(drops)
                    update(drop)
                })
                .catch(() => {
                    setStatus(false)
                })
        }
    })

    return (
        <div className="near-container">
            <div className="near-dapp near-dapp-redpacket">
                <div className="near-redpacket-header">
                    <img className="redpacket-cover" src={nearcover} alt="" />
                    <button className="redpacket-btn">{'OPEN'}</button>
                </div>
                <div className="near-redpacket-body">
                    <div className="redpacket-content">
                        <div className="redpacket-content-title">
                            {'Thank You'}
                        </div>
                        <div className="redpacket-content-subtitle">
                            {'FROM NEAR Protocol'}
                        </div>
                    </div>
                    <div className="redpacket-card">
                        <img
                            className="redpacket-cover"
                            src={nearcover}
                            alt=""
                        />
                        <div className="redpacket-card-header">
                            <div className="h2">{'Thank You'}</div>
                        </div>
                        <div className="redpacket-card-body">
                            {status ? (
                                <>
                                    <div className="">{'AMOUNT'}</div>
                                    <div className="h1">
                                        {amount.toString()}
                                        <small>{symbol ? symbol : '$'}</small>
                                    </div>
                                </>
                            ) : (
                                <div className="h2">{'ALREADY CLAIMED'}</div>
                            )}
                        </div>
                        <div className="redpacket-card-footer">
                            {status ? (
                                <>
                                    {/* <button
                                        className="btn btn-gold btn-block btn-lg"
                                        onClick={() =>
                                            console.log('Claim airdrop')
                                        }
                                    >
                                        {'CLAIM'}
                                    </button> */}
                                    <ClaimButton
                                        className="btn btn-gold btn-block btn-lg"
                                        text="CLAIM"
                                        mm={props.mm}
                                        setDrops={() => {
                                            alert('Drop claimed')
                                            window.location.href = '/'
                                        }}
                                        secret={secret}
                                    />
                                    <p> </p>
                                    {
                                        <MetaMaskButton
                                            mm={props.mm}
                                            setMm={props.setMm}
                                        />
                                    }
                                </>
                            ) : (
                                <a
                                    className="btn btn-gold btn-block btn-lg disabled"
                                    href="#"
                                >
                                    {'Invalid Redpacket'}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Claim
