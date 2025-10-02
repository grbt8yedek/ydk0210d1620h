import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CampaignsSection from '@/components/CampaignsSection';

// Mock fetch
global.fetch = jest.fn();

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    return <a {...props}>{children}</a>;
  },
}));

describe('CampaignsSection Component', () => {
  const mockCampaigns = [
    {
      id: '1',
      title: 'Campaign 1',
      description: 'Description 1',
      imageUrl: '/images/campaign1.jpg',
      imageData: null,
      altText: 'Campaign 1',
      linkUrl: '/campaign1',
      status: 'active' as const,
      position: 1,
      clickCount: 0,
      viewCount: 0,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    },
    {
      id: '2',
      title: 'Campaign 2',
      description: 'Description 2',
      imageUrl: '/images/campaign2.jpg',
      imageData: null,
      altText: 'Campaign 2',
      linkUrl: '/campaign2',
      status: 'active' as const,
      position: 2,
      clickCount: 5,
      viewCount: 10,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockCampaigns,
      }),
    });
  });

  it('shows loading skeleton initially', () => {
    render(<CampaignsSection />);
    
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('fetches and displays campaigns', async () => {
    render(<CampaignsSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Campaign 1')).toBeInTheDocument();
      expect(screen.getByText('Campaign 2')).toBeInTheDocument();
    });
    
    expect(global.fetch).toHaveBeenCalledWith('/api/campaigns', expect.any(Object));
  });

  it('displays campaign descriptions', async () => {
    render(<CampaignsSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
    });
  });

  it('renders campaign images with correct alt text', async () => {
    render(<CampaignsSection />);
    
    await waitFor(() => {
      expect(screen.getByAltText('Campaign 1')).toBeInTheDocument();
      expect(screen.getByAltText('Campaign 2')).toBeInTheDocument();
    });
  });

  it('filters only active campaigns', async () => {
    const mixedCampaigns = [
      ...mockCampaigns,
      {
        ...mockCampaigns[0],
        id: '3',
        title: 'Inactive Campaign',
        status: 'inactive' as const,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mixedCampaigns,
      }),
    });

    render(<CampaignsSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Campaign 1')).toBeInTheDocument();
      expect(screen.queryByText('Inactive Campaign')).not.toBeInTheDocument();
    });
  });

  it('limits campaigns to maximum 4', async () => {
    const manyCampaigns = Array.from({ length: 6 }, (_, i) => ({
      ...mockCampaigns[0],
      id: `${i + 1}`,
      title: `Campaign ${i + 1}`,
      position: i + 1,
    }));

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: manyCampaigns,
      }),
    });

    render(<CampaignsSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Campaign 1')).toBeInTheDocument();
      expect(screen.getByText('Campaign 4')).toBeInTheDocument();
      expect(screen.queryByText('Campaign 5')).not.toBeInTheDocument();
      expect(screen.queryByText('Campaign 6')).not.toBeInTheDocument();
    });
  });

  it('sorts campaigns by position', async () => {
    const unsortedCampaigns = [
      { ...mockCampaigns[0], id: '1', title: 'Third', position: 3 },
      { ...mockCampaigns[0], id: '2', title: 'First', position: 1 },
      { ...mockCampaigns[0], id: '3', title: 'Second', position: 2 },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: unsortedCampaigns,
      }),
    });

    render(<CampaignsSection />);
    
    await waitFor(() => {
      const titles = screen.getAllByRole('heading', { level: 3 });
      expect(titles[0]).toHaveTextContent('First');
      expect(titles[1]).toHaveTextContent('Second');
      expect(titles[2]).toHaveTextContent('Third');
    });
  });

  it('shows error message on fetch failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Error',
    });

    render(<CampaignsSection />);
    
    await waitFor(() => {
      expect(screen.getByText(/API Hatası: 500/i)).toBeInTheDocument();
    });
  });

  it('shows retry button on error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Error',
    });

    render(<CampaignsSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Tekrar Dene')).toBeInTheDocument();
    });
  });

  it('retries fetch when retry button is clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Error',
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockCampaigns,
        }),
      });

    render(<CampaignsSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Tekrar Dene')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Tekrar Dene'));
    
    await waitFor(() => {
      expect(screen.getByText('Campaign 1')).toBeInTheDocument();
    });
  });

  it('returns null when no campaigns available', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
      }),
    });

    const { container } = render(<CampaignsSection />);
    
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('handles campaign click and increments count', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockCampaigns,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<CampaignsSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Campaign 1')).toBeInTheDocument();
    });
    
    const campaignLink = screen.getAllByRole('link')[0];
    fireEvent.click(campaignLink);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/campaigns/1/click',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('renders campaigns with linkUrl as links', async () => {
    render(<CampaignsSection />);
    
    await waitFor(() => {
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
      expect(links[0]).toHaveAttribute('href', '/campaign1');
    });
  });

  it('renders campaign without linkUrl as static div', async () => {
    const campaignsWithoutLink = [
      { ...mockCampaigns[0], linkUrl: '' },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: campaignsWithoutLink,
      }),
    });

    render(<CampaignsSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Campaign 1')).toBeInTheDocument();
      const links = screen.queryAllByRole('link');
      expect(links.length).toBe(0);
    });
  });

  it('handles imageData priority over imageUrl', async () => {
    const campaignWithImageData = [
      {
        ...mockCampaigns[0],
        imageData: 'data:image/jpeg;base64,test',
        imageUrl: '/images/campaign.jpg',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: campaignWithImageData,
      }),
    });

    render(<CampaignsSection />);
    
    await waitFor(() => {
      const image = screen.getByAltText('Campaign 1');
      expect(image).toHaveAttribute('src', 'data:image/jpeg;base64,test');
    });
  });

  it('renders fallback gradient for campaigns without images', async () => {
    const campaignWithoutImage = [
      {
        ...mockCampaigns[0],
        imageUrl: null,
        imageData: null,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: campaignWithoutImage,
      }),
    });

    const { container } = render(<CampaignsSection />);
    
    await waitFor(() => {
      const gradientDiv = container.querySelector('.bg-gradient-to-br.from-blue-500');
      expect(gradientDiv).toBeInTheDocument();
    });
  });

  it('uses cache and skips fetch within cache duration', async () => {
    const { rerender } = render(<CampaignsSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Campaign 1')).toBeInTheDocument();
    });
    
    expect(global.fetch).toHaveBeenCalledTimes(1);
    
    // Rerender within cache duration
    rerender(<CampaignsSection />);
    
    // Should not fetch again
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('handles network error gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<CampaignsSection />);
    
    await waitFor(() => {
      expect(screen.getByText(/Kampanyalar yüklenirken hata oluştu/i)).toBeInTheDocument();
    });
  });

  it('applies hover effect on campaign cards', async () => {
    const { container } = render(<CampaignsSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Campaign 1')).toBeInTheDocument();
    });
    
    const card = container.querySelector('.hover\\:shadow-lg');
    expect(card).toBeInTheDocument();
  });
});

