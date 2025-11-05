import { Redirect } from "expo-router";

// ROTA INICIAL REDIRECIONA PARA A TELA DE LOGIN
export default function Index() {
  return <Redirect href="/auth/signin" />;
}
