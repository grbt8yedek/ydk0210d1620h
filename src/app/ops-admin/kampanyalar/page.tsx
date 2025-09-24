'use client';

import CampaignsTab from '@/app/components/campaigns/CampaignsTab';

export default function OpsAdminKampanyalarPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Kampanyalar</h1>
      <CampaignsTab />
    </div>
  );
}


