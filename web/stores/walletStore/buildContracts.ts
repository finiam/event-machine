import type { ethers } from "ethers";

const EVENT_MACHINE_ABI = [
  "function createEvent(uint256 ticketPrice, uint256 eventDate) public",
  "function cancelEvent(uint256 eventId) public",
  "function buyTicket(uint256 eventId) public payable",
  "function cancelTicket(uint256 eventId) public",
  "function useTicket(uint256 eventId) public",
  "function isRedeemed(uint256 eventId, address addr) public view returns (bool)",
  `event CreateEvent(address indexed creator, uint256 eventId, uint256 eventPrice, uint256 eventDate)`,
  `event BuyTicket(address indexed buyer, uint256 eventId)`,
];
const { NEXT_PUBLIC_EVENT_MACHINE_CONTRACT: EVENT_MACHINE_CONTRACT } =
  process.env;

export default async function buildContracts(
  ethers: any,
  ethAddress: string,
  provider: ethers.providers.Web3Provider
): Promise<any> {
  const signer = provider.getSigner();
  const eventMachine = new ethers.Contract(
    EVENT_MACHINE_CONTRACT,
    EVENT_MACHINE_ABI,
    signer
  );
  const readOnlyEventMachineContract = new ethers.Contract(
    EVENT_MACHINE_CONTRACT,
    EVENT_MACHINE_ABI,
    provider
  );

  return {
    createEvent: async (priceInEth: string, date: Date) => {
      return eventMachine.createEvent(
        ethers.utils.parseEther(priceInEth),
        Math.floor(new Date(date).getTime() / 1000)
      );
    },

    buyTicket: async (eventId: string, priceInEth: ethers.BigNumber) => {
      return eventMachine.buyTicket(eventId, {
        value: priceInEth,
      });
    },

    useTicket: async (eventId: string) => {
      return eventMachine.useTicket(eventId);
    },

    cancelTicket: async (eventId: string) => {
      return eventMachine.cancelTicket(eventId);
    },

    getMyEvents: async () => {
      return readOnlyEventMachineContract.queryFilter(
        eventMachine.filters.CreateEvent(ethAddress)
      );
    },

    getOtherEvents: async () => {
      return (
        await readOnlyEventMachineContract.queryFilter(
          eventMachine.filters.CreateEvent()
        )
      ).filter(
        (transaction: any) =>
          transaction.args[0].toLowerCase() !== ethAddress.toLowerCase()
      );
    },

    getMyTickets: async () => {
      return readOnlyEventMachineContract.queryFilter(
        eventMachine.filters.BuyTicket(ethAddress)
      );
    },

    isRedeemed: async (eventId: string, address: string) => {
      return readOnlyEventMachineContract.isRedeemed(eventId, address);
    },
  };
}
