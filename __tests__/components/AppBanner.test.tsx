import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppBanner from '@/components/AppBanner';

describe('AppBanner Component', () => {
  it('renders mobile banner with correct content', () => {
    render(<AppBanner />);
    
    // Mobil banner metinleri
    expect(screen.getByText(/Mobil Uygulama/i)).toBeInTheDocument();
    expect(screen.getByText(/Avrupa'dan Türkiye'ye Yol arkadasiniz/i)).toBeInTheDocument();
    expect(screen.getByText(/Hemen/i)).toBeInTheDocument();
    expect(screen.getByText(/İNDİR !/i)).toBeInTheDocument();
  });

  it('renders desktop banner with correct content', () => {
    render(<AppBanner />);
    
    // Desktop banner metinleri
    expect(screen.getByText(/Uygulaması/i)).toBeInTheDocument();
    expect(screen.getByText(/Avrupa'dan Türkiye'ye Yol Arkadaşınız/i)).toBeInTheDocument();
  });

  it('displays gurbetbiz brand name correctly', () => {
    render(<AppBanner />);
    
    // Brand name kontrolü (hem mobil hem desktop)
    const gurbetTexts = screen.getAllByText(/gurbet/i);
    const bizTexts = screen.getAllByText(/biz/i);
    
    expect(gurbetTexts.length).toBeGreaterThan(0);
    expect(bizTexts.length).toBeGreaterThan(0);
  });

  it('renders App Store and Google Play links', () => {
    render(<AppBanner />);
    
    // Store link'leri kontrolü
    const appStoreImages = screen.getAllByAltText(/App Store/i);
    const googlePlayImages = screen.getAllByAltText(/Google Play/i);
    
    expect(appStoreImages.length).toBeGreaterThan(0);
    expect(googlePlayImages.length).toBeGreaterThan(0);
  });

  it('renders SVG phone icon on mobile', () => {
    const { container } = render(<AppBanner />);
    
    // SVG telefon ikonu kontrolü
    const svgElements = container.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('has correct mobile styling classes', () => {
    const { container } = render(<AppBanner />);
    
    // Mobil container class kontrolü
    const mobileContainer = container.querySelector('.block.sm\\:hidden');
    expect(mobileContainer).toBeInTheDocument();
  });

  it('has correct desktop styling classes', () => {
    const { container } = render(<AppBanner />);
    
    // Desktop container class kontrolü
    const desktopContainer = container.querySelector('.hidden.sm\\:block');
    expect(desktopContainer).toBeInTheDocument();
  });

  it('applies gradient background on mobile banner', () => {
    const { container } = render(<AppBanner />);
    
    // Gradient background kontrolü
    const gradientDiv = container.querySelector('.bg-gradient-to-r.from-green-700');
    expect(gradientDiv).toBeInTheDocument();
  });

  it('applies green background on desktop banner', () => {
    const { container } = render(<AppBanner />);
    
    // Desktop green background kontrolü
    const greenBg = container.querySelector('.bg-green-500');
    expect(greenBg).toBeInTheDocument();
  });

  it('renders store buttons with correct text on desktop', () => {
    render(<AppBanner />);
    
    // Desktop store button metinleri
    expect(screen.getByText(/Download on the/i)).toBeInTheDocument();
    expect(screen.getByText(/App Store/i)).toBeInTheDocument();
    expect(screen.getByText(/GET IT ON/i)).toBeInTheDocument();
    expect(screen.getByText(/Google Play/i)).toBeInTheDocument();
  });

  it('has proper image dimensions', () => {
    render(<AppBanner />);
    
    // Image boyutları kontrolü
    const appStoreImages = screen.getAllByAltText(/App Store/i);
    const googlePlayImages = screen.getAllByAltText(/Google Play/i);
    
    appStoreImages.forEach(img => {
      expect(img).toHaveAttribute('width');
      expect(img).toHaveAttribute('height');
    });
    
    googlePlayImages.forEach(img => {
      expect(img).toHaveAttribute('width');
      expect(img).toHaveAttribute('height');
    });
  });

  it('renders phone SVG with correct structure', () => {
    const { container } = render(<AppBanner />);
    
    // SVG yapı kontrolü
    const phoneRect = container.querySelector('rect[rx="12"]');
    expect(phoneRect).toBeInTheDocument();
  });
});

