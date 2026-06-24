import { getAuthHeaders, refresh, clearToken, getRefreshToken } from '../api/auth';

let refreshing: Promise<void> | null = null;

function injectAuth(init?: RequestInit): RequestInit {
  return {
    ...init,
    // Authorization은 항상 마지막에 주입 — retry 시 fresh token이 stale token을 덮어씀
    headers: { ...(init?.headers as Record<string, string>), ...getAuthHeaders() },
  };
}

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, injectAuth(init));
  if (res.status !== 401) return res;

  // 비로그인 상태(리프레시 토큰 없음) — redirect 없이 401 그대로 반환
  if (!getRefreshToken()) return res;

  // 동시 다발 401 시 refresh를 단 한 번만 호출
  if (!refreshing) {
    refreshing = refresh()
      .then(() => {})
      .catch(() => { clearToken(); window.location.replace('/fan'); })
      .finally(() => { refreshing = null; });
  }
  await refreshing;

  // 새 token으로 1회 재시도
  return fetch(input, injectAuth(init));
}
