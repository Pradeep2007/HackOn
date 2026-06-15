'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SustainabilityDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/green-wallet?tab=carbon');
  }, [router]);

  return (
    <div className="bg-[#eaeded] min-h-screen flex items-center justify-center text-black font-sans">
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-semibold">Redirecting to Sustainability Hub...</p>
      </div>
    </div>
  );
}
