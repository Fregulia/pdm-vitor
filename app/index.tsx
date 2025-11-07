import { Redirect } from "expo-router";

// Redireciona sempre para o preload, que decide a rota (landing/login/tabs)
export default function Index() {
  return <Redirect href={{ pathname: "/preload" } as any} />;
}
