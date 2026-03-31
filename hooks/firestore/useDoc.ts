import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FirestoreError,
  onSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { errorEmitter } from "../../utils/firebase/error-emitter";
import { FirestorePermissionError } from "../../utils/firebase/errors";

// TIPO AUXILIAR PARA ADICIONAR O ID NO RESULTADO
type WithId<T> = T & { id: string };

// TIPOS DE RETORNO DO HOOK
export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

// HOOK PARA ESCUTAR UM DOCUMENTO DO FIRESTORE EM TEMPO REAL
export function useDoc<T = any>(
  docRef: DocumentReference<DocumentData> | null | undefined
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!docRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          // DOCUMENTO NÃO EXISTE
          setData(null);
        }
        setError(null); // LIMPA ERRO ANTERIOR
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
          operation: "get",
          path: docRef.path,
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false);

        // DISPARA O ERRO GLOBAL
        errorEmitter.emit("permission-error", contextualError);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  return { data, isLoading, error };
}
