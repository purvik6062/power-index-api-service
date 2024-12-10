"use client";
import Link from "next/link";
import { ConnectWallet } from "./ConnectWallet/ConnectWallet";
import { ThemeToggle } from "./theme/theme-toggle";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-background">
      <Link href="/" className="text-2xl font-bold">
        Power Index API
      </Link>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <ConnectWallet />
      </div>
    </nav>
  );
}
