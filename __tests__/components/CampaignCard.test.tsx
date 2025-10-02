import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CampaignCard from '@/components/CampaignCard';

describe('CampaignCard Component', () => {
  const mockProps = {
    src: '/images/campaigns/test-campaign.jpg',
    alt: 'Test Campaign',
    title: 'Test Campaign Title',
  };

  it('renders campaign card with title', () => {
    render(<CampaignCard {...mockProps} />);
    
    expect(screen.getByText('Test Campaign Title')).toBeInTheDocument();
  });

  it('renders image with correct alt text', () => {
    render(<CampaignCard {...mockProps} />);
    
    const image = screen.getByAltText('Test Campaign');
    expect(image).toBeInTheDocument();
  });

  it('renders image with correct src', () => {
    render(<CampaignCard {...mockProps} />);
    
    const image = screen.getByAltText('Test Campaign');
    expect(image).toHaveAttribute('src');
  });

  it('has correct card container classes', () => {
    const { container } = render(<CampaignCard {...mockProps} />);
    
    const cardDiv = container.querySelector('.bg-white.rounded-lg.shadow-md');
    expect(cardDiv).toBeInTheDocument();
  });

  it('has correct image container height', () => {
    const { container } = render(<CampaignCard {...mockProps} />);
    
    const imageContainer = container.querySelector('.h-48');
    expect(imageContainer).toBeInTheDocument();
  });

  it('has padding on content area', () => {
    const { container } = render(<CampaignCard {...mockProps} />);
    
    const contentDiv = container.querySelector('.p-4');
    expect(contentDiv).toBeInTheDocument();
  });

  it('renders title with correct styling', () => {
    const { container } = render(<CampaignCard {...mockProps} />);
    
    const title = container.querySelector('h3.text-gray-700.font-medium');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Test Campaign Title');
  });

  it('renders with different titles', () => {
    const { rerender } = render(<CampaignCard {...mockProps} />);
    expect(screen.getByText('Test Campaign Title')).toBeInTheDocument();
    
    rerender(<CampaignCard {...mockProps} title="New Campaign Title" />);
    expect(screen.getByText('New Campaign Title')).toBeInTheDocument();
    expect(screen.queryByText('Test Campaign Title')).not.toBeInTheDocument();
  });

  it('renders with different image sources', () => {
    const { rerender } = render(<CampaignCard {...mockProps} />);
    let image = screen.getByAltText('Test Campaign');
    expect(image).toBeInTheDocument();
    
    rerender(<CampaignCard {...mockProps} src="/images/campaigns/new-campaign.jpg" />);
    image = screen.getByAltText('Test Campaign');
    expect(image).toBeInTheDocument();
  });

  it('renders with different alt text', () => {
    const { rerender } = render(<CampaignCard {...mockProps} />);
    expect(screen.getByAltText('Test Campaign')).toBeInTheDocument();
    
    rerender(<CampaignCard {...mockProps} alt="New Alt Text" />);
    expect(screen.getByAltText('New Alt Text')).toBeInTheDocument();
    expect(screen.queryByAltText('Test Campaign')).not.toBeInTheDocument();
  });

  it('has overflow-hidden class on container', () => {
    const { container } = render(<CampaignCard {...mockProps} />);
    
    const cardDiv = container.querySelector('.overflow-hidden');
    expect(cardDiv).toBeInTheDocument();
  });

  it('has h-full class for full height', () => {
    const { container } = render(<CampaignCard {...mockProps} />);
    
    const cardDiv = container.querySelector('.h-full');
    expect(cardDiv).toBeInTheDocument();
  });

  it('image has object-cover class', () => {
    const { container } = render(<CampaignCard {...mockProps} />);
    
    const imageElement = container.querySelector('.object-cover');
    expect(imageElement).toBeInTheDocument();
  });

  it('image container has relative positioning', () => {
    const { container } = render(<CampaignCard {...mockProps} />);
    
    const imageContainer = container.querySelector('.relative.w-full.h-48');
    expect(imageContainer).toBeInTheDocument();
  });
});
