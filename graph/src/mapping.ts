import {
  BuyTicket,
  CancelEvent,
  CancelTicket,
  CreateEvent,
  UseTicket,
} from "../generated/EventMachine/EventMachine";
import { Event, Ticket } from "../generated/schema";

export function handleBuyTicket(event: BuyTicket): void {
  let ticketId =
    event.params.eventId.toString() + event.params.buyer.toHexString();
  let ticket = Ticket.load(ticketId);

  if (!ticket) {
    ticket = new Ticket(ticketId);
  }

  ticket.buyer = event.params.buyer.toHexString();
  ticket.eventId = event.params.eventId;
  ticket.event = event.params.eventId.toString();
  ticket.status = "bought";

  ticket.save();
}

export function handleUseTicket(event: UseTicket): void {
  let ticketId =
    event.params.eventId.toString() + event.params.buyer.toHexString();
  let ticket = Ticket.load(ticketId);

  if (!ticket) {
    ticket = new Ticket(ticketId);
  }

  ticket.status = "redeemed";

  ticket.save();
}

export function handleCancelTicket(event: CancelTicket): void {
  let ticketId =
    event.params.eventId.toString() + event.params.buyer.toHexString();
  let ticket = Ticket.load(ticketId);

  if (!ticket) {
    ticket = new Ticket(ticketId);
  }

  ticket.status = "canceled";

  ticket.save();
}

export function handleCancelEvent(event: CancelEvent): void {
  let entity = Event.load(event.params.eventId.toString());

  if (!entity) {
    entity = new Event(event.params.eventId.toString());
  }

  entity.creator = "canceled";

  entity.save();
}

export function handleCreateEvent(event: CreateEvent): void {
  let entity = Event.load(event.params.eventId.toString());

  if (!entity) {
    entity = new Event(event.params.eventId.toString());
  }

  entity.creator = event.params.creator.toHexString();
  entity.eventId = event.params.eventId;
  entity.eventPrice = event.params.eventPrice;
  entity.eventDate = event.params.eventDate;
  entity.status = "open";

  entity.save();
}
