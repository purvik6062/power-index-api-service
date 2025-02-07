"use client";

import React, { useState } from "react";
import APIKeyGenerator from "./APIKeyGenerator/APIKeyGenerator";
import APIDocumentation from "./APIDocumentation/APIDocumentation";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import MobileResponsiveMessage from "./ui/MobileScreenPage";

function APIAndDocumentation() {
  const [activeTab, setActiveTab] = useState("documentation");

  return (
    <>
     {/*  For small screen */}
    <MobileResponsiveMessage/>

   
    <div className="hidden lg:block container mx-auto p-6 max-w-7xl">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center mb-8 text-primary"
      >
        API Documentation & Key Management
      </motion.h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="key-generator">API Key Generator</TabsTrigger>
        </TabsList>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <TabsContent
            value="documentation"
            className="lg:col-span-3 order-2 lg:order-1"
          >
            <ScrollArea className="h-[calc(100vh-200px)]">
              <APIDocumentation />
            </ScrollArea>
          </TabsContent>
          <TabsContent
            value="key-generator"
            className="lg:col-span-3 order-2 lg:order-1"
          >
            <ScrollArea className="h-[calc(100vh-200px)]">
              <APIKeyGenerator />
            </ScrollArea>
          </TabsContent>
          <aside className="lg:col-span-2 order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-secondary p-6 rounded-lg shadow-lg"
            >
              <h2 className="text-2xl font-semibold mb-4">Quick Start Guide</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  Generate an API key in the &quot;API Key Generator&quot; tab
                </li>
                <li>Review the API documentation for available endpoints</li>
                <li>Make API requests using your generated key</li>
                <li>Monitor your usage and rate limits</li>
              </ol>
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
                <p>
                If you have any questions or need assistance, please don&apos;t hesitate to contact our support team at {" "}
                  <a href="https://discord.com/users/743442448868573255" className="text-primary underline" target="_blank" >
                    @chain_l
                  </a>
                  .
                </p>
              </div>
            </motion.div>
          </aside>
        </div>
      </Tabs>
      <footer className="mt-auto py-6 ">
        <div className="container mx-auto px-6 text-center text-sm text-primary">
          Made with ❤️ by{" "}
          <a 
            href="https://lampros.tech" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-muted-foreground hover:underline"
          >
            Lampros Tech
          </a>
          . Generously supported by{" "}
          <a 
            href="https://gov.optimism.io" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-muted-foreground hover:underline"
          >
            Optimism
          </a>
        </div>
      </footer>
    </div>
    </>
  );
}

export default APIAndDocumentation;
