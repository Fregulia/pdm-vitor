import { Redirect } from "expo-router";

// Joga pro preload que decide pra qual tela o usuário vai
export default function Index() {
  return <Redirect href={{ pathname: "/preload" } as any} />;
}
