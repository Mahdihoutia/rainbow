import "@rainbow-me/rainbowkit/styles.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, useAccount, useWriteContract } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import abi from "../abi.json";
// import usdtSepoliaAbi from "../usdt-sepolia-abi.json";
import usdtMainnetAbi from "../usdt-mainnet-abi.json";
import { Contract, formatEther, JsonRpcProvider, parseEther } from "ethers";

const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "37c77faf882bb36825d1fcbe3c3efdd1", //fba012a114ce0e6474c64e62403781f6
  chains: [mainnet, sepolia],
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
  const { writeContractAsync } = useWriteContract();

  const contractAddress = "0xF5063895B884739A9EaAb35aEB5DC6753Da02716";

  const provider = new JsonRpcProvider(
    "https://eth-mainnet.g.alchemy.com/v2/W2VDNhIGRT1VTcH2_G5kwtSd-fbw76MK"
  );
  // provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new Contract(contractAddress, abi, provider);
  const init = async () => {
    const currentStage = document.getElementById("current-stage");
    if (currentStage) {
      const stage = await contract.getCurrentStage();
      currentStage.innerText = `Stage ${parseFloat(stage)}`;
    }

    const tokenForSell = document.getElementById("token-for-sell");
    if (tokenForSell) {
      const currentStageTokenAvailable =
        await contract.getCurrentStageTokenAvailable();
      tokenForSell.innerText = `Token for sell: ${parseFloat(
        currentStageTokenAvailable
      )}`;
    }

    const CPTLPrice = document.getElementById("cptl-price");
    if (CPTLPrice) {
      const currentStageTokenPrice = await contract.getCurrentStageTokenPrice();
      CPTLPrice.innerText = `1 CPTL = ${formatEther(currentStageTokenPrice)}$`;
    }

    const nextStagePrice = document.getElementById("next-stage-price");
    if (nextStagePrice) {
      const currentStage = parseInt(await contract.getCurrentStage());
      if (currentStage === 5) {
        nextStagePrice.innerText = ` - - - `;
      } else {
        const stageTokenPrice = await contract.getStageTokenPrice(
          currentStage + 1
        );
        nextStagePrice.innerText = `1 CPTL = ${formatEther(stageTokenPrice)}$`;
      }
    }

    const tokenAddress = document.getElementById("token-address");
    if (tokenAddress) {
      const currentAddress = await contract.crypturalContract();
      tokenAddress.innerText = currentAddress.toString();
    }
  };

  useEffect(() => {
    const button = document.getElementById("connect-wallet-button");
    const purchaseButton: any = document.getElementById("purchase-btn");
    if (button) {
      button.innerText = isConnected
        ? ((address?.slice(0, 4) + "..." + address?.slice(-4)) as string)
        : "Connect Wallet";
    }

    if (purchaseButton) {
      purchaseButton.value = isConnected ? "Buy CPTL Now" : "Connect Wallet";
    }
  }, [isConnected]);

  useEffect(() => {
    init();
    let currency = "ETH";
    let payAmount = 0;
    let tokenAmount = 0;
    const currencyEth = document.getElementById("currency-eth");
    const currencyUsdt = document.getElementById("currency-usdt");
    const inputPay: any = document.getElementById("pay-amount");
    const inputCPTL: any = document.getElementById("cptl-amount");
    const purchaseButton: any = document.getElementById("purchase-btn");

    if (currencyEth && currencyUsdt && inputPay && inputCPTL) {
      currencyEth.addEventListener("click", async () => {
        currency = "ETH";
        console.log("ETH");
        const pay = parseFloat(inputPay.value);
        const currentTokenPrice = parseFloat(
          formatEther(await contract.getCurrentStageTokenPrice())
        );
        payAmount = pay;
        if (currency === "ETH") {
          const ethPrice = parseFloat(await contract.getEthPriceNow()) / 1e8;

          inputCPTL.value = ((pay * ethPrice) / currentTokenPrice).toFixed(2);
          tokenAmount = parseFloat(
            ((pay * ethPrice) / currentTokenPrice).toFixed(2)
          );
        } else {
          inputCPTL.value = (pay / currentTokenPrice).toFixed(2);
          tokenAmount = parseFloat((pay / currentTokenPrice).toFixed(2));
        }
      });

      currencyUsdt.addEventListener("click", async () => {
        currency = "USDT";
        console.log("USDT");
        const pay = parseFloat(inputPay.value);
        const currentTokenPrice = parseFloat(
          formatEther(await contract.getCurrentStageTokenPrice())
        );
        payAmount = pay;
        if (currency === "ETH") {
          const ethPrice = parseFloat(await contract.getEthPriceNow()) / 1e8;

          inputCPTL.value = ((pay * ethPrice) / currentTokenPrice).toFixed(2);
          tokenAmount = parseFloat(
            ((pay * ethPrice) / currentTokenPrice).toFixed(2)
          );
        } else {
          inputCPTL.value = (pay / currentTokenPrice).toFixed(2);
          tokenAmount = parseFloat((pay / currentTokenPrice).toFixed(2));
        }
      });

      inputPay.addEventListener("keyup", async () => {
        const pay = parseFloat(inputPay.value);
        const currentTokenPrice = parseFloat(
          formatEther(await contract.getCurrentStageTokenPrice())
        );
        payAmount = pay;
        if (currency === "ETH") {
          const ethPrice = parseFloat(await contract.getEthPriceNow()) / 1e8;

          inputCPTL.value = ((pay * ethPrice) / currentTokenPrice).toFixed(2);
          tokenAmount = parseFloat(
            ((pay * ethPrice) / currentTokenPrice).toFixed(2)
          );
        } else {
          inputCPTL.value = (pay / currentTokenPrice).toFixed(2);
          tokenAmount = parseFloat((pay / currentTokenPrice).toFixed(2));
        }
      });

      inputCPTL.addEventListener("keyup", async () => {
        const amount = parseFloat(inputCPTL.value);
        const currentTokenPrice = parseFloat(
          formatEther(await contract.getCurrentStageTokenPrice())
        );
        tokenAmount = parseFloat(inputCPTL.value);
        if (currency === "ETH") {
          const ethPrice = parseFloat(await contract.getEthPriceNow()) / 1e8;

          inputPay.value = ((amount / ethPrice) * currentTokenPrice).toFixed(2);
          payAmount = parseFloat(
            ((amount / ethPrice) * currentTokenPrice).toFixed(2)
          );
        } else {
          inputPay.value = (amount * currentTokenPrice).toFixed(2);
          payAmount = parseFloat((amount * currentTokenPrice).toFixed(2));
        }
      });
    }

    if (purchaseButton) {
      purchaseButton.value = "Connect Wallet";
      purchaseButton.addEventListener("click", async () => {
        console.log(payAmount, tokenAmount);
        if (purchaseButton.value === "Connect Wallet") {
          const walletConnectButton = document.getElementById(
            "connect-wallet-button"
          );
          if (walletConnectButton) {
            walletConnectButton.click();
          }
        }
        if (
          payAmount > 0 &&
          tokenAmount > 0 &&
          purchaseButton.value !== "Please Wait ..." &&
          purchaseButton.value !== "Connect Wallet"
        ) {
          purchaseButton.value = "Please Wait ...";
          if (currency === "ETH") {
            writeContractAsync({
              address: contractAddress,
              abi,
              functionName: "buyTokensByEth",
              args: [],
              value: parseEther(payAmount.toString()),
            })
              .then((hash) => {
                if (hash) {
                  setTimeout(() => {
                    purchaseButton.value = "Transaction Done";
                  }, 4000);
                }
              })
              .catch(() => {
                purchaseButton.value = "Transaction Failed";
              });
          } else {
            writeContractAsync({
              address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
              abi: usdtMainnetAbi,
              functionName: "approve",
              args: [contractAddress, payAmount * 1e6],
            })
              .then(() => {
                setTimeout(() => {
                  writeContractAsync({
                    address: contractAddress,
                    abi,
                    functionName: "buyTokensByUsdt",
                    args: [payAmount * 1e6],
                  })
                    .then((hash) => {
                      if (hash) {
                        setTimeout(() => {
                          purchaseButton.value = "Transaction Done";
                        }, 4000);
                      }
                    })
                    .catch(() => {
                      purchaseButton.value = "Transaction Failed";
                    });
                }, 10000);
              })
              .catch(() => {
                purchaseButton.value = "Transaction Failed";
              });
          }
        }
      });
    }
  }, []);

  return (
    <>
      <ConnectButton />
    </>
  );
};

export default App;
