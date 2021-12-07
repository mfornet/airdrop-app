import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'

class Config {
    AURORA_CHAIN_ID = '0x4e454152'
    AURORA_EXPLORER = 'https://explorer.mainnet.aurora.dev'
    AURORA_ENDPOINT = 'http://mainnet.aurora.dev'
    AIRDROP_BACKEND = 'https://airdrop-backend.herokuapp.com/api'
}

declare global {
    interface Window {
        ethereum: any
        airdropConfig: Config
    }
}

window.airdropConfig = new Config()

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
