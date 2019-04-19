import { OrderBook, ID, Bid, Ask, OrderType, Order } from './order'
import { Entity } from './entity'
import { Trader, Trade, ExitCode } from './trader'

export interface Message {
    errors: string[],
    status: string
}

export class Exchange {
    books: {}
    entities: {}
    traders: {}
    history: []

    constructor(entities) {
        this.entities = entities
        this.books = {}
        this.traders = {}
        this.history = []
        
        Object.keys(this.entities).forEach(entityId => {
            this.books[entityId] = new OrderBook()
        })
    }

    register(trader: Trader) {
        if (!trader.id) {
            // Temporarily generate random trader ids for testing
            trader.id = Math.floor(Math.random() * 1E10).toString(36)
        }
        this.traders[trader.id] = trader
    }

    getOrderBook(entityId): OrderBook {
        if (Object.keys(this.books).indexOf(entityId) == -1) {
            throw new Error(`Couldn't find Entity in Exchange: ${entityId}`)
        }
        
        return this.books[entityId]
    }

    getEntity(entityId): Entity {
        return this.entities[entityId]
    }

    /**
     * Place a bid in the exchange
     * @param traderId
     * @param entityId
     * @param bid
     * @returns Repsones
     */
    bid(entityId: ID, bid: Bid) {
        const book = this.getOrderBook(entityId)
        
        // Check to see if there is already an active ask
        // for the exact same quantity and price. If there is,
        // process the trade immediately, if not, publish
        // the bid to the rest of the exchange
        const matches = book.asks.filter((match) => {
            return (match.price === bid.price) && (match.qty === bid.qty)
        })

        if (matches.length > 0) {
            // By default, pick first match
            const recipient = matches[0]
            const entity = this.getEntity(entityId)

            return this.processTrade({
                traderId: recipient.traderId,
                recipientId: bid.traderId,
                order: recipient,
                entity,
                bidId: bid.id,
                askId: recipient.id
            })
        }

        return this.publishOrder(OrderType.Bid, entityId, bid)
    }

    /**
     * Place an ask in the exchange
     * @param traderId 
     * @param entityID 
     * @param ask 
     */
    ask(entityId: ID, ask: Ask) {
        const book = this.getOrderBook(entityId)

        // Check to see if there is already an active bid
        // for the exact same quantity and price. If there is,
        // process the trade immediately, if not, publish
        // the bid to the rest of the exchange
        const matches = book.bids.filter((match) => {
            return (match.price === ask.price) && (match.qty === ask.qty)
        })

        if (matches) {
            const recipient = matches[0]
            const entity = this.getEntity(entityId)

            return this.processTrade({
                traderId: ask.traderId,
                recipientId: recipient.traderId,
                order: recipient,
                entity,
                bidId: recipient.id,
                askId: ask.id
            })
        }

        // If an immediate match is not found, order is put
        // onto the books and published to the exchange
        return this.publishOrder(OrderType.Ask, entityId, ask)
    }

    processTrade(trade: Trade): Message {
        const trader = this.traders[trade.traderId]
        const recipient = this.traders[trade.recipientId]

        const cost = trade.order.price
        const quantity = trade.order.qty

        // Verify recipient has sufficient funds to process trade
        if (recipient.balance < cost) {
            return {
                status: 'error',
                errors: ['Trader does not have sufficient funds to complete trade']
            }
        }

        // Verify that trader owns the correct entities to process trade
        const stocks = trader.portfolio.stock
        const stockIndex = Object.keys(stocks).indexOf(trade.entity.code)

        if (stockIndex === -1) {
            return {
                status: 'error',
                errors: ['Trader does not have ownership of the correct entities to complete trade']
            }
        }

        if (stocks.length > 0) {
            const stockAmount = stocks[stockIndex].amount
            if (stockAmount < quantity) {
                return {
                    status: 'error',
                    errors: ['Trader does not has ownership of enough of the desired entities to complete trade']
                }
            }
        }

        // Remove ask & bid from the order books
        const book = this.getOrderBook(trade.entity)
        book.removeBid(trade.bidId)
        book.removeAsk(trade.askId)

        // If recipient has sufficient funds and trader has the correct entities
        // then process the trade. Subtract funds, then move the entities
        const exitCode = recipient.subtractFunds(cost)
            && trader.subtractEntity(trade.entity.code, quantity)
            && recipient.addEntity(trade.entity.code, quantity)
            && trader.addFunds(cost)

        if (!exitCode) {
            return {
                status: 'error',
                errors: ['A fatal error occurred whilst processing transaction. Please contact support']
            }
        }

        // Update each traders blotters with history of the recent transaction
        trader.log(trade)
        recipient.log(trade)

        return {
            status: 'ok',
            errors: []
        }
    }

    /**
     * Validate, append order to order book then publish
     * revelant message to the exchange log
     * @param orderType 
     * @param entityId 
     * @param order 
     */
    publishOrder(orderType: OrderType, entityId: ID, order: Order) {
        const book = this.getOrderBook(entityId)

        if (orderType === OrderType.Bid) {
            return book.submitBid(order) ? {
                status: 'ok',
                errors: []
            } : {
                status: 'error',
                errors: ['Failed to submit bid to exchange']
            }
        } else {
            return book.submitAsk(order) ? {
                status: 'ok',
                errors: []
            } : {
                status: 'error',
                errors: ['Failed to submit ask to exchange']
            }
        }

        // TODO: Publish event to log
    }

    prettyPrint() {
        console.log(JSON.stringify(this, null, 4))
    }
}