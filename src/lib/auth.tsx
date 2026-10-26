"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ApiError, api, getToken, setToken } from "./api";
import type { User } from "./types";

interface AuthState {
  user: User | null;
  ready: boolean;
  /** 저장된 로그인은 있는데 서버에 연결하지 못한 상태 */
  offline: boolean;
  retry: () => void;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const [offline, setOffline] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // 저장된 로그인 증표가 있으면 내 정보를 불러온다.
  // 서버가 거절했을 때만 로그아웃하고, 서버에 닿지 못했을 때(잠깐 꺼짐 등)는 증표를 지키고 다시 시도하게 한다.
  useEffect(() => {
    const check = getToken()
      ? api<User>("/auth/me").then(
          (me) => {
            setUser(me);
            setOffline(false);
          },
          (e: unknown) => {
            if (e instanceof ApiError && e.status === 0) setOffline(true);
            else setToken(null);
          },
        )
      : Promise.resolve();
    check.finally(() => setReady(true));
  }, [attempt]);

  const retry = useCallback(() => {
    setOffline(false);
    setReady(false);
    setAttempt((a) => a + 1);
  }, []);

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener("auth-expired", onExpired);
    return () => window.removeEventListener("auth-expired", onExpired);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api<{ accessToken: string; user: User }>(
      "/auth/login",
      { method: "POST", body: { email, password } },
    );
    setToken(result.accessToken);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, offline, retry, login, logout }),
    [user, ready, offline, retry, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider 안에서만 쓸 수 있어요.");
  return ctx;
}
