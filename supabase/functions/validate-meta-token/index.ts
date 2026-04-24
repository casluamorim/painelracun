const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const META_API_BASE = 'https://graph.facebook.com/v21.0'

interface ValidationResult {
  valid: boolean
  error?: string
  error_code?: number
  error_subcode?: number
  account_id?: string
  account_name?: string
  account_status?: number
  expires_at?: number | null
  scopes?: string[]
  app_id?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const result: ValidationResult = { valid: false }

  try {
    const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN')?.trim()
    const META_AD_ACCOUNT_ID = Deno.env.get('META_AD_ACCOUNT_ID')?.trim()

    if (!META_ACCESS_TOKEN) {
      result.error = 'META_ACCESS_TOKEN não está configurado nos segredos.'
      return json(result, 200)
    }

    if (!META_AD_ACCOUNT_ID) {
      result.error = 'META_AD_ACCOUNT_ID não está configurado nos segredos.'
      return json(result, 200)
    }

    // 1. Inspect the token via debug_token (uses access_token as both input + auth)
    const debugUrl = `${META_API_BASE}/debug_token?input_token=${encodeURIComponent(META_ACCESS_TOKEN)}&access_token=${encodeURIComponent(META_ACCESS_TOKEN)}`
    const debugRes = await fetch(debugUrl)
    const debugData = await debugRes.json()

    if (!debugRes.ok || debugData.error) {
      const err = debugData.error || {}
      result.error = friendlyMetaError(err)
      result.error_code = err.code
      result.error_subcode = err.error_subcode
      return json(result, 200)
    }

    const tokenInfo = debugData.data || {}

    if (tokenInfo.is_valid === false) {
      const err = tokenInfo.error || {}
      result.error = err.message
        ? `Token inválido: ${err.message}`
        : 'Token inválido ou expirado.'
      result.error_code = err.code
      result.error_subcode = err.subcode
      result.expires_at = tokenInfo.expires_at ?? null
      return json(result, 200)
    }

    result.expires_at = tokenInfo.expires_at ?? null
    result.scopes = tokenInfo.scopes || []
    result.app_id = tokenInfo.app_id

    // Check expiration explicitly (some tokens still report valid but expire imminently)
    if (tokenInfo.expires_at && tokenInfo.expires_at > 0) {
      const nowSec = Math.floor(Date.now() / 1000)
      if (tokenInfo.expires_at <= nowSec) {
        result.error = 'Token do Meta expirou. Gere um novo token e atualize o segredo META_ACCESS_TOKEN.'
        return json(result, 200)
      }
    }

    // 2. Verify the ad account is reachable with this token
    const accountId = META_AD_ACCOUNT_ID.startsWith('act_')
      ? META_AD_ACCOUNT_ID
      : `act_${META_AD_ACCOUNT_ID}`

    const accountUrl = `${META_API_BASE}/${accountId}?fields=id,name,account_status&access_token=${encodeURIComponent(META_ACCESS_TOKEN)}`
    const accountRes = await fetch(accountUrl)
    const accountData = await accountRes.json()

    if (!accountRes.ok || accountData.error) {
      const err = accountData.error || {}
      result.error = `Não foi possível acessar a conta de anúncios ${accountId}: ${friendlyMetaError(err)}`
      result.error_code = err.code
      result.error_subcode = err.error_subcode
      return json(result, 200)
    }

    result.valid = true
    result.account_id = accountData.id
    result.account_name = accountData.name
    result.account_status = accountData.account_status

    return json(result, 200)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erro desconhecido ao validar token'
    return json({ valid: false, error: message }, 200)
  }
})

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function friendlyMetaError(err: { code?: number; message?: string; error_subcode?: number }): string {
  if (!err) return 'Erro desconhecido do Meta'
  if (err.code === 190) {
    if (err.error_subcode === 463) return 'Token do Meta expirou. Gere um novo no Graph API Explorer.'
    if (err.error_subcode === 467) return 'Token do Meta foi invalidado. Gere um novo token.'
    return 'Token do Meta inválido ou mal formatado. Verifique o valor salvo em META_ACCESS_TOKEN (sem espaços, deve começar com EAA...).'
  }
  if (err.code === 200) return 'Token sem permissão para acessar essa conta. Garanta os escopos ads_read e ads_management.'
  if (err.code === 100) return 'Conta de anúncios inválida. Verifique META_AD_ACCOUNT_ID.'
  return err.message || 'Erro desconhecido do Meta'
}