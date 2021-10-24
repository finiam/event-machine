import useWalletStore from "../stores/walletStore";

export default function Connect() {
  const { connect, connectMetamask, disconnect, ethAddress } = useWalletStore();

  return (
    <div className="p-8">
      {!ethAddress && (
        <>
          <button className="bg-gray-200 shadow rounded p-2" onClick={connect}>
            Connect Wallet using WalletConnect
          </button>
          <button
            className="bg-gray-200 shadow rounded p-2"
            onClick={connectMetamask}
          >
            Connect Wallet using Metamask
          </button>
        </>
      )}

      {ethAddress && (
        <button className="bg-gray-200 shadow rounded p-2" onClick={disconnect}>
          Disconnect Wallet
        </button>
      )}
    </div>
  );
}
