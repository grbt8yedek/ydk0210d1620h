import { render } from '@testing-library/react';
import TurkishFlag from '@/components/TurkishFlag';

describe('TurkishFlag', () => {
  it('should render SVG flag', () => {
    const { container } = render(<TurkishFlag />);
    const svg = container.querySelector('svg');
    
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
  });

  it('should apply custom className', () => {
    const { container } = render(<TurkishFlag className="custom-class" />);
    const svg = container.querySelector('svg');
    
    expect(svg).toHaveClass('custom-class');
  });

  it('should have correct colors', () => {
    const { container } = render(<TurkishFlag />);
    
    // Red background
    const rect = container.querySelector('rect');
    expect(rect).toHaveAttribute('fill', '#E30A17');
    
    // White circle
    const circles = container.querySelectorAll('circle');
    expect(circles[0]).toHaveAttribute('fill', '#ffffff');
    
    // Red inner circle
    expect(circles[1]).toHaveAttribute('fill', '#E30A17');
  });

  it('should have star shape', () => {
    const { container } = render(<TurkishFlag />);
    const path = container.querySelector('path');
    
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute('fill', '#ffffff');
  });
});

