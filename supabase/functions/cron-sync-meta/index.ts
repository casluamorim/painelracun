import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const META_API_BASE = 'https://graph.facebook.com/v21.0'

interface TokenCheck {
  valid: boolean
  reason?: string
}

async function validateMetaToken(): Promise<TokenCheck> {
  const token = Deno.env.get('META_ACCESS_TOKEN')?.trim()
  const accountId = Deno.env.get('META_AD_ACCOUNT_ID')?.trim()

  if (!token) return { valid: false, reason: 'META_ACCESS_TOKEN não configurado nos segredos.' }
  if (!accountId) return { valid: false, reason: 'META_AD_ACCOUNT_ID não configurado nos segredos.' }

  try {
    const url = `${META_API_BASE}/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(token)}`
    const res = await fetch(url)
    const json = await res.json()

    if (!res.ok || json.error) {
      const err = json.error || {}
      if (err.code === 190) {
        return { valid: false, reason: 'Token do Meta inválido ou mal formatado. Atualize META_ACCESS_TOKEN com um token válido (deve começar com EAA...).' }
      }
      return { valid: false, reason: err.message || 'Erro desconhecido ao validar token.' }
    }

    const info = json.data || {}
    if (info.is_valid === false) {
      return { valid: false, reason: info.error?.message || 'Token Meta inválido ou expirado.' }
    }
    if (info.expires_at && info.expires_at > 0 && info.expires_at <= Math.floor(Date.now() / 1000)) {
      return { valid: false, reason: 'Token do Meta expirou. Gere um novo token e atualize META_ACCESS_TOKEN.' }
    }
    return { valid: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Falha ao contatar API do Meta'
    return { valid: false, reason: `Erro ao validar token: ${msg}` }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get all clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name')

    if (clientsError) throw clientsError
    if (!clients || clients.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No clients to sync' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Calculate date range: yesterday (to get complete day data)
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const dateTo = yesterday.toISOString().split('T')[0]
    const dateFrom = sevenDaysAgo.toISOString().split('T')[0]

    console.log(`Cron sync started: ${dateFrom} to ${dateTo} for ${clients.length} clients`)

    // Pre-flight: validate Meta token ONCE for the whole batch.
    // If invalid, skip all syncs and write a 'skipped' log row per client.
    const tokenCheck = await validateMetaToken()
    if (!tokenCheck.valid) {
      console.warn(`Cron sync aborted — token invalid: ${tokenCheck.reason}`)

      const errorMessage = `Sincronização automática bloqueada: ${tokenCheck.reason}`
      const logRows = clients.map((c) => ({
        client_id: c.id,
        platform: 'meta' as const,
        sync_type: 'auto',
        status: 'skipped',
        period_start: dateFrom,
        period_end: dateTo,
        error_message: errorMessage,
        duration_ms: 0,
      }))

      await supabase.from('sync_logs').insert(logRows)

      return new Response(
        JSON.stringify({
          success: false,
          skipped: true,
          reason: tokenCheck.reason,
          clients_skipped: clients.length,
          period: { from: dateFrom, to: dateTo },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results: Array<{ client: string; success: boolean; error?: string; campaigns_synced?: number; metrics_synced?: number }> = []

    // Call sync-meta-ads for each client
    for (const client of clients) {
      try {
        const syncUrl = `${supabaseUrl}/functions/v1/sync-meta-ads`
        const res = await fetch(syncUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            client_id: client.id,
            date_from: dateFrom,
            date_to: dateTo,
            sync_type: 'auto',
          }),
        })

        const data = await res.json()
        results.push({
          client: client.name,
          success: data.success || false,
          campaigns_synced: data.campaigns_synced,
          metrics_synced: data.metrics_synced,
          error: data.error,
        })

        console.log(`Synced ${client.name}: ${data.success ? 'OK' : data.error}`)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        results.push({ client: client.name, success: false, error: message })
        console.error(`Failed to sync ${client.name}:`, message)
      }
    }

    const response = {
      success: true,
      synced_at: new Date().toISOString(),
      period: { from: dateFrom, to: dateTo },
      results,
    }

    console.log('Cron sync complete:', JSON.stringify(response))

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Cron sync error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
