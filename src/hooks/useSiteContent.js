import { useCallback, useEffect, useState } from "react";
import {
  getApoiadores,
  getCategorias,
  getEstatisticas,
  getMidias,
  getMidiasRecentes,
} from "@/services/api";
import { sortGalleryItems } from "@/lib/media-utils";

export function useHomeData() {
  const [recentMoments, setRecentMoments] = useState([]);
  const [supporters, setSupporters] = useState([]);
  const [loadingMoments, setLoadingMoments] = useState(true);
  const [loadingSupporters, setLoadingSupporters] = useState(true);
  const [momentsError, setMomentsError] = useState(null);
  const [supportersError, setSupportersError] = useState(null);

  const load = useCallback(async (signal) => {
    setLoadingMoments(true);
    setLoadingSupporters(true);

    const [momentsRes, supportersRes] = await Promise.allSettled([
      getMidiasRecentes({ signal }),
      getApoiadores({ signal }),
    ]);

    if (signal?.aborted) return;

    if (momentsRes.status === "fulfilled") {
      setRecentMoments(momentsRes.value);
      setMomentsError(null);
    } else {
      setRecentMoments([]);
      setMomentsError(momentsRes.reason);
    }
    setLoadingMoments(false);

    if (supportersRes.status === "fulfilled") {
      setSupporters(supportersRes.value);
      setSupportersError(null);
    } else {
      setSupporters([]);
      setSupportersError(supportersRes.reason);
    }
    setLoadingSupporters(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return {
    recentMoments,
    supporters,
    loadingMoments,
    loadingSupporters,
    momentsError,
    supportersError,
    refresh: () => load(),
  };
}

export function useGalleryData() {
  const [midias, setMidias] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError(null);

    try {
      const [midiasData, categoriasData] = await Promise.all([
        getMidias({}, { signal }),
        getCategorias({ signal }),
      ]);
      if (signal?.aborted) return;
      setMidias(sortGalleryItems(midiasData));
      setCategorias(categoriasData);
    } catch (err) {
      if (err?.name === "AbortError" || signal?.aborted) return;
      setMidias([]);
      setCategorias([]);
      setError(err);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const updateMidiaViews = useCallback((id, visualizacoes) => {
    setMidias((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, visualizacoes } : item
      )
    );
  }, []);

  return {
    midias,
    categorias,
    loading,
    error,
    refresh: () => load(),
    updateMidiaViews,
  };
}

export function useSupportersData() {
  const [supporters, setSupporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getApoiadores({ signal });
      if (signal?.aborted) return;
      setSupporters(data);
    } catch (err) {
      if (err?.name === "AbortError" || signal?.aborted) return;
      setSupporters([]);
      setError(err);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const updateSupporterViews = useCallback((id, visualizacoes) => {
    setSupporters((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, visualizacoes } : item
      )
    );
  }, []);

  return {
    supporters,
    loading,
    error,
    refresh: () => load(),
    updateSupporterViews,
  };
}

export function useStatsData() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEstatisticas({ signal });
      if (signal?.aborted) return;
      setStats(data);
    } catch (err) {
      if (err?.name === "AbortError" || signal?.aborted) return;
      setStats(null);
      setError(err);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return {
    stats,
    loading,
    error,
    refresh: () => load(),
  };
}