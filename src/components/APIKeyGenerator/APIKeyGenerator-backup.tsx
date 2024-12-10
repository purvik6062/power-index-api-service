"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";

// Type definitions
interface ApiKeyData {
  key: string;
  owner: string;
  rateLimit: number;
  isActive: boolean;
  createdAt: string;
}

// Custom hook for API key management
function useApiKeyManager() {
  const [apiKeyData, setApiKeyData] = useState<ApiKeyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isConnected, address } = useAccount();
  const { authenticated } = usePrivy();

  // Modern localStorage handling with type safety
  const localStorageManager = useMemo(
    () => ({
      save: (data: ApiKeyData) => {
        try {
          localStorage.setItem("apiKeyData", JSON.stringify(data));
        } catch (error) {
          console.error("Failed to save to localStorage", error);
        }
      },
      get: (): ApiKeyData | null => {
        try {
          const storedData = localStorage.getItem("apiKeyData");
          return storedData ? JSON.parse(storedData) : null;
        } catch (error) {
          console.error("Failed to read from localStorage", error);
          return null;
        }
      },
      clear: () => {
        try {
          localStorage.removeItem("apiKeyData");
        } catch (error) {
          console.error("Failed to clear localStorage", error);
        }
      },
    }),
    []
  );

  // Modern fetch function with improved error handling
  const fetchApiKey = useCallback(async () => {
    if (!isConnected || !address || !authenticated) return null;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/api-keys?owner=${address}`);

      if (!response.ok) {
        // Check local storage as a fallback
        const localStorageData = localStorageManager.get();
        if (localStorageData) {
          setApiKeyData(localStorageData);
          return localStorageData;
        }

        throw new Error(
          response.status === 404
            ? "No API key found"
            : "Failed to fetch API key"
        );
      }

      const fetchedData = await response.json();
      localStorageManager.save(fetchedData);
      setApiKeyData(fetchedData);
      return fetchedData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, authenticated, localStorageManager]);

  // Modern generate key function
  const generateApiKey = useCallback(async () => {
    if (!isConnected || !address || !authenticated) {
      setError("Please connect wallet and authenticate");
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: address, rateLimit: 20 }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate API key");
      }

      const newApiKey = await response.json();
      localStorageManager.save(newApiKey);
      setApiKeyData(newApiKey);
      return newApiKey;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, authenticated, localStorageManager]);

  // Initial fetch effect with improved error handling
  useEffect(() => {
    const loadInitialData = async () => {
      // First, try to fetch from server
      const serverData = await fetchApiKey();

      // If no server data, check local storage
      if (!serverData) {
        const localStorageData = localStorageManager.get();
        if (localStorageData) {
          setApiKeyData(localStorageData);
        }
      }
    };

    loadInitialData();
  }, [fetchApiKey, localStorageManager]);

  return {
    apiKeyData,
    isLoading,
    error,
    fetchApiKey,
    generateApiKey,
  };
}

// Optimized Component with Modern Practices
function APIKeyGenerator() {
  const { apiKeyData, isLoading, error, generateApiKey } = useApiKeyManager();
  const [copiedMessage, setCopiedMessage] = useState("");
  const { ready, authenticated, login } = usePrivy();
  const { isConnected } = useAccount();

  // Modern clipboard handling with async/await
  const copyAPIKey = useCallback(async () => {
    if (apiKeyData?.key) {
      try {
        await navigator.clipboard.writeText(apiKeyData.key);
        setCopiedMessage("Copied!");
        setTimeout(() => setCopiedMessage(""), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
        setCopiedMessage("Copy failed");
      }
    }
  }, [apiKeyData]);

  // Memoized display state with more descriptive conditions
  const displayState = useMemo(() => {
    if (!ready) return "Checking authentication...";
    if (!isConnected) return "Please connect your wallet";
    if (!authenticated) return "Please log in";
    return null;
  }, [ready, isConnected, authenticated]);

  // Render logic with improved readability
  const renderContent = () => {
    if (displayState) {
      return <div className="text-gray-500 text-center">{displayState}</div>;
    }

    return (
      <div className="space-y-4">
        <button
          disabled={isLoading}
          onClick={() => generateApiKey()}
          className={`w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors ${
            isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
        >
          {isLoading ? "Generating..." : "Generate New API Key"}
        </button>

        {apiKeyData && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={apiKeyData.key}
                readOnly
                className="flex-1 p-2 border rounded bg-gray-100"
              />
              <button
                onClick={copyAPIKey}
                className="p-2 border rounded hover:bg-gray-50"
              >
                Copy
              </button>
            </div>

            {copiedMessage && (
              <p className="text-green-600 text-sm">{copiedMessage}</p>
            )}

            <div className="text-sm text-gray-600">
              <p>Created: {new Date(apiKeyData.createdAt).toLocaleString()}</p>
              <p>Rate Limit: {apiKeyData.rateLimit} requests</p>
              <p>Status: {apiKeyData.isActive ? "Active" : "Inactive"}</p>
            </div>
          </div>
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">
          Generate API Key
        </h2>
      </div>
      <div className="p-6">{renderContent()}</div>
    </div>
  );
}

// export default React.memo(APIKeyGenerator);
