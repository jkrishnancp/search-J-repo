import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RSSItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  company?: string;
  location?: string;
}

function parseRSSFeed(xmlText: string): RSSItem[] {
  const items: RSSItem[] = [];

  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  const matches = xmlText.matchAll(itemRegex);

  for (const match of matches) {
    const itemXml = match[1];

    const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i)?.[1] ||
                  itemXml.match(/<title>(.*?)<\/title>/i)?.[1] || '';

    const link = itemXml.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>/i)?.[1] ||
                 itemXml.match(/<link>(.*?)<\/link>/i)?.[1] || '';

    const description = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/i)?.[1] ||
                        itemXml.match(/<description>(.*?)<\/description>/i)?.[1] || '';

    const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/i)?.[1] || '';

    const company = itemXml.match(/<company><!\[CDATA\[(.*?)\]\]><\/company>/i)?.[1] ||
                    itemXml.match(/<company>(.*?)<\/company>/i)?.[1] || '';

    const location = itemXml.match(/<location><!\[CDATA\[(.*?)\]\]><\/location>/i)?.[1] ||
                     itemXml.match(/<location>(.*?)<\/location>/i)?.[1] || '';

    if (title && link) {
      items.push({
        title: title.trim(),
        link: link.trim(),
        description: description.trim(),
        pubDate: pubDate.trim(),
        company: company.trim(),
        location: location.trim(),
      });
    }
  }

  return items;
}

async function ingestRSSSource(
  supabase: any,
  source: any,
  logMessages: string[]
): Promise<{ success: boolean; error?: string; jobsAdded: number }> {
  try {
    logMessages.push(`Processing source: ${source.name} (${source.url})`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let response;
    try {
      response = await fetch(source.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'JobApplyTracker/1.0',
        },
      });
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      const errorMsg = fetchError.name === 'AbortError'
        ? 'Request timeout after 30 seconds'
        : `Fetch error: ${fetchError.message}`;
      logMessages.push(`Error fetching feed: ${errorMsg}`);
      return { success: false, error: errorMsg, jobsAdded: 0 };
    }

    if (!response.ok) {
      const errorMsg = `HTTP error: ${response.status} ${response.statusText}`;
      logMessages.push(errorMsg);
      return { success: false, error: errorMsg, jobsAdded: 0 };
    }

    const xmlText = await response.text();
    logMessages.push(`Fetched feed, parsing XML...`);

    const items = parseRSSFeed(xmlText);
    logMessages.push(`Parsed ${items.length} items from feed`);

    let jobsAdded = 0;

    for (const item of items) {
      const { data: existingJob } = await supabase
        .from('jobs')
        .select('id')
        .eq('url', item.link)
        .maybeSingle();

      if (existingJob) {
        continue;
      }

      let company = item.company;
      if (!company) {
        const titleMatch = item.title.match(/at\s+(.+)$/i);
        if (titleMatch) {
          company = titleMatch[1].trim();
        } else {
          company = 'Unknown Company';
        }
      }

      let jobTitle = item.title;
      if (item.company && item.title.includes(item.company)) {
        jobTitle = item.title.replace(new RegExp(`\\s*at\\s*${item.company}`, 'i'), '').trim();
      }

      const { error: insertError } = await supabase
        .from('jobs')
        .insert({
          title: jobTitle,
          company: company,
          location: item.location || null,
          url: item.link,
          source_id: source.id,
          description: item.description || null,
          date_posted: item.pubDate ? new Date(item.pubDate).toISOString() : null,
        });

      if (!insertError) {
        jobsAdded++;
      }
    }

    logMessages.push(`Added ${jobsAdded} new jobs from ${source.name}`);
    return { success: true, jobsAdded };

  } catch (error: any) {
    const errorMsg = `Unexpected error: ${error.message}`;
    logMessages.push(errorMsg);
    return { success: false, error: errorMsg, jobsAdded: 0 };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const logMessages: string[] = [];
    logMessages.push('Starting RSS ingestion...');

    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('*')
      .eq('type', 'RSS')
      .eq('enabled', true)
      .eq('is_catalog', false)
      .eq('adapter', 'RSS_ATOM');

    if (sourcesError) {
      logMessages.push(`Error fetching sources: ${sourcesError.message}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: sourcesError.message,
          logs: logMessages
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!sources || sources.length === 0) {
      logMessages.push('No enabled RSS sources found');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No enabled RSS sources to process',
          logs: logMessages
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    logMessages.push(`Found ${sources.length} enabled RSS source(s)`);

    let totalJobsAdded = 0;
    const results = [];

    for (const source of sources) {
      const result = await ingestRSSSource(supabase, source, logMessages);

      await supabase
        .from('sources')
        .update({
          last_run_at: new Date().toISOString(),
          last_error: result.error || null,
        })
        .eq('id', source.id);

      totalJobsAdded += result.jobsAdded;
      results.push({
        sourceId: source.id,
        sourceName: source.name,
        success: result.success,
        jobsAdded: result.jobsAdded,
        error: result.error,
      });
    }

    logMessages.push(`Ingestion complete. Total jobs added: ${totalJobsAdded}`);

    return new Response(
      JSON.stringify({
        success: true,
        totalJobsAdded,
        sourcesProcessed: sources.length,
        results,
        logs: logMessages,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error: any) {
    console.error('Error in RSS ingestion:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
