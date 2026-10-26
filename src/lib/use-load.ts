"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "./api";

interface LoadState<T> {
  key: string;
  data: T | null;
  error: string | null;
}

/**
 * 화면에 필요한 데이터를 불러오고, 불러오는 중/실패 상태를 함께 돌려준다.
 * deps 값이 바뀌거나 reload() 를 부르면 다시 불러온다.
 */
export function useLoad<T>(load: () => Promise<T>, deps: unknown[]) {
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });

  const [version, setVersion] = useState(0);
  const requestKey = `${JSON.stringify(deps)}#${version}`;
  const [state, setState] = useState<LoadState<T>>({ key: "", data: null, error: null });

  useEffect(() => {
    let alive = true;
    loadRef.current().then(
      (data) => alive && setState({ key: requestKey, data, error: null }),
      (e: unknown) =>
        alive &&
        setState((prev) => ({
          key: requestKey,
          data: prev.data,
          error: e instanceof ApiError ? e.message : "데이터를 불러오지 못했어요.",
        })),
    );
    return () => {
      alive = false;
    };
  }, [requestKey]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const setData = useCallback((data: T) => setState((prev) => ({ ...prev, data })), []);

  return {
    data: state.data,
    error: state.error,
    loading: state.key !== requestKey,
    reload,
    setData,
  };
}
