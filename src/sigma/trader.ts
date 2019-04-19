import { ID, Price, Order } from './order'
import { Entity } from './entity';

export type ExitCode = boolean

/**
 * The recipient recieves the entity in
 * exchange for funds. The trader aquires funds.
 * Trader sells,
 * Recipients buys
 */
export interface Trade {
    traderId: ID,
    recipientId: ID,
    entity: Entity,
    order: Order,
    bidId: ID,
    askId: ID
}

export interface Stock {
    entityId: ID,
    amount: Price,
    cost: Price
}

export interface Portfolio {
    stock?: {}
}

export class Trader {
    id: ID
    balance: Price
    blotter: Trade[]
    orders: Order[]
    profit: Price
    birth: Date
    numberOfTrade: number
    profitPerMinute: number
    portfolio: Portfolio

    constructor(portfolio?: Portfolio, balance?: Price) {
        this.portfolio = portfolio || { stock: {} }
        this.blotter = []
        this.balance = balance || 0
    }

    showPortfolio() {
        console.log(this.portfolio.stock)
    }

    /**
     * Remove funds from trader balance
     * @param amount 
     */
    subtractFunds(amount): ExitCode {
        // Double check that we can make the subtraction
        // if not, log a large error
        if (this.balance < amount) {
            return false
        }

        this.balance -= amount
        return true
    }

    /**
     * Add funds to trader's balance
     * @param amount 
     */
    addFunds(amount): ExitCode {
        this.balance += amount
        return true
    }

    /**
     * Update traders portfolio by removing traded entities
     * @param code 
     * @param amount 
     */
    subtractEntity(code, amount): ExitCode {
        // Double check that we can make the subtraction
        // if not, log a large error
        if (this.portfolio.stock[code].amount < amount) {
            // TODO: Implement logger
            return false
        }

        this.portfolio.stock[code].amount -= amount
        return true
    }

    /**
     * Update traders portfolio by adding trading entities
     * @param code 
     * @param amount
     * @param cost
     */
    addEntity(code, amount, cost): ExitCode {
        const stocks = Object.keys(this.portfolio.stock)

        if (stocks.indexOf(code) === -1) {
            this.portfolio.stock[code] = {
                entityId: code,
                amount,
                cost
            }
        } else {
            this.portfolio.stock[code].amount += amount
        }

        return true
    }

    /**
     * Add trade to blotter
     * @param trade 
     */
    log(trade: Trade) {
        this.blotter.push(trade)
    }
}
