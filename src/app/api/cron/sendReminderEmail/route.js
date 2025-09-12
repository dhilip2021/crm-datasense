// app/api/sendReminderEmail/route.js (Next.js App Router)
// import { transporter } from '@/helper/serverHelper';

import { transporter } from "@/helper/clientHelper";

export async function POST(req) {
  try {
    const { email, firstName, subject, html } = await req.json();

    await transporter.sendMail({
      from: '"No Reply" <dhilipbeece001@gmail.com>',
      to: email,
      subject: subject || 'CRM Alert',
      html,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
