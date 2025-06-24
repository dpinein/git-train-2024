import type React from "react"
import { ClerkProvider } from "@clerk/nextjs"

/**
 * Wraps children in <ClerkProvider /> **only** when the publishable key is
 * available.  When the key is missing (e.g. preview deployments or local dev
 * without env-file) it falls back to a no-op wrapper so the app still renders
 * instead of throwing “Missing publishableKey” errors.
 */
export function SafeClerkProvider({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  // If the key is undefined/empty, render children as-is (no auth features),
  // otherwise initialise Clerk normally.
  return publishableKey ? <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider> : <>{children}</>
}
