"use client"

import { Brain, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"

export function Header() {
  const { isSignedIn, isLoaded } = useUser()

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DataGenius
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
              Pricing
            </a>
            <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">
              About
            </a>
            {isLoaded && (
              <>
                {isSignedIn ? (
                  <div className="flex items-center space-x-4">
                    <Button
                      asChild
                      variant="outline"
                      className="bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <a href="/dashboard">Dashboard</a>
                    </Button>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <SignInButton mode="modal">
                      <Button variant="outline" className="bg-white text-blue-600 border-blue-600 hover:bg-blue-50">
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
                    </SignUpButton>
                  </div>
                )}
              </>
            )}
          </nav>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                <a href="#features" className="text-lg">
                  Features
                </a>
                <a href="#pricing" className="text-lg">
                  Pricing
                </a>
                <a href="#about" className="text-lg">
                  About
                </a>
                {isLoaded && (
                  <>
                    {isSignedIn ? (
                      <div className="space-y-4">
                        <Button asChild variant="outline" className="w-full">
                          <a href="/dashboard">Dashboard</a>
                        </Button>
                        <div className="flex justify-center">
                          <UserButton afterSignOutUrl="/" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <SignInButton mode="modal">
                          <Button variant="outline" className="w-full">
                            Sign In
                          </Button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                          <Button className="w-full">Get Started</Button>
                        </SignUpButton>
                      </div>
                    )}
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
