import CampaignCard from './CampaignCard';

export default function CampaignsSection() {
  return (
    <div className="w-full sm:container sm:mx-auto px-0 sm:px-4 py-10">
      <h2 className="text-2xl font-semibold text-gray-800 mb-8">Kampanyalar</h2>
      <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
        <CampaignCard
          src="/images/campaigns/early-flight.jpg"
          alt="Erken Rezervasyon Kampanyası"
          title="Yaz Sezonu Erken Rezervasyon"
        />
        <CampaignCard
          src="/images/campaigns/summer-hotels.jpg"
          alt="Öğrenci İndirimi Kampanyası"
          title="Öğrenci İndirimi"
        />
        <CampaignCard
          src="/images/campaigns/hotel-deals.jpg"
          alt="Aile Paketi Kampanyası"
          title="Aile Paketi"
        />
        <CampaignCard
          src="/images/campaigns/car-rental.jpg"
          alt="Bayram Özel Kampanyası"
          title="Bayram Özel"
        />
      </div>
    </div>
  );
} 