"use client";
import React from "react";

function APIDocumentation() {
  // Sample API documentation data
  const apiDocumentation = [
    {
      name: "Get Calculated Concentration Power Index (CPI) Value",
      endpoint: "/api/calculate-cpi",
      method: "GET",
      description: "Retrieve calculated CPI value",
      authRequired: true,
    },
    {
      name: "Temporary Concentration Power Index (CPI) Calculator",
      endpoint: "/api/calculate-temp-cpi",
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
      responseExample: {
        cpi: "Number representing the Temperature Compensation Power Index",
        details: "Additional calculation information",
      },
    },
  ];

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">
          API Documentation
        </h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {apiDocumentation.map((api, index) => (
            <div
              key={index}
              className="border rounded p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{api.name}</h3>
                <span
                  className={`
                    px-2 py-1 rounded text-xs 
                    ${
                      api.authRequired
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }
                  `}
                >
                  {api.authRequired ? "Auth Required" : "Public"}
                </span>
              </div>
              <div className="text-sm space-y-2">
                <p>
                  <strong>Endpoint:</strong> {api.endpoint}
                </p>
                <p>
                  <strong>Method:</strong> {api.method}
                </p>
                <p>
                  <strong>Description:</strong> {api.description}
                </p>

                {api.parameters && (
                  <div>
                    <strong>Parameters:</strong>
                    <ul className="list-disc list-inside">
                      {api.parameters.map((param, paramIndex) => (
                        <li key={paramIndex}>
                          <strong>{param.name}</strong> ({param.type}):{" "}
                          {param.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {api.exampleUrl && (
                  <div>
                    <strong>Example URL:</strong>
                    <div className="bg-gray-100 p-2 rounded overflow-x-auto">
                      <a
                        href={api.exampleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {api.exampleUrl}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default APIDocumentation;
