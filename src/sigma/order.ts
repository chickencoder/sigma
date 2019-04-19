import { Trader, Trade, ExitCode } from './trader'
import { Entity } from './entity'

export type ID = string
export type Price = number

export interface Order {
    id: ID
    traderId: ID,
    price: Price,
    qty: number,
    time: Date
}

export enum OrderType {
    Bid,
    Ask
}

export type Bid = Order
export type Ask = Order

export class OrderBook {
    id: ID
    bids: Bid[]
    asks: Ask[]
    tape: Trade[]
    entity: Entity

    constructor() {
       this.bids = []
       this.asks = []
    }

    /**
     * Add a bid into the live order book
     * @param traderId
     * @param bid
     */
    submitBid(bid: Bid) {
        this.bids.push(bid)
        return true
    }

    /**
     * Add an ask into the live order book
     * @param traderId 
     * @param ask 
     */
    submitAsk(ask: Ask): ExitCode {
        this.asks.push(ask)
        return true
    }

    /**
     * Remove bid from OrderBook
     * @param bidId 
     */
    removeBid(bidId: ID): ExitCode {
        const newBids = this.bids.filter(bid => bid.id === bidId)
        this.bids = newBids
        return true
    }

    /**
     * Remove ask from OrderBook
     * @param askId 
     */
    removeAsk(askId: ID): ExitCode {
        const newAsks = this.asks.filter(ask => ask.id === askId)
        this.asks = newAsks
        return true
    }
}