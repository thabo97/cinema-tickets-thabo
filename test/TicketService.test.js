import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest.js";
import TicketService from "../src/pairtest/TicketService.js";

describe("Ticket purchase", () =>{
    it("it should successfully make ticket purchases", async () => {

        const ticketOne = new TicketTypeRequest('ADULT', 10)
        const ticketTwo = new TicketTypeRequest('CHILD', 1)
        const ticketThree = new TicketTypeRequest('INFANT', 9)

        const ticketService = new TicketService()

        const response = await ticketService.purchaseTickets(1, ticketOne, ticketTwo, ticketThree)
        expect(response.data).toMatchObject({ totalPrice: 210, totalSeats: 11, sumOfTickets: 20 })
    })

    it("it should fail due to not adult present",   async () => {

        const ticketOne = new TicketTypeRequest('CHILD', 10)
        const ticketTwo = new TicketTypeRequest('CHILD', 1)
        const ticketThree = new TicketTypeRequest('INFANT', 9)

        const ticketService = new TicketService()

        try{
            await ticketService.purchaseTickets(1, ticketOne, ticketTwo, ticketThree)
        }catch (e) {
            expect(e).toBeInstanceOf(Error)
        }

    })
})