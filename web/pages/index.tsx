/* eslint-disable @next/next/no-img-element */
import { formatEther } from "@ethersproject/units";
import type { NextPage } from "next";
import { useState } from "react";
import Link from "next/link";
import useWalletStore from "../stores/walletStore";
import Connect from "../components/Connect";
import { useQuery } from "react-query";
import { request, gql } from "graphql-request";

const Home: NextPage = () => {
  const { ethAddress, contracts } = useWalletStore();
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const { data } = useQuery(
    ["homepagedata", ethAddress],
    () =>
      request(
        "https://api.thegraph.com/subgraphs/name/finiam/event-machine",
        gql`
          query ($ethAddress: String!) {
            myEvents: events(where: { creator: $ethAddress }) {
              id
              creator
              eventId
              eventPrice
              eventDate
              status
            }
            otherEvents: events(where: { creator_not: $ethAddress }) {
              id
              creator
              eventId
              eventPrice
              eventDate
              status
            }
            myTickets: tickets(where: { buyer: $ethAddress }) {
              id
              eventId
              buyer
              status
            }
          }
        `,
        { ethAddress: ethAddress?.toLowerCase() || "" }
      ),
    { enabled: !!ethAddress, refetchInterval: 2000 }
  );

  console.log(data);

  return (
    <div className="p-8">
      <Connect />

      {ethAddress && (
        <>
          <div className="mt-12">
            <p className="text-xl font-bold">Your eth address:</p>
            <p>{ethAddress}</p>
          </div>
          <div className="mt-12">
            <input
              type="date"
              onChange={(event) => setDate(event.target.value)}
            />
            <input
              type="text"
              onChange={(event) => setPrice(event.target.value)}
            />
            <button
              className="bg-gray-200 shadow rounded p-2 "
              onClick={async () => {
                const tx = await contracts?.createEvent(price, date);

                await tx.wait(1);
              }}
            >
              Create Event
            </button>
          </div>
        </>
      )}

      {data?.myEvents && (
        <div className="mt-12">
          <p className="text-xl font-bold">Your created events</p>
          {data.myEvents.map((event: any) => (
            <div key={event.id} className="flex pt-4 space-x-4">
              <p>{event.id}</p>

              <p>{formatEther(event.eventPrice)} ETH</p>

              <p>
                {new Date(Number(event.eventDate) * 1000).toLocaleString(
                  "en-us"
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      {data?.otherEvents && (
        <div className="mt-12">
          <p className="text-xl font-bold">Other events</p>
          {data.otherEvents.map((event: any) => (
            <div key={event.id} className="flex pt-4 space-x-4">
              <p>{event.id}</p>

              <p>{formatEther(event.eventPrice)} ETH</p>

              <p>
                {new Date(Number(event.eventDate) * 1000).toLocaleString(
                  "en-us"
                )}
              </p>

              <button
                onClick={() => {
                  contracts?.buyTicket(event.eventId, event.eventPrice);
                }}
              >
                Buy Ticket
              </button>
            </div>
          ))}
        </div>
      )}

      {data?.myTickets && (
        <div className="mt-12">
          <p className="text-xl font-bold">Your tickets</p>
          {data.myTickets.map((ticket: any) => (
            <div key={ticket.id} className="flex pt-4 space-x-4">
              <p>{ticket.eventId}</p>

              <button
                onClick={() => {
                  contracts?.useTicket(ticket.eventId);
                }}
              >
                Use Ticket
              </button>

              <button
                onClick={() => {
                  contracts?.cancelTicket(ticket.eventId);
                }}
              >
                Cancel Ticket
              </button>

              <Link passHref href={`/events/${ticket.eventId}`}>
                <a>Validate ticket</a>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
