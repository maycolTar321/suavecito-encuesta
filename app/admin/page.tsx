export const instant = false;
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { cookies } from 'next/headers';
import { connection } from 'next/server';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxx-Pj-sHtAInvRrxyneiBVufrUXuauatgLG4dZspSGxKJDmd1SKM7YoAgYhjomJpWT/exec";

export default async function AdminDashboardPage() {
  await connection(); // Opt into dynamic rendering in Next.js 16+

  // Check auth one more time just in case
  const authCookie = (await cookies()).get('suavecito_auth');
  if (authCookie?.value !== 'authenticated') {
    redirect('/admin/login');
  }

  let data = [];
  let error = null;

  try {
    const res = await fetch(GOOGLE_SCRIPT_URL, { next: { revalidate: 0 } }); // No caching
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON from Google Apps Script:", text);
      throw new Error("El Google Apps Script no devolvió un JSON válido. Asegúrate de haber implementado la función doGet.");
    }
  } catch (err: any) {
    console.error("Dashboard fetch error:", err);
    error = err.message;
  }

  return <DashboardClient initialData={data} fetchError={error} />;
}
