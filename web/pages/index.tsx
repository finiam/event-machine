/* eslint-disable @next/next/no-img-element */
import { formatEther } from "@ethersproject/units";
import type { NextPage } from "next";
import { useState } from "react";
import { useQuery } from "react-query";
import Link from "next/link";
import useWalletStore from "../stores/walletStore";
import Connect from "../components/Connect";

const Home: NextPage = () => {
  const { ethAddress, contracts } = useWalletStore();
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const { data: myEvents } = useQuery(["myEvents", !!contracts], () =>
    contracts?.getMyEvents()
  );
  const { data: otherEvents } = useQuery(["otherEvents", !!contracts], () =>
    contracts?.getOtherEvents()
  );
  const { data: myTickets } = useQuery(["myTickets", !!contracts], () =>
    contracts?.getMyTickets()
  );

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

      {myEvents && (
        <div className="mt-12">
          <p className="text-xl font-bold">Your created events</p>
          {myEvents.map((event: any) => (
            <div key={event.transactionHash} className="flex pt-4 space-x-4">
              <p>{event.args[1].toString()}</p>

              <p>{formatEther(event.args[2])} ETH</p>

              <p>
                {new Date(event.args[3].toNumber() * 1000).toLocaleString(
                  "en-us"
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      {otherEvents && (
        <div className="mt-12">
          <p className="text-xl font-bold">Other events</p>
          {otherEvents.map((event: any) => (
            <div key={event.transactionHash} className="flex pt-4 space-x-4">
              <p>{event.args[1].toString()}</p>

              <p>{formatEther(event.args[2])} ETH</p>

              <p>
                {new Date(event.args[3].toNumber() * 1000).toLocaleString(
                  "en-us"
                )}
              </p>

              <button
                onClick={() => {
                  contracts?.buyTicket(event.args[1], event.args[2]);
                }}
              >
                Buy Ticket
              </button>
            </div>
          ))}
        </div>
      )}

      {myTickets && (
        <div className="mt-12">
          <p className="text-xl font-bold">Your tickets</p>
          {myTickets.map((ticket: any) => (
            <div key={ticket.transactionHash} className="flex pt-4 space-x-4">
              <p>{ticket.args[1].toString()}</p>

              <button
                onClick={() => {
                  contracts?.useTicket(ticket.args[1]);
                }}
              >
                Use Ticket
              </button>

              <button
                onClick={() => {
                  contracts?.cancelTicket(ticket.args[1]);
                }}
              >
                Cancel Ticket
              </button>

              <Link passHref href={`/events/${ticket.args[1].toString()}`}>
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
