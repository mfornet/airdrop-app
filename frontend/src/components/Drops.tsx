import * as clipboard from 'clipboard-polyfill/text'
import { useEffect, useState } from 'react'
import { backend, TwitterSession } from './TwitterButton'
import ClaimButton from './ClaimButton'
import { Drop, getLSDrops, setLSDrops } from '../common'

async function downloadTwitterDrops() {
    const twitterSession = TwitterSession.get()

    if (twitterSession === null) {
        return
    }

    const newDrops = (await backend('drop.list', {
        uuid: twitterSession.uuid,
    })) as string[]

    console.log(newDrops)

    if (newDrops.length === 0) {
        return
    }

    const drops = getLSDrops()

    for (const newDrop of newDrops) {
        console.log({ newDrop })
        if (drops.find((drop) => drop.secret === newDrop) === undefined) {
            drops.push(new Drop(newDrop, 'twitter'))
        }
    }

    setLSDrops(drops)
}

function Drops(props: { mm: Boolean }) {
    const [drops, setDrops] = useState<Drop[]>([])
    const [showUsed, setShowUsed] = useState(false)

    useEffect(() => {
        updateDrops(true)
    }, [])

    async function updateDrops(check = false) {
        /// Check new drops from twitter
        await downloadTwitterDrops()
        const drops = getLSDrops()

        for (const drop of drops) {
            console.log(drop)
            await drop.update()
            setLSDrops(drops)
        }

        if (drops.length > 0) {
            setDrops(drops)
        }
    }
    const displayDrops = drops.filter(
        (d) => d.exist !== false && d.used === showUsed
    )
    const loggedIn = true

    console.log('All drops', drops)
    console.log(`Filtered drops by showUsed=${showUsed}`, displayDrops)

    if (!loggedIn) {
        return (
            <div className="empty">
                <div className="empty-icon">🧧</div>
                <p className="empty-title h5">Aurora Redpackets</p>
                <p className="empty-subtitle">
                    Login to Receive and Send NEAR Redpackets.
                </p>
            </div>
        )
    } else {
        return (
            <div>
                {/* <div className="near-balance">
                    <div className="near-balance-title">Balance</div>
                    <div className="near-balance-funds">
                        2.3 <small>Ⓝ</small>
                    </div>
                    <div className="near-balance-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => console.log('Create new drop')}
                        >
                            + Create New NEAR Drop
                        </button>
                    </div>
                </div> */}
                <div className="near-tabs">
                    <ul className="tab">
                        <li
                            className={
                                showUsed ? 'tab-item' : 'tab-item active'
                            }
                            onClick={() => setShowUsed(false)}
                        >
                            Active
                        </li>
                        <li
                            className={
                                showUsed ? 'tab-item active' : 'tab-item'
                            }
                            onClick={() => setShowUsed(true)}
                        >
                            Claimed
                        </li>
                    </ul>
                </div>

                <div className="near-drops">
                    {displayDrops.length > 0 ? (
                        <div className="drop">
                            {displayDrops.map((drop) => (
                                <div
                                    className="near-drop-item"
                                    key={drop.secret}
                                >
                                    <div className="drop-item-funds">
                                        {drop.amount ? drop.getAmount() : ''}{' '}
                                        <small>
                                            {drop.tokenSymbol
                                                ? drop.tokenSymbol
                                                : 'Fetching...'}
                                        </small>
                                    </div>
                                    <div className="drop-item-status">
                                        {showUsed ? 'Claimed' : drop.from}
                                    </div>

                                    <div className="drop-item-pubkey text-ellipsis text-gray">
                                        Token:{' '}
                                        {drop.tokenName
                                            ? drop.tokenName
                                            : 'Fetching...'}
                                    </div>
                                    <div className="drop-item-pubkey text-ellipsis text-gray">
                                        Address:{' '}
                                        {drop.tokenAddress ? (
                                            <>
                                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                                <a
                                                    href="#"
                                                    onClick={async () => {
                                                        await clipboard.writeText(
                                                            drop.tokenAddress ||
                                                                ''
                                                        )
                                                        alert(
                                                            'Address copied to clipboard'
                                                        )
                                                    }}
                                                >
                                                    {drop.tokenAddress.slice(
                                                        0,
                                                        8
                                                    ) + '...'}
                                                </a>
                                                {' ('}
                                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                                <a
                                                    href="#"
                                                    onClick={async () => {
                                                        await window.ethereum.request(
                                                            {
                                                                method: 'wallet_watchAsset',
                                                                params: {
                                                                    type: 'ERC20',
                                                                    options: {
                                                                        address:
                                                                            drop.tokenAddress ||
                                                                            '',
                                                                        symbol:
                                                                            drop.tokenSymbol ||
                                                                            '',
                                                                        decimals:
                                                                            drop.tokenDecimals ||
                                                                            0,
                                                                        image: '',
                                                                    },
                                                                },
                                                            }
                                                        )
                                                    }}
                                                >
                                                    Track in MetaMask
                                                </a>
                                                {')'}
                                            </>
                                        ) : (
                                            'Fetching...'
                                        )}
                                    </div>

                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={async () => {
                                            await clipboard.writeText(
                                                drop.getLink()
                                            )
                                            alert(
                                                '🧧 NEAR Redpacket link copied.'
                                            )
                                        }}
                                    >
                                        Share Link
                                    </button>
                                    {showUsed ? (
                                        <button
                                            className="btn btn-sm btn-link"
                                            onClick={() =>
                                                console.log('Reclaim drop')
                                            }
                                        >
                                            Remove Drop
                                        </button>
                                    ) : (
                                        <ClaimButton
                                            secret={drop.secret}
                                            mm={props.mm}
                                            setDrops={setDrops}
                                            className="btn btn-sm btn-link"
                                            text="Use Drop"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty">
                            <div className="empty-icon">🧧</div>
                            <p className="empty-title h5">
                                No Available Redpackets
                            </p>
                            <p className="empty-subtitle">
                                Click the button to create a new NEAR redpacket.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}

export default Drops
