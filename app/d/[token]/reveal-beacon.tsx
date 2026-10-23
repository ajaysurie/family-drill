"use client";

import { useEffect } from "react";
import { markRevealed } from "./actions";

export function RevealBeacon({ token }: { token: string }) {
  useEffect(() => { void markRevealed(token); }, [token]);
  return null;
}
