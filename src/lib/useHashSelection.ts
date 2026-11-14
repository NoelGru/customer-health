import { useCallback, useEffect, useState } from "react";

// Der ausgewählte Kunde steht in der Adresse, z. B. ".../#/kunde/c07".
// So kann man einen Kunden direkt verlinken, und "Zurück" im Browser funktioniert.

const parse = (hash: string) => /^#\/kunde\/([\w-]+)$/.exec(hash)?.[1] ?? null;

export function useHashSelection(): [string | null, (id: string | null) => void] {
  const [id, setId] = useState(() => parse(window.location.hash));

  useEffect(() => {
    const onChange = () => setId(parse(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const select = useCallback((next: string | null) => {
    window.location.hash = next ? `/kunde/${next}` : "/";
  }, []);

  return [id, select];
}
