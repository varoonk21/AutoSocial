import React from "react";

export function FacebookLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        d="M15.5 12h-2.3v8h-3.3v-8H8.5V9.3h1.4V7.5c0-2.2 1.3-3.5 3.4-3.5H15.8v2.7h-1.4c-1 0-1.2.4-1.2 1.2v1.4h2.6L15.5 12z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function InstagramLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ig-brand-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-brand-gradient)" />
      <circle cx="12" cy="12" r="3.5" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="#FFFFFF" />
      <rect x="4.5" y="4.5" width="15" height="15" rx="4" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
    </svg>
  );
}
