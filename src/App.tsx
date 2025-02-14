import "@rainbow-me/rainbowkit/styles.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { useWalletClient, WagmiProvider } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useEffect } from "react";

const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "37c77faf882bb36825d1fcbe3c3efdd1", //fba012a114ce0e6474c64e62403781f6
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

const App = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Button></Button>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

const Button = () => {
  const { isConnected, address } = useAccount();
  const { data } = useWalletClient();

  console.log(data);

  useEffect(() => {
    const button = document.getElementById("connect-wallet-button");
    if (button) {
      button.innerText = isConnected
        ? ((address?.slice(0, 4) + "..." + address?.slice(-4)) as string)
        : "Connect Wallet";
    }
  }, [isConnected]);

  return (
    <>
      <ConnectButton />
      {/* <div id="connect-wallet-button">Connect Wallet</div> */}
    </>
  );
};

export default App;
