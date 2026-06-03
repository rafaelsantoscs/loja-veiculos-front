'use client';

import DashboardModerno from '@/components/Dashboard/DashboardModerno';
import AuthenticatedLayout from '@/components/Layouts/AuthenticatedLayout';
import React from 'react';

const Dashboard = () => {
  return (
    <AuthenticatedLayout>
      <DashboardModerno />
    </AuthenticatedLayout>
  );
};

export default Dashboard;