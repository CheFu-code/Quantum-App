import * as Network from "expo-network";
import { useMemo } from "react";

export type NetworkStatus = {
  isConnected: boolean;
  isInternetReachable: boolean;
  isKnown: boolean;
  isOnline: boolean;
  type: Network.NetworkState["type"];
};

export function useNetworkStatus(): NetworkStatus {
  const networkState = Network.useNetworkState();

  return useMemo(() => toNetworkStatus(networkState), [networkState]);
}

export async function getCurrentNetworkStatus() {
  return toNetworkStatus(await Network.getNetworkStateAsync());
}

function toNetworkStatus(networkState: Network.NetworkState): NetworkStatus {
  const isKnown =
    typeof networkState.isConnected === "boolean" ||
    typeof networkState.isInternetReachable === "boolean";
  const connected =
    networkState.isConnected !== false &&
    networkState.type !== Network.NetworkStateType.NONE;
  const internetReachable = networkState.isInternetReachable !== false;

  return {
    isConnected: connected,
    isInternetReachable: internetReachable,
    isKnown,
    isOnline: !isKnown || (connected && internetReachable),
    type: networkState.type,
  };
}
