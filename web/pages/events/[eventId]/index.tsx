/* eslint-disable @next/next/no-img-element */
import { formatEther } from "@ethersproject/units";
import type { NextPage } from "next";
import { useState } from "react";
import { useQuery } from "react-query";
import QRCode from "qrcode";
import useWalletStore from "../../../stores/walletStore";
import { useRouter } from "next/router";

export default function EventPage() {
  const { query } = useRouter();
  const { eventId } = query;
  const { connect, disconnect, ethAddress, web3Provider } = useWalletStore();
  const [qrcode, setQrcode] = useState<string>();
  const [url, setUrl] = useState<string>();

  return (
    <div className="p-8">
      <h1>Event {eventId}</h1>

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
          <button
            onClick={async () => {
              const signature = await web3Provider
                ?.getSigner()
                .signMessage(`I own this very special wallet!`);
              const newUrl = `${location.origin}${location.pathname}/verify#${signature}`;

              setUrl(newUrl);
              setQrcode(await QRCode.toDataURL(newUrl));
            }}
          >
            Verify
          </button>

          {qrcode && <img className="w-64 h-64" src={qrcode} />}

          {url && <a href={url}>{url}</a>}
        </>
      )}
    </div>
  );
}
