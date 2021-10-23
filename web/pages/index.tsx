/* eslint-disable @next/next/no-img-element */
import { formatEther } from "@ethersproject/units";
import type { NextPage } from "next";
import { useState } from "react";
import { useQuery } from "react-query";
import useWalletStore from "../stores/walletStore";

const Home: NextPage = () => {
  const { connect, disconnect, ethAddress, contracts } = useWalletStore();
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const { data: myEvents } = useQuery(["myEvents", !!contracts], () =>
    contracts?.getMyEvents()
  );
  const { data: otherEvents } = useQuery(["otherEvents", !!contracts], () =>
    contracts?.getOtherEvents()
  );

  console.log(otherEvents);

  return (
    <div className="p-8">
      {!ethAddress && (
        <button className="bg-gray-200 shadow rounded p-2" onClick={connect}>
          Connect Wallet using WalletConnect
        </button>
      )}

      {ethAddress && (
        <>
          <button
            className="bg-gray-200 shadow rounded p-2"
            onClick={disconnect}
          >
            Disconnect Wallet using WalletConnect
          </button>
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

              <button
                onClick={() => {
                  contracts?.useTicket(event.args[1]);
                }}
              >
                Use Ticket
              </button>

              <button
                onClick={() => {
                  contracts?.cancelTicket(event.args[1]);
                }}
              >
                Cancel Ticket
              </button>

              <a href={`/events/${event.args[1].toString()}`}>Event page</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
