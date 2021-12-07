import LoginButton from './LoginButton'
import twitterIcon from '../assets/img/twitter.svg'

export async function backend(method: string, params: any = {}) {
    const response = await window.fetch(window.airdropConfig.AIRDROP_BACKEND, {
        method: 'POST',
        headers: {
            'content-type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: method,
            params: params,
            id: '1',
        }),
    })
    return (await response.json()).result
}

const TWITTER_SESSION_DATA_LOCAL_STORAGE_KEY = '__TWITTER_SESSION'

export class TwitterSession {
    name: string
    uuid: string

    constructor(name: string, uuid: string) {
        this.name = name
        this.uuid = uuid
    }

    static get(): TwitterSession | null {
        const value = localStorage.getItem(
            TWITTER_SESSION_DATA_LOCAL_STORAGE_KEY
        )
        if (value === null) {
            return null
        } else {
            return JSON.parse(value)
        }
    }

    save() {
        localStorage.setItem(
            TWITTER_SESSION_DATA_LOCAL_STORAGE_KEY,
            JSON.stringify(this)
        )
    }
}

function TwitterButton() {
    let loggedTwitter,
        header = '',
        user = ''

    const twitterSession = TwitterSession.get()

    const connectToTwitter = async () => {
        const data = await backend('auth.twitter.request_url')
        window.location.href = data.url
    }

    const authenticateConnection = async (
        oauth_token: string,
        oauth_verifier: string
    ) => {
        const data = await backend('auth.twitter.register', {
            oauth_token,
            oauth_verifier,
        })

        const twitterSession = new TwitterSession(data.name, data.uuid)
        twitterSession.save()
        window.location.href = '/'
    }

    if (twitterSession === null) {
        loggedTwitter = false

        const params = new URLSearchParams(window.location.search)
        const oauth_token = params.get('oauth_token')
        const oauth_verifier = params.get('oauth_verifier')

        if (oauth_token === null || oauth_verifier === null) {
            header = 'Twitter'
        } else {
            header = 'Authenticating'
            authenticateConnection(oauth_token, oauth_verifier)
        }
    } else {
        loggedTwitter = true
        user = twitterSession.name
    }

    return (
        <LoginButton
            logged={loggedTwitter}
            header={header}
            user={user}
            iconSource={twitterIcon}
            signinFlow={connectToTwitter}
            signoutFlow={() => console.log('signout')}
        />
    )
}

export default TwitterButton
