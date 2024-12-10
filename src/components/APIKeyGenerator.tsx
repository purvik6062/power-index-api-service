"use client";

import React, { useState, useCallback, useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Copy, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useApiKeyManager } from "@/models/use-api-key-manager";
import { useBalance } from "wagmi";

function APIKeyGenerator() {
  const { apiKeyData, isLoading, error, generateApiKey } = useApiKeyManager();
  const [copiedMessage, setCopiedMessage] = useState("");
  const { ready, authenticated, login } = usePrivy();
  const { isConnected, address } = useAccount();
  const { toast } = useToast();
  const { data: balance } = useBalance({ address });
  const copyAPIKey = useCallback(async () => {
    if (apiKeyData?.key) {
      try {
        await navigator.clipboard.writeText(apiKeyData.key);
        setCopiedMessage("Copied!");
        toast({
          title: "API Key Copied",
          description: "The API key has been copied to your clipboard.",
        });
        setTimeout(() => setCopiedMessage(""), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
        setCopiedMessage("Copy failed");
        toast({
          title: "Copy Failed",
          description: "Failed to copy the API key. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [apiKeyData, toast]);

  const displayState = useMemo(() => {
    if (!ready) return "Checking authentication...";
    if (!isConnected) return "Please connect your wallet";
    if (!authenticated) return "Please log in";
    return null;
  }, [ready, isConnected, authenticated]);

  const renderContent = () => {
    if (displayState) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-gray-500 text-center p-4"
        >
          {displayState}
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-6"
      >
        <Button
          disabled={isLoading}
          onClick={() => generateApiKey()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate New API Key"
          )}
        </Button>

        <AnimatePresence>
          {apiKeyData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={apiKeyData.key}
                  readOnly
                  className="font-mono text-sm"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyAPIKey}
                      >
                        {copiedMessage ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{copiedMessage || "Copy to clipboard"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <dl className="text-sm text-gray-600 space-y-2">
                <div>
                  <dt className="inline font-semibold">Created:</dt>{" "}
                  <dd className="inline">
                    {new Date(apiKeyData.createdAt).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="inline font-semibold">Rate Limit:</dt>{" "}
                  <dd className="inline">{apiKeyData.rateLimit} requests</dd>
                </div>
                <div>
                  <dt className="inline font-semibold">Status:</dt>{" "}
                  <dd className="inline">
                    <Badge
                      variant={apiKeyData.isActive ? "success" : "destructive"}
                    >
                      {apiKeyData.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </dd>
                </div>
                {/* <div>
                  <dt className="inline font-semibold">Balance:</dt>{" "}
                  <dd className="inline">
                    {balance?.value && balance?.decimals
                      ? (
                          Number(balance.value) / Math.pow(10, balance.decimals)
                        ).toLocaleString(undefined, {
                          minimumFractionDigits: balance.decimals,
                          maximumFractionDigits: balance.decimals,
                        })
                      : balance?.value}{" "}
                    {balance?.symbol}
                  </dd>
                </div> */}
              </dl>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-destructive text-sm flex items-center"
          >
            <XCircle className="mr-2 h-4 w-4" /> {error}
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">
          Generate API Key
        </CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}

export default React.memo(APIKeyGenerator);
