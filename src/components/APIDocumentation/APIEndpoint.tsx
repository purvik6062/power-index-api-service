"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface ResponseStatus {
  code: number;
  description: string;
}

interface APIEndpoint {
  name: string;
  endpoint: string;
  method: string;
  description: string;
  authRequired: boolean;
  parameters?: Parameter[];
  exampleUrl?: string;
  responseExample?: object;
  responseStatuses: ResponseStatus[];
}

export function APIEndpoint({ api }: { api: APIEndpoint }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(api.endpoint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full border rounded-lg p-4 transition-all duration-300 ease-in-out"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{api.name}</h3>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="mt-2 flex items-center space-x-2">
        <Badge variant="secondary">{api.method}</Badge>
        <Badge variant={api.authRequired ? "default" : "outline"}>
          {api.authRequired ? "Auth Required" : "Public"}
        </Badge>
      </div>
      <AnimatePresence>
        {isOpen && (
          <CollapsibleContent forceMount>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mt-4 space-y-4">
                <p>
                  <strong>Endpoint:</strong> {api.endpoint}

                  <button
                    onClick={handleCopy}
                    className="p-2 mx-3 bg-secondary rounded-md transition-colors"
                    title={copied ? "Copied!" : "Copy endpoint"}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </p>
                <p>
                  <strong>Description:</strong> {api.description}
                </p>
                {api.parameters && (
                  <div>
                    <strong>Parameters:</strong>
                    <ul className="list-disc list-inside mt-2">
                      {api.parameters.map((param, index) => (
                        <li key={index}>
                          <strong>{param.name}</strong> ({param.type}
                          {param.required && ", required"}): {param.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {api.exampleUrl && (
                  <div>
                    <strong>Example URL:</strong>
                    <pre className="p-2 rounded overflow-x-auto mt-2 bg-gray-100 dark:bg-gray-800">
                      <code>{api.exampleUrl}</code>
                    </pre>
                  </div>
                )}
                <div>
                  <strong>Response Status Codes:</strong>
                  <ul className="list-disc list-inside mt-2">
                    {api.responseStatuses.map((status, index) => (
                      <li key={index}>
                        <Badge
                          variant={
                            status.code < 300
                              ? "success"
                              : status.code < 400
                                ? "warning"
                                : "destructive"
                          }
                        >
                          {status.code}
                        </Badge>{" "}
                        {status.description}
                      </li>
                    ))}
                  </ul>
                </div>
                {api.responseExample && (
                  <div>
                    <strong>Response Example:</strong>
                    <pre className="p-2 rounded overflow-x-auto mt-2 bg-gray-100 dark:bg-gray-800">
                      <code>
                        {JSON.stringify(api.responseExample, null, 2)}
                      </code>
                    </pre>
                  </div>
                )}
              </div>
            </motion.div>
          </CollapsibleContent>
        )}
      </AnimatePresence>
    </Collapsible>
  );
}
