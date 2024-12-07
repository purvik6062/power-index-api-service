"use client";
import React from "react";
import APIKeyGenerator from "./APIKeyGenerator";
import APIDocumentation from "./APIDocumentation";

function APIAndDocumentation() {
  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <APIKeyGenerator />
        <APIDocumentation />
      </div>
    </div>
  );
}

export default APIAndDocumentation;
