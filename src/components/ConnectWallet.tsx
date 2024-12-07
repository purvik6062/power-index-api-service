"use client";

import { useState, useRef, useEffect } from "react";
import { BiSolidWallet } from "react-icons/bi";
import {
  FiArrowUpRight,
  FiCopy,
  FiExternalLink,
  FiLogOut,
} from "react-icons/fi";
import styles from "@/styles/Navbar.module.css";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useAccount, useEnsName, useDisconnect } from "wagmi";

export function ConnectWallet() {
  const { login, authenticated, user, logout } = usePrivy();
  const { wallets } = useWallets();
  const { address, isConnected } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsWalletConnected(authenticated && isConnected);
  }, [authenticated, isConnected]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      // You might want to add a toast notification here
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleLogout = async () => {
    await logout();
    wagmiDisconnect();
    setIsWalletConnected(false);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {!isWalletConnected ? (
        <>
          {/* Large screen button */}
          <button
            onClick={login}
            type="button"
            className={`hidden lg:flex cursor-pointer xl:w-11 xl:h-11 2xl:w-12 2xl:h-12 2.5xl:w-14 2.5xl:h-14 rounded-full items-center justify-center bg-white w-10 h-10 ${styles.icon3d} ${styles.whiteBg}`}
          >
            <BiSolidWallet
              className={`size-5 text-blue-shade-200 ${styles.iconInner}`}
            />
          </button>

          {/* Small screen button */}
          <div
            className="block lg:hidden py-4 pl-6 sm:py-5 hover:bg-blue-shade-100 cursor-pointer"
            onClick={login}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BiSolidWallet className="size-5 mr-4" />
                <span>Connect Wallet</span>
              </div>
              <FiArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Large screen button */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            type="button"
            className={`hidden lg:flex cursor-pointer xl:w-auto xl:h-11 2xl:w-auto 2xl:h-12 2.5xl:w-auto 2.5xl:h-14 rounded-full items-center justify-center bg-white px-4 ${styles.icon3d} ${styles.whiteBg}`}
          >
            <BiSolidWallet
              className={`size-5 text-blue-shade-200 ${styles.iconInner} mr-2`}
            />
            <span className="text-blue-shade-200">
              {ensName || (address && truncateAddress(address))}
            </span>
          </button>

          {/* Small screen button */}
          <div
            className="block lg:hidden py-4 pl-6 sm:py-5 hover:bg-blue-shade-100 cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BiSolidWallet className="size-5 mr-4" />
                <span>{ensName || (address && truncateAddress(address))}</span>
              </div>
              <FiArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div
                className="py-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
              >
                <div className="px-4 py-2 text-sm text-gray-700">
                  <p>Connected as:</p>
                  <p className="font-bold">
                    {user?.google?.email ||
                      ensName ||
                      (address && truncateAddress(address))}
                  </p>
                </div>
                <button
                  onClick={handleCopyAddress}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  role="menuitem"
                >
                  <FiCopy className="inline mr-2" /> Copy Address
                </button>
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  role="menuitem"
                >
                  <FiLogOut className="inline mr-2" /> Disconnect
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
