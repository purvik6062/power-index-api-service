"use client";

import { usePrivy } from "@privy-io/react-auth";
import React, { useState } from "react";
import { useAccount } from "wagmi";

function APIKeyGenerator() {
  const [apiKey, setApiKey] = useState("");
  const [copiedMessage, setCopiedMessage] = useState("");
  const [generatingApiKey, setGeneratingApiKey] = useState(false);
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { isConnected, address, chain } = useAccount();
  console.log("isConnected", isConnected);
  console.log("authenticated", authenticated);

  const generateAPIKey = async () => {
    try {
      if (!authenticated) {
        login();
        return;
      }
      setGeneratingApiKey(true);
      const myHeaders: HeadersInit = {
        "Content-Type": "application/json",
      };

      const raw = JSON.stringify({
        owner: address,
        rateLimit: 20,
      });

      const requestOptions: any = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };
      const response = await fetch("/api/admin/api-keys", requestOptions);
      const newApiKey = await response.json();
      console.log("newApiKey", newApiKey);
      setApiKey(newApiKey.key);
      setGeneratingApiKey(false);
    } catch (error) {
      setGeneratingApiKey(false);
      console.log("Error:", error);
    }
  };

  // Copy API key to clipboard
  const copyAPIKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopiedMessage("Copied!");
      setTimeout(() => setCopiedMessage(""), 2000);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">
          Generate API Key
        </h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <button
            disabled={generatingApiKey}
            onClick={() => generateAPIKey()}
            className={`w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center ${
              generatingApiKey ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Generate New API Key
          </button>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={
                apiKey
                  ? apiKey
                  : generatingApiKey
                  ? "Generating..."
                  : "No API Key Generated"
              }
              readOnly
              className="flex-1 p-2 border rounded bg-gray-100"
            />
            <button
              onClick={copyAPIKey}
              className="p-2 border rounded hover:bg-gray-50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
              </svg>
            </button>
          </div>

          {copiedMessage && (
            <p className="text-green-600 text-sm">{copiedMessage}</p>
          )}

          <div className="text-sm text-gray-500">
            <p>🔒 Keep your API key confidential</p>
            <p>Generate a new key if compromised</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default APIKeyGenerator;
