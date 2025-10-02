import { render, screen } from '@testing-library/react';
import HeroSection from '@/components/HeroSection';

describe('HeroSection', () => {
  it('should render logo text', () => {
    render(<HeroSection />);
    expect(screen.getByText('gurbet')).toBeInTheDocument();
    expect(screen.getByText('biz')).toBeInTheDocument();
  });

  it('should render tagline', () => {
    render(<HeroSection />);
    expect(screen.getByText('Gurbetten Memlekete, Yol Arkadaşınız!')).toBeInTheDocument();
  });

  it('should render all service icons', () => {
    render(<HeroSection />);
    expect(screen.getByText('UÇAK')).toBeInTheDocument();
    expect(screen.getByText('OTEL')).toBeInTheDocument();
    expect(screen.getByText('ARAÇ')).toBeInTheDocument();
    expect(screen.getByText('E SIM')).toBeInTheDocument();
  });

  it('should render 4 service circles', () => {
    const { container } = render(<HeroSection />);
    const circles = container.querySelectorAll('.rounded-full.w-20.h-20');
    expect(circles).toHaveLength(4);
  });
});

