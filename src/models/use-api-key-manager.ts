import { useState, useEffect, useCallback, useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";

interface ApiKeyData {
  key: string;
  owner: string;
  rateLimit: number;
  isActive: boolean;
  createdAt: string;
}

export function useApiKeyManager() {
  const [apiKeyData, setApiKeyData] = useState<ApiKeyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isConnected, address } = useAccount();
  const { authenticated } = usePrivy();

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

  const fetchApiKey = useCallback(async () => {
    if (!isConnected || !address || !authenticated) return null;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/api-keys?owner=${address}`);

      if (!response.ok) {
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

  useEffect(() => {
    const loadInitialData = async () => {
      const serverData = await fetchApiKey();

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
