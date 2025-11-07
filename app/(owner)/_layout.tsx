import { Stack } from "expo-router";
import React from "react";

// Owner group root layout: use a Stack, and nest tabs in a child group
export default function OwnerStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
