import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useWalletStore from "../../../stores/walletStore";

export default function VerifyPage() {
  const { query } = useRouter();
  const { eventId } = query;
  const { contracts, connect } = useWalletStore();
  const [validTicket, setValidTicket] = useState<boolean>();
  const [error, setError] = useState<unknown>();

  async function validate() {
    try {
      const address = ethers.utils.verifyMessage(
        `I own this very special wallet!`,
        location.hash.substring(1)
      );

      setValidTicket(await contracts?.isRedeemed(eventId, address));
    } catch (error) {
      console.error(error);
      setError(error);
    }
  }

  useEffect(() => {
    console.log(contracts);
    if (contracts) validate();
  }, [contracts]);

  return (
    <div>
      {!contracts && (
        <button className="bg-gray-200 shadow rounded p-2" onClick={connect}>
          Validate
        </button>
      )}

      <p>{validTicket === true && "Valid ticket!"}</p>

      <p>{(!!error || validTicket === false) && "Ticket not valid"}</p>
    </div>
  );
}
