'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Dashboard = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/crm');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-sm text-slate-400">Redirecionando para o dashboard...</p>
    </div>
  );
};

export default Dashboard;
