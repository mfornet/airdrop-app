import logo from '../assets/img/aurora-logo.svg'
import MetaMaskButton from '../components/MetaMaskButton'
import TwitterButton from '../components/TwitterButton'
import Drops from '../components/Drops'

function Home(props: { mm: Boolean; setMm: any }) {
    return (
        <div className="near-container">
            <div className="near-dapp">
                <div className="near-dapp-header">
                    <div className="near-logo">
                        <img
                            className="near-logo"
                            src={logo}
                            alt="Aurora logo"
                            height="32"
                        />
                    </div>
                    <MetaMaskButton mm={props.mm} setMm={props.setMm} />
                    <TwitterButton />
                </div>
                <div className="near-dapp-body">
                    <div>
                        <Drops mm={props.mm} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home
