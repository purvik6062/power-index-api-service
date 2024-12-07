"use client";
import React from "react";
import { ConnectWallet } from "./ConnectWallet";

function Navbar() {
  return (
    <div className="flex justify-end items-end mt-4 mr-4">
      <ConnectWallet />
    </div>
  );
}

export default Navbar;
