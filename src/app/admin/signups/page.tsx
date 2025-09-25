'use client';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import dynamic from 'next/dynamic';

// Dynamically import the component to prevent build-time execution
const AdminSignupsContent = dynamic(() => import('./AdminSignupsContent'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function AdminSignupsPage() {
  return <AdminSignupsContent />;
}