"use client";

import { ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
  className?: string;
}

export default function PhoneFrame({ children, className = "" }: PhoneFrameProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative mx-auto w-[280px] sm:w-[320px] lg:w-[340px]">
        {/* Phone body */}
        <div
          className="relative rounded-[50px] p-[8px] sm:rounded-[54px] sm:p-[10px]"
          style={{
            background: "#1d1d1f",
            boxShadow:
              "0 30px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08) inset, 0 2px 0 rgba(255,255,255,0.06) inset",
          }}
        >
          {/* Screen */}
          <div className="relative overflow-hidden rounded-[42px] bg-white sm:rounded-[44px]">
            {/* Dynamic Island */}
            <div className="absolute top-[10px] left-1/2 z-30 -translate-x-1/2">
              <div className="h-[25px] w-[84px] rounded-full bg-black sm:h-[27px] sm:w-[92px]" />
            </div>

            {/* Status bar — sits inside the screen, over content */}
            <div aria-hidden="true" className="relative z-20 flex items-center justify-between px-8 pt-[12px] pb-[2px] sm:pt-[14px]">
              <span className="text-[11px] font-semibold text-black">9:41</span>
              <div className="flex items-center gap-[4px]">
                {/* Signal */}
                <svg className="h-[10px] w-[14px]" viewBox="0 0 17 11" fill="black">
                  <rect x="0" y="8" width="3" height="3" rx="0.5" />
                  <rect x="4.5" y="5.5" width="3" height="5.5" rx="0.5" />
                  <rect x="9" y="3" width="3" height="8" rx="0.5" />
                  <rect x="13.5" y="0" width="3" height="11" rx="0.5" />
                </svg>
                {/* WiFi */}
                <svg className="h-[10px] w-[12px]" viewBox="0 0 16 12" fill="black">
                  <path d="M8 9.6a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4zM8 6c1.66 0 3.14.69 4.2 1.8l-1.26 1.26A3.97 3.97 0 008 7.8c-1.16 0-2.2.5-2.94 1.26L3.8 7.8A5.97 5.97 0 018 6zm0-3.6c2.63 0 5 1.09 6.72 2.85l-1.26 1.27A7.57 7.57 0 008 4.2c-2.2 0-4.18.94-5.46 2.32L1.28 5.25A9.57 9.57 0 018 2.4z" />
                </svg>
                {/* Battery */}
                <div className="flex items-center gap-[1px]">
                  <div className="flex h-[10px] w-[20px] items-center rounded-[2.5px] border-[1.5px] border-black/80 px-[1.5px]">
                    <div className="h-[5px] w-full rounded-[1px] bg-black" />
                  </div>
                  <div className="h-[4px] w-[1.5px] rounded-r-full bg-black/80" />
                </div>
              </div>
            </div>

            {/* Screen content */}
            <div className="relative overflow-hidden bg-white" style={{ aspectRatio: "9/17" }}>
              {children}
            </div>

            {/* Home indicator */}
            <div className="flex items-center justify-center bg-white py-[7px]">
              <div className="h-[5px] w-[110px] rounded-full bg-black/15" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
