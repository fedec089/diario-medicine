// app/api/cron/meds-reminder/route.js
export const runtime = "nodejs";

export async function GET() {
  const supabaseFnUrl =
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/meds-reminder`;

  const res = await fetch(supabaseFnUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
    },
  });

  const text = await res.text();
  return new Response(text, { status: res.status });
}
