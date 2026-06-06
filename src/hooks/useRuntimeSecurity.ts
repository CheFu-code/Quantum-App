import { useEffect, useState } from "react";

import { clearStoredAuthSession } from "@/lib/authStorage";
import {
  evaluateRuntimeSecurity,
  type RuntimeSecurityVerdict,
} from "@/lib/runtimeSecurity";

type RuntimeSecurityState =
  | { status: "checking"; blocked: false; reasons: string[] }
  | RuntimeSecurityVerdict;

export function useRuntimeSecurity() {
  const [state, setState] = useState<RuntimeSecurityState>({
    blocked: false,
    reasons: [],
    status: "checking",
  });

  useEffect(() => {
    let mounted = true;

    evaluateRuntimeSecurity()
      .then(async (verdict) => {
        if (verdict.blocked) {
          await clearStoredAuthSession();
        }

        if (mounted) setState(verdict);
      })
      .catch(async () => {
        await clearStoredAuthSession();
        if (!mounted) return;

        setState({
          blocked: true,
          reasons: ["Quantum could not verify this device."],
          status: "blocked",
        });
      });

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
