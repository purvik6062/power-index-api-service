"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { APIEndpoint } from "./APIEndpoint";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function APIDocumentation() {
  const apiStatus = "Operational";
  const apiVersion = "v1.0.0";

  // Sample API documentation data
  const apiDocumentation = [
    {
      name: "Get Calculated Concentration Power Index (CPI) Value",
      endpoint: "https://docs.daocpi.com/api/calculate-cpi",
      method: "GET",
      description: "Retrieve calculated CPI values for different dates.",
      authRequired: true,
      responseStatuses: [
        { code: 200, description: "Successful response with CPI data" },
        { code: 400, description: "Bad request - Invalid parameters" },
        { code: 401, description: "Unauthorized - Invalid or missing API key" },
        { code: 500, description: "Internal server error" },
      ],
      responseExample: {
        results: [
          {
            date: "2024-03-15",
            cpi: 0.123456,
            activeCouncils: ["th_vp", "ch_vp_r6", "gc_vp_s6"],
            councilPercentages: {
              active: 77.07,
              inactive: 22.93,
              redistributed: {
                "Token House": 38.97,
                "Citizen House": 41.69,
                "Grants Council": 12.24,
              },
              originalPercentages: {
                "Token House": 32.33,
                "Citizen House": 34.59,
                "Grants Council": 10.15,
                "Grants Council (Milestone & Metrics Sub-committee)": 2.82,
                "Security Council": 12.78,
                "Code of Conduct Council": 4.32,
                "Developer Advisory Board": 3.01,
              },
            },
            activeRedistributed: {
              "Token House": 38.97,
              "Citizen House": 41.69,
              "Grants Council": 12.24,
            },
            filename: "2024-03-15",
          },
        ],
      },
    },
    {
      name: "Temporary Concentration Power Index (CPI) Calculator",
      endpoint: "https://docs.daocpi.com/api/calculate-temp-cpi",
      method: "GET",
      description:
        "Calculate the Temporary Concentration Power Index (CPI) for a given delegator and destination address. This API helps analyze the performance and efficiency of blockchain delegations by taking into account Temporary-based Concentration factors.",
      parameters: [
        {
          name: "delegatorAddress",
          type: "string",
          required: true,
          description: "Ethereum address of the delegator",
        },
        {
          name: "toAddress",
          type: "string",
          required: true,
          description: "Destination Ethereum address for the delegation",
        },
      ],
      exampleUrl:
        "https://api.daocpi.com/api/calculate-temp-cpi?delegatorAddress={{delegatorAddress}}&toAddress={{toAddress}}",
      authRequired: true,
      responseStatuses: [
        {
          code: 200,
          description: "Successful response with temporary CPI data",
        },
        { code: 400, description: "Bad request - Invalid parameters" },
        { code: 401, description: "Unauthorized - Invalid or missing API key" },
        { code: 500, description: "Internal server error" },
      ],
      responseExample: {
        results: [
          {
            date: "2024-03-15",
            cpi: 0.123456,
            activeCouncils: ["th_vp", "ch_vp_r6", "gc_vp_s6"],
            councilPercentages: {
              active: 77.07,
              inactive: 22.93,
              redistributed: {
                "Token House": 38.97,
                "Citizen House": 41.69,
                "Grants Council": 12.24,
              },
              originalPercentages: {
                "Token House": 32.33,
                "Citizen House": 34.59,
                "Grants Council": 10.15,
                "Grants Council (Milestone & Metrics Sub-committee)": 2.82,
                "Security Council": 12.78,
                "Code of Conduct Council": 4.32,
                "Developer Advisory Board": 3.01,
              },
            },
            activeRedistributed: {
              "Token House": 38.97,
              "Citizen House": 41.69,
              "Grants Council": 12.24,
            },
            filename: "2024-03-15",
            updatedAddresses: [
              {
                address: "0x1234...",
                newVotingPower: "100.5",
              },
              {
                address: "0x5678...",
                newVotingPower: "200.75",
              },
            ],
          },
        ],
      },
    },
    {
      name: "Historic Concentration Power Index (CPI)",
      endpoint: "https://docs.daocpi.com/api/historic-cpi",
      method: "GET",
      description: "Contains CPI data for all recorded years, showing changes over time.",
      authRequired: true,
      responseStatuses: [
        { code: 200, description: "Successful response with historic CPI data" },
        { code: 400, description: "Bad request - Invalid parameters" },
        { code: 401, description: "Unauthorized - Invalid or missing API key" },
        { code: 500, description: "Internal server error" },
      ],
      responseExample: {
        results:[
          {
            "date": "2024-11-30T00:00:00.000Z",
            "HHI": 220.72,
            "CPI": 67.85
          },
          {
            "date": "2024-11-29T00:00:00.000Z",
            "HHI": 218.82,
            "CPI": 67.7
          },
          {
            "date": "2024-11-28T00:00:00.000Z",
            "HHI": 218.68,
            "CPI": 67.68
          },
          {
            "date": "2024-11-27T00:00:00.000Z",
            "HHI": 220.95,
            "CPI": 67.86
          },
          {
            "date": "2024-11-26T00:00:00.000Z",
            "HHI": 220.95,
            "CPI": 67.87
          }
        ]
      },
    },
    {
      name: "Historic Concentration Power Index (CPI) Data for a Specific Date",
      endpoint: "https://docs.daocpi.com/api/historic-cpi?date=yyyy-mm-dd",
      method: "GET",
      description: "Provides CPI data for a chosen date.",
      parameters: [
        {
          name: "Date",
          type: "string",
          required: true,
          description: "Date in the format 'yyyy-mm-dd'",
        }
      ],
      exampleUrl:
        "https://api.daocpi.com/api/historic-cpi?date={{date}}",
      authRequired: true,
      responseStatuses: [
        { code: 200, description: "Successful response with historic CPI data" },
        { code: 400, description: "Bad request - Invalid parameters" },
        { code: 401, description: "Unauthorized - Invalid or missing API key" },
        { code: 500, description: "Internal server error" },
      ],
      responseExample: {
        results:[
          {
            "date": "2024-11-30T00:00:00.000Z",
            "HHI": 220.72,
            "CPI": 67.85
          },
        ]
      },
    }
  ];

  return (
    <Card className="w-full max-w-[45rem] mx-auto">
      <CardHeader>
        <motion.div
          className="flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardTitle className="text-2xl font-bold">
            API Documentation
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge
              variant={apiStatus === "Operational" ? "default" : "destructive"}
            >
              {apiStatus}
            </Badge>
            <Badge variant="outline">{apiVersion}</Badge>
          </div>
        </motion.div>
        <CardDescription>
          Explore and integrate with our Concentration Power Index (CPI)
          calculation APIs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {apiDocumentation.map((api, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <APIEndpoint api={api} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default APIDocumentation;
