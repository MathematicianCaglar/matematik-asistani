import { NextResponse } from "next/server";

// GEÇİCİ AJAN: Gerçek ajan hazır olunca sadece bu dosya değişecek.
export async function POST(req: Request) {
  const { studentCode, taskId, messages } = await req.json();
  const last = messages?.[messages.length - 1]?.content ?? "";

  return NextResponse.json({
    reply: `(Test cevabı) ${studentCode} kodlu öğrenci, ${taskId} numaralı görevde şunu yazdı: "${last}"`,
  });
}