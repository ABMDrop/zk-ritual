import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { ritualTestnet } from "./ritualChain";

export const wagmiConfig = createConfig({
  chains: [ritualTestnet],
  connectors: [injected()],
  transports: {
    [ritualTestnet.id]: http(
      process.env.NEXT_PUBLIC_RITUAL_RPC ||
      "https://rpc.ritualfoundation.org"
    ),
  },
  pollingInterval: 3_000,
});

export { ritualTestnet };
