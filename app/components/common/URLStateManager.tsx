'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface URLState {
  [key: string]: string;
}

interface URLStateManagerProps {
  statePrefix: string;
  initialState?: URLState;
  onStateChange?: (state: URLState) => void;
  childrenAction: (state: URLState, setState: (key: string, value: string) => void) => React.ReactNode;
}

export default function URLStateManager({
  statePrefix,
  initialState = {},
  onStateChange,
  childrenAction
}: URLStateManagerProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  // Parse URL state
  const loadStateFromURL = (): URLState => {
    const state: URLState = {};
    
    // Look for all URL params with the prefix
    if (searchParams) {
      searchParams.forEach((value, key) => {
        if (key.startsWith(`${statePrefix}_`)) {
          const stateKey = key.replace(`${statePrefix}_`, '');
          state[stateKey] = value;
        }
      });
    }
    
    return state;
  };
  
  // Initial state is from URL or provided initial state
  const [state, setState] = useState<URLState>(() => {
    const urlState = loadStateFromURL();
    return { ...initialState, ...urlState };
  });
  
  // Update component state when URL changes
  useEffect(() => {
    const urlState = loadStateFromURL();
    setState(prev => ({ ...prev, ...urlState }));
  }, [searchParams]);
  
  // Update URL when state changes
  useEffect(() => {
    // Only update URL if state changed from initial
    const urlState = loadStateFromURL();
    const stateChanged = Object.keys(state).some(key => 
      state[key] !== urlState[key]
    );
    
    if (stateChanged) {
      const params = new URLSearchParams();
      
      // Keep existing params that don't start with our prefix
      if (searchParams) {
        searchParams.forEach((value, key) => {
          if (!key.startsWith(`${statePrefix}_`)) {
            params.set(key, value);
          }
        });
      }
      
      // Add our state to params
      Object.entries(state).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(`${statePrefix}_${key}`, value);
        }
      });
      
      // Replace URL with new params
      router.replace(`${pathname}?${params.toString()}`);
      
      // Call onStateChange callback if provided
      if (onStateChange) {
        onStateChange(state);
      }
    }
  }, [state, pathname, router, onStateChange, statePrefix, searchParams]);
  
  // Function to update a single state key
  const updateState = (key: string, value: string) => {
    setState(prev => ({ ...prev, [key]: value }));
  };
  
  return <>{childrenAction(state, updateState)}</>;
}
