import { useEffect, useState } from "react";
import { errorEmitter } from "../utils/firebase/error-emitter";
import { FirestorePermissionError } from "../utils/firebase/errors";

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It logs errors and can be extended to show alerts or toasts.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // Log the error for debugging
      console.error("Firebase Permission Error:", error.message);

      // Set error in state to trigger a re-render
      setError(error);

      // You can also show a toast/alert here
      // Alert.alert('Erro de Permissão', 'Você não tem permissão para esta operação.');
    };

    errorEmitter.on("permission-error", handleError);

    return () => {
      errorEmitter.off("permission-error", handleError);
    };
  }, []);

  // On re-render, if an error exists in state, you could throw it or handle it
  // For now, we'll just log it and clear it
  useEffect(() => {
    if (error) {
      // Clear error after handling
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // This component renders nothing
  return null;
}
