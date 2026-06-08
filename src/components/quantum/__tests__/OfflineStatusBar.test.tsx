import { render } from "@testing-library/react-native";

import { OfflineStatusBar } from "@/components/quantum/OfflineStatusBar";

describe("OfflineStatusBar", () => {
  it("renders a non-blocking offline warning", async () => {
    const view = await render(<OfflineStatusBar visible />);

    expect(view.getByText("No Internet Connection")).toBeTruthy();
    expect(view.getByText(/Reconnect to send messages/)).toBeTruthy();
  });

  it("stays hidden while the device is online", async () => {
    const view = await render(<OfflineStatusBar visible={false} />);

    expect(view.queryByText("No Internet Connection")).toBeNull();
  });
});
