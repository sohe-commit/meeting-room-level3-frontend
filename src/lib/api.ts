// 백엔드 주소. 비밀값이 아니므로 NEXT_PUBLIC_ 으로 둔다. (GPT 키 같은 비밀값은 백엔드에만 있음)
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4100"
).replace(/\/$/, "");

const TOKEN_KEY = "meeting-room-token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // 저장소를 못 쓰는 브라우저면 이번 화면에서만 로그인 유지
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** 백엔드 호출. 실패하면 백엔드가 보낸 쉬운 안내 문구를 담은 ApiError 를 던진다. */
export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(
      "서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.",
      0,
    );
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const raw = data?.message;
    const message =
      (Array.isArray(raw) ? raw[0] : raw) || "요청을 처리하지 못했어요.";
    if (res.status === 401 && token) {
      setToken(null);
      window.dispatchEvent(new Event("auth-expired"));
    }
    throw new ApiError(message, res.status);
  }
  return data as T;
}

/** 빈 값은 빼고 쿼리 문자열을 만든다. */
export function query(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "" && value !== false) {
      search.set(key, String(value));
    }
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}
