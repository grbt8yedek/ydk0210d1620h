import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ProvidersDropdown from '@/components/ProvidersDropdown';

global.fetch = jest.fn();

describe('ProvidersDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ([
        { id: '1', name: 'Provider 1' },
        { id: '2', name: 'Provider 2' }
      ])
    });
  });

  it('should render dropdown with label', () => {
    render(<ProvidersDropdown />);
    
    expect(screen.getByLabelText('Tedarikçi Seçin')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should fetch providers on mount', async () => {
    render(<ProvidersDropdown />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/lookups/providers');
    });
  });

  it('should display fetched providers', async () => {
    render(<ProvidersDropdown />);
    
    await waitFor(() => {
      expect(screen.getByText('Provider 1')).toBeInTheDocument();
      expect(screen.getByText('Provider 2')).toBeInTheDocument();
    });
  });

  it('should have default "Tümü" option', () => {
    render(<ProvidersDropdown />);
    
    expect(screen.getByText('Tümü')).toBeInTheDocument();
  });

  it('should update selected value on change', async () => {
    render(<ProvidersDropdown />);
    
    await waitFor(() => {
      expect(screen.getByText('Provider 1')).toBeInTheDocument();
    });
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });
    
    expect(select).toHaveValue('1');
  });

});

