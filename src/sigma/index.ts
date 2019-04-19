import { Exchange } from './exchange'
import { Trader } from './trader'

const stocks = {
    'GOOG': {
        code: 'GOOG',
        description: 'Google Plc.',
        startingPrice: 100.00
    }
}

const e = new Exchange(stocks)

// Trader A has no shares to start with but wants
// to buy 5 of Trader B's Google shares
const a = new Trader({}, 1000000)

// Trader B starts with 10 google shares, each bought
// for 100 each
const b = new Trader({
    stock: {
        GOOG: {
            entityId: 'GOOG',
            amount: 10,
            cost: 100
        }
    }
})

// Both traders join the exchange
e.register(a)
e.register(b)

// A opens a bid for 5 shares of google wanting to
// pay 101 for each

console.log(e.bid('GOOG', {
    id: 'A',
    traderId: a.id,
    qty: 5,
    price: 101,
    time: new Date()
}))

// B opens an ask for 5 shares at 101 each and
// since an equal bid is already open, the trade
// happens immediately
console.log(e.ask('GOOG', {
    id: 'B',
    traderId: b.id,
    qty: 5,
    price: 101,
    time: new Date()
}))



e.prettyPrint()
console.log(a.balance)
console.log(b.balance)
