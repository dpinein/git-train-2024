"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { LoginForm } from "./login-form"
import { SignUpForm } from "./signup-form"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login")

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 bg-transparent border-0">
        {mode === "login" ? <LoginForm onToggleMode={toggleMode} /> : <SignUpForm onToggleMode={toggleMode} />}
      </DialogContent>
    </Dialog>
  )
}
