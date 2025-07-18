"use client";

import { useState, useEffect, useRef } from 'react';

export function useUIState() {
  // UI state'leri
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [step, setStep] = useState<"departure" | "return">("departure");
  const [loading, setLoading] = useState(false);
  
  // Ref'ler
  const summaryRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Responsive state yönetimi
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return {
    // UI state'leri
    isClient,
    isMobile,
    step,
    loading,
    
    // Setter'lar
    setStep,
    setLoading,
    
    // Ref'ler
    summaryRef,
    searchBoxRef,
  };
} 