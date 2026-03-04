import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const META_API_BASE = 'https://graph.facebook.com/v21.0'

interface MetaCampaign {
  id: string
  name: string
  status: string
  daily_budget?: string
  lifetime_budget?: string
  start_time?: string
  stop_time?: string
}

interface MetaInsight {
  campaign_id: string
  campaign_name: string
  date_start: string
  date_stop: string
  spend: string
  impressions: string
  clicks: string
  conversions?: string
  actions?: Array<{ action_type: string; value: string }>
  action_values?: Array<{ action_type: string; value: string }>
}

function mapMetaStatus(status: string): 'active' | 'paused' | 'completed' {
  switch (status) {
    case 'ACTIVE': return 'active'
    case 'PAUSED': return 'paused'
    default: return 'completed'
  }
}

function extractActionValue(actions: Array<{ action_type: string; value: string }> | undefined, types: string[]): number {
  if (!actions) return 0
  for (const type of types) {
    const action = actions.find(a => a.action_type === type)
    if (action) return Number(action.value) || 0
  }
  return 0
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN')
    if (!META_ACCESS_TOKEN) {
      throw new Error('META_ACCESS_TOKEN não configurado')
    }

    const META_AD_ACCOUNT_ID = Deno.env.get('META_AD_ACCOUNT_ID')
    if (!META_AD_ACCOUNT_ID) {
      throw new Error('META_AD_ACCOUNT_ID não configurado')
    }

    // Parse request body for optional params
    let clientId: string | undefined
    let dateFrom: string | undefined
    let dateTo: string | undefined

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}))
      clientId = body.client_id
      dateFrom = body.date_from
      dateTo = body.date_to
    }

    if (!clientId) {
      throw new Error('client_id é obrigatório')
    }

    // Default date range: last 30 days
    const now = new Date()
    if (!dateTo) {
      dateTo = now.toISOString().split('T')[0]
    }
    if (!dateFrom) {
      const thirtyDaysAgo = new Date(now)
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      dateFrom = thirtyDaysAgo.toISOString().split('T')[0]
    }

    // Ensure account ID starts with act_
    const accountId = META_AD_ACCOUNT_ID.startsWith('act_') 
      ? META_AD_ACCOUNT_ID 
      : `act_${META_AD_ACCOUNT_ID}`

    console.log(`Syncing Meta Ads for account ${accountId}, period: ${dateFrom} to ${dateTo}`)

    // 1. Fetch campaigns from Meta
    const campaignsUrl = `${META_API_BASE}/${accountId}/campaigns?fields=id,name,status,daily_budget,lifetime_budget,start_time,stop_time&limit=500&access_token=${META_ACCESS_TOKEN}`
    const campaignsRes = await fetch(campaignsUrl)
    
    if (!campaignsRes.ok) {
      const errorData = await campaignsRes.json()
      throw new Error(`Meta API error (campaigns): ${JSON.stringify(errorData.error || errorData)}`)
    }
    
    const campaignsData = await campaignsRes.json()
    const metaCampaigns: MetaCampaign[] = campaignsData.data || []

    console.log(`Found ${metaCampaigns.length} campaigns`)

    // 2. Fetch insights (daily breakdown) for all campaigns
    const insightsUrl = `${META_API_BASE}/${accountId}/insights?fields=campaign_id,campaign_name,spend,impressions,clicks,actions,action_values&time_range={"since":"${dateFrom}","until":"${dateTo}"}&time_increment=1&level=campaign&limit=5000&access_token=${META_ACCESS_TOKEN}`
    const insightsRes = await fetch(insightsUrl)
    
    if (!insightsRes.ok) {
      const errorData = await insightsRes.json()
      throw new Error(`Meta API error (insights): ${JSON.stringify(errorData.error || errorData)}`)
    }

    const insightsData = await insightsRes.json()
    const insights: MetaInsight[] = insightsData.data || []

    console.log(`Found ${insights.length} insight rows`)

    // Handle pagination for insights
    let nextPage = insightsData.paging?.next
    while (nextPage) {
      const pageRes = await fetch(nextPage)
      if (!pageRes.ok) break
      const pageData = await pageRes.json()
      insights.push(...(pageData.data || []))
      nextPage = pageData.paging?.next
    }

    // 3. Upsert into Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Build campaign ID map (meta_id -> our_id)
    const campaignIdMap = new Map<string, string>()
    let campaignsSynced = 0
    let metricsSynced = 0

    for (const mc of metaCampaigns) {
      const budget = mc.daily_budget 
        ? Number(mc.daily_budget) / 100 
        : mc.lifetime_budget 
          ? Number(mc.lifetime_budget) / 100 
          : null

      // Check if campaign already exists by name + platform + client
      const { data: existing } = await supabase
        .from('campaigns')
        .select('id')
        .eq('client_id', clientId)
        .eq('platform', 'meta')
        .eq('name', mc.name)
        .maybeSingle()

      let campaignId: string

      if (existing) {
        campaignId = existing.id
        // Update existing campaign
        await supabase
          .from('campaigns')
          .update({
            status: mapMetaStatus(mc.status),
            budget,
            start_date: mc.start_time ? mc.start_time.split('T')[0] : dateFrom,
            end_date: mc.stop_time ? mc.stop_time.split('T')[0] : null,
          })
          .eq('id', campaignId)
      } else {
        // Insert new campaign
        const { data: newCampaign, error } = await supabase
          .from('campaigns')
          .insert({
            client_id: clientId,
            platform: 'meta',
            name: mc.name,
            status: mapMetaStatus(mc.status),
            budget,
            start_date: mc.start_time ? mc.start_time.split('T')[0] : dateFrom,
            end_date: mc.stop_time ? mc.stop_time.split('T')[0] : null,
          })
          .select('id')
          .single()

        if (error) {
          console.error(`Error inserting campaign ${mc.name}:`, error)
          continue
        }
        campaignId = newCampaign.id
      }

      campaignIdMap.set(mc.id, campaignId)
      campaignsSynced++
    }

    // 4. Upsert daily metrics
    for (const insight of insights) {
      const campaignId = campaignIdMap.get(insight.campaign_id)
      if (!campaignId) {
        console.warn(`No campaign mapping for Meta campaign ${insight.campaign_id}`)
        continue
      }

      const conversions = extractActionValue(insight.actions, [
        'offsite_conversion.fb_pixel_purchase',
        'purchase',
        'omni_purchase',
        'complete_registration',
      ])

      const leads = extractActionValue(insight.actions, [
        'lead',
        'offsite_conversion.fb_pixel_lead',
        'onsite_conversion.lead_grouped',
      ])

      const revenue = extractActionValue(insight.action_values, [
        'offsite_conversion.fb_pixel_purchase',
        'purchase',
        'omni_purchase',
      ])

      const metricDate = insight.date_start

      // Check if metric exists for this campaign + date
      const { data: existingMetric } = await supabase
        .from('daily_metrics')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('date', metricDate)
        .maybeSingle()

      const metricData = {
        campaign_id: campaignId,
        client_id: clientId,
        date: metricDate,
        spend: Number(insight.spend) || 0,
        impressions: Number(insight.impressions) || 0,
        clicks: Number(insight.clicks) || 0,
        conversions,
        leads,
        revenue,
      }

      if (existingMetric) {
        await supabase
          .from('daily_metrics')
          .update(metricData)
          .eq('id', existingMetric.id)
      } else {
        const { error } = await supabase
          .from('daily_metrics')
          .insert(metricData)

        if (error) {
          console.error(`Error inserting metric for ${metricDate}:`, error)
          continue
        }
      }

      metricsSynced++
    }

    const result = {
      success: true,
      campaigns_synced: campaignsSynced,
      metrics_synced: metricsSynced,
      period: { from: dateFrom, to: dateTo },
    }

    console.log('Sync complete:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Sync error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
