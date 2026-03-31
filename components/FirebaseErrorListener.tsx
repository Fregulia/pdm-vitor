import { useEffect, useState } from "react";
import { errorEmitter } from "../utils/firebase/error-emitter";
import { FirestorePermissionError } from "../utils/firebase/errors";

// COMPONENTE INVISÍVEL QUE ESCUTA ERROS DE PERMISSÃO DO FIREBASE
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // LOGA O ERRO E ATUALIZA O ESTADO
      console.error("Firebase Permission Error:", error.message);

      setError(error);
    };

    errorEmitter.on("permission-error", handleError);

    return () => {
      errorEmitter.off("permission-error", handleError);
    };
  }, []);

  // LIMPA O ERRO APÓS ALGUNS SEGUNDOS
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // NÃO RENDERIZA NADA
  return null;
}
