'use client';

import AuthenticatedLayout from '@/components/Layouts/AuthenticatedLayout';
import React from 'react';

const RequerimentoPage = () => {
  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Formulários</h1>
        <p className="text-gray-600">Central de formulários do sistema.</p>
      </div>
    </AuthenticatedLayout>
  );
};

export default RequerimentoPage;