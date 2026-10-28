import { useCallback, useEffect, useState } from "react";
import { fallbackSiteContent } from "@/lib/site-content";
import { fetchSiteContent } from "@/services/api";

/**
 * Hook React para consumo assíncrono dos dados do Portal Público:
 * - Na Entrega 1: consome `/mock/galeria.json`, `/mock/apoiadores.json` e `/mock/institucional.json`
 * - Na Entrega 2: consome automaticamente `GET /galeria` e `GET /apoiadores` da API Flask
 * - Na Entrega 3: já inclui deduplicação de chamadas, timeout de rede e fallback acessível (60+)
 */
export function useSiteContent() {
  const [content, setContent] = useState(fallbackSiteContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadContent = useCallback(async ({ forceRefresh = false } = {}) => {
    setLoading(true);
    try {
      const data = await fetchSiteContent({ forceRefresh });
      setContent(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err);
      return fallbackSiteContent;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    fetchSiteContent()
      .then((data) => {
        if (active) {
          setContent(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    ...content,
    loading,
    error,
    refresh: () => loadContent({ forceRefresh: true }),
  };
}

export default useSiteContent;