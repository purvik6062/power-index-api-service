import React from "react";
import Image from "next/image";
import cclogo from "@/assets/images/daos/CCLogo.png";

function MobileResponsiveMessage() {
  return (
    <div className="lg:hidden overflow-hidden bg-secondary flex flex-col" style={{ height: 'calc(100vh - 77px)' }}>
      
      <div className="flex-1 flex items-center justify-center px-4 font-poppins">
        <div className="bg-card rounded-lg shadow-md p-6 text-center max-w-sm w-full">
          <div className="mb-6">
            <svg
              className="w-24 h-24 mx-auto text-primary animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="bg-card rounded-xl shadow-lg text-center max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Mobile View Coming Soon!</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Please use a desktop or laptop for the best experience.
        </p>
        <p className="text-muted-foreground font-medium">Thank you!</p>
      </div>
        </div>
      </div>
    </div>
  );
}

export default MobileResponsiveMessage;