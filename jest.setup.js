jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock"),
);

jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
  openBrowserAsync: jest.fn(async () => ({ type: "opened" })),
}));

jest.mock("expo-network", () => ({
  NetworkStateType: {
    NONE: "NONE",
    UNKNOWN: "UNKNOWN",
    WIFI: "WIFI",
  },
  useNetworkState: jest.fn(() => ({
    isConnected: true,
    isInternetReachable: true,
    type: "WIFI",
  })),
}));
