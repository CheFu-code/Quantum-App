import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { AppState, Pressable, Text, View } from "react-native";

import {
  clearStoredAuthSession,
  isStoredAuthSessionFresh,
  loadStoredAuthSession,
  saveStoredAuthSession,
  type StoredAuthSession,
} from "@/lib/authStorage";
import {
  refreshQuantumSession,
  revokeQuantumSession,
  startQuantumSignIn,
} from "@/lib/oauth";
import { useQuantumAuth } from "@/hooks/useQuantumAuth";

jest.mock("@/lib/oauth", () => ({
  refreshQuantumSession: jest.fn(),
  revokeQuantumSession: jest.fn(),
  startQuantumSignIn: jest.fn(),
}));

jest.mock("@/lib/authStorage", () => ({
  clearStoredAuthSession: jest.fn(async () => undefined),
  isStoredAuthSessionFresh: jest.fn(),
  loadStoredAuthSession: jest.fn(),
  saveStoredAuthSession: jest.fn(async () => undefined),
}));

function AuthHarness() {
  const auth = useQuantumAuth();

  return (
    <View>
      <Text testID="status">{auth.authStatus}</Text>
      <Text testID="notice">{auth.authNotice}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          void auth.signIn();
        }}
      >
        <Text>Sign in</Text>
      </Pressable>
    </View>
  );
}

describe("useQuantumAuth", () => {
  beforeEach(() => {
    jest.mocked(loadStoredAuthSession).mockResolvedValue(null);
    jest.mocked(isStoredAuthSessionFresh).mockReturnValue(false);
    jest.mocked(refreshQuantumSession).mockResolvedValue(null);
    jest.mocked(revokeQuantumSession).mockResolvedValue(undefined);
    jest.mocked(startQuantumSignIn).mockResolvedValue(null);
  });

  it("shows a friendly provider outage message without freezing", async () => {
    jest
      .mocked(startQuantumSignIn)
      .mockRejectedValue(new Error("Service unavailable"));

    const view = await render(<AuthHarness />);

    await waitFor(() =>
      expect(view.getByTestId("status").props.children).toBe("guest"),
    );
    fireEvent.press(view.getByText("Sign in"));

    await waitFor(() =>
      expect(String(view.getByTestId("notice").props.children)).toContain(
        "CheFu Account is temporarily unavailable",
      ),
    );
    expect(view.getByTestId("status").props.children).toBe("guest");
  });

  it("turns network timeouts into an actionable sign-in message", async () => {
    jest
      .mocked(startQuantumSignIn)
      .mockRejectedValue(new Error("Network request timed out"));

    const view = await render(<AuthHarness />);

    await waitFor(() =>
      expect(view.getByTestId("status").props.children).toBe("guest"),
    );
    fireEvent.press(view.getByText("Sign in"));

    await waitFor(() =>
      expect(String(view.getByTestId("notice").props.children)).toContain(
        "CheFu Account is taking longer than expected",
      ),
    );
  });

  it("keeps the OAuth operation alive while the auth browser backgrounds the app", async () => {
    const signedInSession: StoredAuthSession = {
      accessToken: "access-token",
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
      idToken: "id-token",
      issuedAt: Math.floor(Date.now() / 1000),
      refreshToken: "refresh-token",
      user: {
        email: "user@chefuinc.com",
        uid: "user-1",
      },
    };
    let appStateListener: ((state: string) => void) | undefined;
    jest
      .spyOn(AppState, "addEventListener")
      .mockImplementation((_event, listener) => {
        appStateListener = listener as (state: string) => void;
        return { remove: jest.fn() } as never;
      });
    let finishSignIn: ((session: StoredAuthSession) => void) | undefined;
    jest.mocked(startQuantumSignIn).mockImplementation(
      () =>
        new Promise(resolve => {
          finishSignIn = resolve;
        }),
    );

    const view = await render(<AuthHarness />);

    await waitFor(() =>
      expect(view.getByTestId("status").props.children).toBe("guest"),
    );
    fireEvent.press(view.getByText("Sign in"));
    appStateListener?.("background");
    finishSignIn?.(signedInSession);

    await waitFor(() =>
      expect(view.getByTestId("status").props.children).toBe("authenticated"),
    );
    expect(saveStoredAuthSession).toHaveBeenCalledWith(signedInSession);
    expect(view.getByTestId("notice").props.children).toBe(
      "Signed in to CheFu Account.",
    );
    view.unmount();
  });

  it("clears expired sessions and prompts the user to sign in again", async () => {
    const expiredSession: StoredAuthSession = {
      accessToken: "expired-access",
      expiresAt: 1,
      issuedAt: 1,
      refreshToken: "expired-refresh",
      user: {
        email: "user@chefuinc.com",
        uid: "user-1",
      },
    };

    jest.mocked(loadStoredAuthSession).mockResolvedValue(expiredSession);
    jest.mocked(isStoredAuthSessionFresh).mockReturnValue(false);
    jest.mocked(refreshQuantumSession).mockResolvedValue(null);

    const view = await render(<AuthHarness />);

    await waitFor(() =>
      expect(String(view.getByTestId("notice").props.children)).toContain(
        "Your CheFu session expired",
      ),
    );
    expect(clearStoredAuthSession).toHaveBeenCalled();
    expect(saveStoredAuthSession).not.toHaveBeenCalled();
    expect(view.getByTestId("status").props.children).toBe("guest");
  });
});
