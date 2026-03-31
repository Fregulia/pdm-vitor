import {
  CollectionReference,
  DocumentData,
  FirestoreError,
  Query,
  QuerySnapshot,
  onSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { errorEmitter } from "../../utils/firebase/error-emitter";
import { FirestorePermissionError } from "../../utils/firebase/errors";

// TIPO AUXILIAR PARA ADICIONAR O ID NO RESULTADO
export type WithId<T> = T & { id: string };

// TIPOS DE RETORNO DO HOOK
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

// INTERFACE INTERNA PARA PEGAR O CAMINHO DA QUERY
interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    };
  };
}

// HOOK PARA ESCUTAR UMA COLLECTION OU QUERY DO FIRESTORE EM TEMPO REAL
export function useCollection<T = any>(
  targetRefOrQuery:
    | CollectionReference<DocumentData>
    | Query<DocumentData>
    | null
    | undefined
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!targetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      targetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: ResultItemType[] = [];
        for (const doc of snapshot.docs) {
          results.push({ ...(doc.data() as T), id: doc.id });
        }
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        // PEGA O CAMINHO SEJA COLLECTION OU QUERY
        const path: string =
          targetRefOrQuery.type === "collection"
            ? (targetRefOrQuery as CollectionReference).path
            : (
                targetRefOrQuery as unknown as InternalQuery
              )._query.path.canonicalString();

        const contextualError = new FirestorePermissionError({
          operation: "list",
          path,
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false);

        // DISPARA O ERRO GLOBAL
        errorEmitter.emit("permission-error", contextualError);
      }
    );

    return () => unsubscribe();
  }, [targetRefOrQuery]);

  return { data, isLoading, error };
}
