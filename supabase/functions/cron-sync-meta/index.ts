import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
