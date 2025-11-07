import NotLoggedScreen from "@/app/screens/Auth/NotLoggedScreen";
import React from "react";

export default function NotLoggedPage() {
  return <NotLoggedScreen />;
}

// Oculta o header desta página específica
export const options = {
  headerShown: false,
};
