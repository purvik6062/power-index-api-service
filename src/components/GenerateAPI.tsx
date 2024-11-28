"use client";
import React, { useState } from "react";

const GenerateAPI = () => {
  const [apiKey, setApiKey] = useState("");
  const [copiedMessage, setCopiedMessage] = useState("");
  const [generatingApiKey, setGeneratingApiKey] = useState(false);

  const generateAPIKey = async () => {
    try {
      setGeneratingApiKey(true);
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        owner: "testing",
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
        "https://power-index-api.vercel.app/api/calculate-temp-cpi?delegatorAddress=0x48a63097e1ac123b1f5a8bbffafa4afa8192fab0&toAddress=0x0374f0273e01841f594a4c0becdf7bfbd9b13a42",
      authRequired: true,
      responseExample: {
        cpi: "Number representing the Temperature Compensation Power Index",
        details: "Additional calculation information",
      },
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Key Generation Section */}
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

              {apiKey && (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={apiKey}
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
              )}

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

        {/* API Documentation Section */}
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
      </div>
    </div>
  );
};

export default GenerateAPI;
