import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const allowedOrigins = new Set(["https://sergiogimeenez18-coder.github.io"]);
const groups = ["aves", "mamiferos", "reptiles", "anfibios", "insectos", "peces", "otros"];

function headers(origin: string | null) {
  const allowed = origin && allowedOrigins.has(origin) ? origin : "https://sergiogimeenez18-coder.github.io";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8",
  };
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), { status, headers: headers(origin) });
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin");
  if (request.method === "OPTIONS") return new Response("ok", { headers: headers(origin) });
  if (origin && !allowedOrigins.has(origin)) return json({ error: "Origen no permitido." }, 403, origin);
  if (request.method !== "POST") return json({ error: "Método no permitido." }, 405, origin);

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return json({ error: "El servicio de identificación aún no está configurado." }, 503, origin);

  let body: { image_data_url?: unknown; language?: unknown };
  try { body = await request.json(); } catch { return json({ error: "Solicitud no válida." }, 400, origin); }
  const imageDataUrl = body.image_data_url;
  if (typeof imageDataUrl !== "string" || !imageDataUrl.startsWith("data:image/jpeg;base64,") || imageDataUrl.length > 2_000_000) {
    return json({ error: "La foto no tiene un formato válido o supera el tamaño permitido." }, 400, origin);
  }
  const encoded = imageDataUrl.slice("data:image/jpeg;base64,".length);
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) return json({ error: "La foto no tiene un formato válido." }, 400, origin);
  if (atob(encoded).length > 1_400_000) return json({ error: "La foto supera el tamaño permitido." }, 413, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const authorization = request.headers.get("authorization");
  const publishableKey = request.headers.get("apikey");
  if (!supabaseUrl || !authorization || !publishableKey) {
    return json({ error: "No se pudo comprobar el límite de identificación." }, 503, origin);
  }
  let quotaResponse: Response;
  try {
    quotaResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/consume_animal_identification`, {
      method: "POST",
      headers: { "Authorization": authorization, "apikey": publishableKey, "Content-Type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    return json({ error: "No se pudo comprobar el límite de identificación." }, 503, origin);
  }
  if (!quotaResponse.ok) return json({ error: "No se pudo comprobar el límite de identificación." }, 503, origin);
  let dailyUsage: number;
  try { dailyUsage = Number(await quotaResponse.json()); } catch { return json({ error: "No se pudo comprobar el límite de identificación." }, 503, origin); }
  if (!Number.isFinite(dailyUsage) || dailyUsage === 0) {
    return json({ error: "Has alcanzado el máximo de 25 identificaciones de hoy. Vuelve a intentarlo mañana." }, 429, origin);
  }

  const schema = {
    type: "object",
    properties: {
      is_animal: { type: "boolean" },
      observations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            common_name: { type: "string" },
            scientific_name: { type: "string" },
            animal_group: { type: "string", enum: groups },
            confidence: { type: "number" },
            rationale: { type: "string" },
          },
          required: ["common_name", "scientific_name", "animal_group", "confidence", "rationale"],
          additionalProperties: false,
        },
      },
    },
    required: ["is_animal", "observations"],
    additionalProperties: false,
  };

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({
        model: "gpt-5.4-mini",
        store: false,
        max_output_tokens: 500,
        input: [{
          role: "user",
          content: [
            { type: "input_text", text: "Identifica el animal más visible de esta fotografía. Responde en español. Da como máximo tres posibilidades, ordenadas de más a menos probable. Usa un nombre común en español y el nombre científico binomial si tienes base suficiente. El grupo debe ser uno de los valores permitidos. confidence es una estimación orientativa entre 0 y 1, no una probabilidad calibrada. Si no hay un animal visible o la imagen no permite una identificación razonable, devuelve is_animal=false y observations=[]; no inventes una especie. En rationale explica brevemente qué rasgos visibles apoyan la sugerencia. No deduzcas ubicación, país, hábitat ni fecha a partir de datos externos; solo analiza lo visible en la imagen." },
            { type: "input_image", image_url: imageDataUrl, detail: "high" },
          ],
        }],
        text: { format: { type: "json_schema", name: "animal_identification", strict: true, schema } },
      }),
    });
    if (!response.ok) return json({ error: "El proveedor de identificación no pudo procesar la foto." }, 502, origin);
    const result = await response.json();
    const outputText = result.output?.flatMap((item: { content?: Array<{ type?: string; text?: string }> }) => item.content || [])
      .find((item: { type?: string }) => item.type === "output_text")?.text;
    if (typeof outputText !== "string") return json({ error: "No se recibió una respuesta de identificación válida." }, 502, origin);
    const identification = JSON.parse(outputText);
    if (!Array.isArray(identification.observations) || identification.observations.length > 3) {
      return json({ error: "La respuesta de identificación no es válida." }, 502, origin);
    }
    identification.observations = identification.observations.map((item: Record<string, unknown>) => ({
      ...item,
      confidence: Math.max(0, Math.min(1, Number(item.confidence) || 0)),
      animal_group: groups.includes(String(item.animal_group)) ? item.animal_group : "otros",
    }));
    return json(identification, 200, origin);
  } catch {
    return json({ error: "No se pudo completar la identificación. Inténtalo de nuevo." }, 502, origin);
  }
});
