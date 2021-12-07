import { ethers } from 'ethers'
import Airdrop, { erc20 } from 'airdrop-backend'

const DROPS_LOCAL_STORAGE_KEY = '__DROPS'

export function lastKCharacters(text: string, suffixSize: number) {
    if (text.length > suffixSize) {
        text = text.slice(text.length - suffixSize)
    }
    return text
}

export class Drop {
    secret: string
    used: Boolean
    from: string
    drop_key?: string
    amount?: string
    tokenName?: string
    tokenSymbol?: string
    tokenDecimals?: number
    exist?: Boolean

    constructor(secret: string, from: string) {
        this.secret = secret
        this.used = false
        this.from = from
    }

    static from(args: {
        secret: string
        used: Boolean
        from: string
        drop_key?: string
        amount?: string
        tokenName?: string
        tokenSymbol?: string
        tokenDecimals?: number
        exist?: Boolean
    }): Drop {
        const drop = new Drop(args.secret, args.from)

        drop.secret = args.secret
        drop.used = args.used
        drop.from = args.from
        drop.drop_key = args.drop_key
        drop.amount = args.amount
        drop.tokenName = args.tokenName
        drop.tokenSymbol = args.tokenSymbol
        drop.tokenDecimals = args.tokenDecimals
        drop.exist = args.exist

        return drop
    }

    getLink() {
        return `${window.location.origin}/${this.secret}`
    }

    async update() {
        const wallet = new ethers.Wallet(this.secret)
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const airdrop = Airdrop.contract(provider)

        this.drop_key = wallet.address.slice(2)
        const status = await airdrop.linkStatus(this.drop_key)

        if (!status.exist) {
            this.exist = false
            return
        } else {
            this.exist = true
        }
        this.amount = status.amount.toString()
        this.used =
            status.claimed !== '0x0000000000000000000000000000000000000000'

        const token = erc20(status.token, provider)

        if (this.tokenName === undefined) {
            this.tokenName = await token.name()
        }

        if (this.tokenSymbol === undefined) {
            this.tokenSymbol = await token.symbol()
        }

        if (this.tokenDecimals === undefined) {
            this.tokenDecimals = await token.decimals()
        }
    }

    getAmount() {
        if (this.amount === undefined) {
            return '0'
        } else if (
            this.tokenDecimals === undefined ||
            this.tokenDecimals === 0
        ) {
            return this.amount
        } else {
            if (this.amount.length <= this.tokenDecimals) {
                const decRepr =
                    '0'.repeat(this.tokenDecimals - this.amount.length) +
                    this.amount.slice(0, 2)
                return `0.${decRepr}`
            } else {
                return `${this.amount.slice(
                    0,
                    this.amount.length - this.tokenDecimals
                )}.${this.amount.slice(
                    this.amount.length - this.tokenDecimals,
                    this.amount.length - this.tokenDecimals + 2
                )}`
            }
        }
    }
}

export function getLSDrops(): Drop[] {
    return JSON.parse(
        localStorage.getItem(DROPS_LOCAL_STORAGE_KEY) || '[]'
    ).map((drop: any) => Drop.from(drop))
}

export function setLSDrops(drops: Drop[]) {
    localStorage.setItem(DROPS_LOCAL_STORAGE_KEY, JSON.stringify(drops))
}
