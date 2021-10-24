import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Connect from "../../../components/Connect";
import useWalletStore from "../../../stores/walletStore";

export default function VerifyPage() {
  const { query } = useRouter();
  const { eventId } = query;
  const { contracts } = useWalletStore();
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
      <Connect />

      <p>{validTicket === true && "Valid ticket!"}</p>

      <p>{(!!error || validTicket === false) && "Ticket not valid"}</p>
    </div>
  );
}
