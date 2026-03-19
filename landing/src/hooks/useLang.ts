"use client";

import { useContext } from "react";
import { LangContext } from "@/context/LangContext";

export function useLang() {
  return useContext(LangContext);
}
