import WalletConnectProvider from "@walletconnect/web3-provider";
import type { providers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import create from "zustand";
import buildContracts from "./buildContracts";

const initialState = {
  web3Provider: undefined,
  ethAddress: undefined,
  contracts: undefined,
};

const useWalletStore = create<{
  web3Provider?: providers.Web3Provider;
  ethAddress?: string;
  contracts?: any;
  walletConnectProvider?: WalletConnectProvider;
  ethers?: any;
  connect: () => Promise<void>;
  connectMetamask: () => Promise<void>;
  disconnect: () => Promise<void>;
}>((set, get) => ({
  ...initialState,

  connect: async () => {
    const WalletConnectProvider = (await import("@walletconnect/web3-provider"))
      .default;

    const walletConnectProvider = new WalletConnectProvider({
      infuraId: "68bf6cf6914246ef9f2b8f1c30176a6a",
      qrcode: true,
      chainId: 3,
    });
    await walletConnectProvider.enable();
    const ethers = await import("ethers");
    const web3Provider = new ethers.providers.Web3Provider(
      walletConnectProvider
    );
    await ((window as any).ethereum as any).request({
      method: "eth_requestAccounts",
    });
    const signer = web3Provider.getSigner();
    const ethAddress = await signer.getAddress();
    const contracts = await buildContracts(ethers, ethAddress, web3Provider);

    set({
      ethers,
      walletConnectProvider,
      web3Provider,
      ethAddress,
      contracts,
    });
  },

  connectMetamask: async () => {
    const provider = await detectEthereumProvider();
    const ethers = await import("ethers");
    const web3Provider = new ethers.providers.Web3Provider(provider);
    await ((window as any).ethereum as any).request({
      method: "eth_requestAccounts",
    });
    const signer = web3Provider.getSigner();
    const ethAddress = await signer.getAddress();
    const contracts = await buildContracts(ethers, ethAddress, web3Provider);

    set({
      ethers,
      web3Provider,
      ethAddress,
      contracts,
    });
  },

  disconnect: async () => {
    get().walletConnectProvider?.disconnect();

    set(initialState);
  },
}));

export default useWalletStore;
