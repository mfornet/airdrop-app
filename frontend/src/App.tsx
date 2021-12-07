import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MetaMaskProvider } from 'metamask-react'
import Home from './views/Home'
import Claim from './views/Claim'
import { useState } from 'react'

function App() {
    let [mm, setMm] = useState(false)

    return (
        <BrowserRouter>
            <MetaMaskProvider>
                <Routes>
                    <Route path="/" element={<Home mm={mm} setMm={setMm} />} />
                    <Route
                        path="/:key"
                        element={<Claim mm={mm} setMm={setMm} />}
                    />
                </Routes>
            </MetaMaskProvider>
        </BrowserRouter>
    )
}

export default App
