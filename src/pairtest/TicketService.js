import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import {ticketLimitEnum} from "./enums/ticketPricesEnum.js";
import {ticketPricesEnum} from "./enums/ticketLimitEnum";
import {ticketSeatAllocationEnum} from "./enums/ticketSeatAllocationEnum.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";

export default class TicketService {

    #sumOfTickets = 0
    #ticketPrice = 0
    #sumOfSeats = 0
    #hasAdult = false
    #adultCount = 0
    #infantCount = 0

    /**
     * Should only have private methods other than the one below.
     */
    async purchaseTickets(accountId, ...ticketTypeRequests) {
        const ticketPaymentService = new TicketPaymentService()
        const seatReservationService = new SeatReservationService()

        await this.#processTicketRequests(ticketTypeRequests);

        if (this.#sumOfTickets > ticketLimitEnum.TICKET_LIMIT) {
            throw new InvalidPurchaseException('Only a maximum of 20 tickets can be purchased at a time')
        }

        if (!this.#hasAdult){
            throw new InvalidPurchaseException('Child and Infant tickets cannot be purchased without purchasing an Adult ticket')
        }

        if (this.#infantCount > this.#adultCount){
            throw new InvalidPurchaseException('Each infant needs at least one adult')
        }


        ticketPaymentService.makePayment(accountId, this.#ticketPrice)
        seatReservationService.reserveSeat(accountId, this.#sumOfSeats)

        return {
            status: 200,
            data: {
                totalPrice: this.#ticketPrice,
                totalSeats: this.#sumOfSeats,
                sumOfTickets: this.#sumOfTickets
            }
        }
    }

    /**
     * Loops through ticketTypeRequests & collects required ticket details
     * @param ticketTypeRequests
     * @returns {Promise<unknown>}
     */
    #processTicketRequests(ticketTypeRequests) {
        return new Promise((resolve, reject) => {
            ticketTypeRequests.forEach((ticketTypeRequest) => {
                if (ticketTypeRequest.getTicketType() === 'ADULT'){
                    this.#hasAdult = true
                    this.#adultCount++
                }
                if (ticketTypeRequest.getTicketType() === 'INFANT'){
                    this.#infantCount++
                }

                this.#ticketPrice += ticketPricesEnum[ticketTypeRequest.getTicketType()] * ticketTypeRequest.getNoOfTickets();
                this.#sumOfSeats += ticketSeatAllocationEnum[ticketTypeRequest.getTicketType()] * ticketTypeRequest.getNoOfTickets()
                this.#sumOfTickets += ticketTypeRequest.getNoOfTickets();


            })
            resolve('resolved')
        })
    }


}
