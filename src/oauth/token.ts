export interface QwenTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
  resource_url?: string
}

export const CLIENT_ID = "f0304373b74a44d2b584a3fb70ca9e56"
export const TOKEN_URL = "https://chat.qwen.ai/api/v1/oauth2/token"

export async function refreshQwenToken(refreshToken: string): Promise<QwenTokenResponse> {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    }).toString(),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "")
    if (response.status === 400) {
      throw new Error(`Qwen refresh token expired or invalid. Please re-authenticate. ${errorText}`)
    }
    throw new Error(`Qwen token refresh failed: ${response.status} ${errorText}`)
  }

  return response.json() as Promise<QwenTokenResponse>
}
