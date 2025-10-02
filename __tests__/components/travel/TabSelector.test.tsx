import { render, screen, fireEvent } from '@testing-library/react';
import TabSelector from '@/components/travel/TabSelector';
import { TabType } from '@/types/travel';

describe('TabSelector', () => {
  const mockOnTabChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all tabs', () => {
    render(<TabSelector activeTab="ucak" onTabChange={mockOnTabChange} />);
    
    expect(screen.getByText('Uçak')).toBeInTheDocument();
    expect(screen.getByText('Otel')).toBeInTheDocument();
    expect(screen.getByText('Araç')).toBeInTheDocument();
    expect(screen.getByText('E-sim')).toBeInTheDocument();
  });

  it('should highlight active tab', () => {
    render(<TabSelector activeTab="otel" onTabChange={mockOnTabChange} />);
    
    const otelButton = screen.getByText('Otel').closest('button');
    expect(otelButton).toHaveClass('bg-green-50', 'text-green-500');
  });

  it('should call onTabChange when tab is clicked', () => {
    render(<TabSelector activeTab="ucak" onTabChange={mockOnTabChange} />);
    
    fireEvent.click(screen.getByText('Otel'));
    
    expect(mockOnTabChange).toHaveBeenCalledWith('otel');
  });

  it('should render all 4 tabs', () => {
    render(<TabSelector activeTab="ucak" onTabChange={mockOnTabChange} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });
});

