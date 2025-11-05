import React from "react";
import NotLoggedScreen from "@/screens/Auth/NotLoggedScreen";

export default function NotLoggedPage() {
  return <NotLoggedScreen />;
}

// Oculta o header desta página específica
export const options = {
  headerShown: false,
};
