"use client";

import { useState, useCallback } from "react";
import type { AgentPersona } from "@callmemaybe/agent-config";

const STORAGE_KEY = "agent-persona";

const DEFAULT_PERSONA: AgentPersona = {
  ownerName: "",
};

function safeReadPersona(): AgentPersona {
  try {
    if (typeof window === "undefined") return DEFAULT_PERSONA;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PERSONA;
    return JSON.parse(raw) as AgentPersona;
  } catch {
    return DEFAULT_PERSONA;
  }
}

export function usePersona() {
  const [persona, setPersona] = useState<AgentPersona>(()=>safeReadPersona());

  // Save to localStorage whenever persona changes
  const savePersona = useCallback((newPersona: AgentPersona) => {
    setPersona(newPersona);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPersona));
  }, []);

  const updateField = useCallback(<K extends keyof AgentPersona>(
    field: K,
    value: AgentPersona[K]
  ) => {
    setPersona((prev) => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isConfigured = Boolean(persona.ownerName?.trim());

  return {
    persona,
    // isLoaded,
    isConfigured,
    savePersona,
    updateField,
  };
}
