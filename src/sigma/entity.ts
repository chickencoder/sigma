import { Price } from './order'

export interface Entity {
    code: string,
    description: string,
    startingPrice: Price
}