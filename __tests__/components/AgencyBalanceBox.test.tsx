import { render, screen, waitFor } from '@testing-library/react';
import AgencyBalanceBox from '@/components/AgencyBalanceBox';

global.fetch = jest.fn();

describe('AgencyBalanceBox', () => {
  const mockBalance = {
    accountName: 'Test Agency',
    accountCodeDesc: 'ACC001',
    totalCredit: 10000,
    totalDebit: 5000,
    totalBalance: 5000
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => mockBalance
    });
  });

  it('should show loading state initially', () => {
    render(<AgencyBalanceBox />);
    expect(screen.getByText('Bakiye yükleniyor...')).toBeInTheDocument();
  });

  it('should fetch balance data on mount', async () => {
    render(<AgencyBalanceBox />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/agency-balance/detail');
    });
  });

  it('should display balance data', async () => {
    render(<AgencyBalanceBox />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Agency')).toBeInTheDocument();
    });
    
    expect(screen.getByText('ACC001')).toBeInTheDocument();
  });

  it('should format currency in Turkish locale', async () => {
    render(<AgencyBalanceBox />);
    
    await waitFor(() => {
      expect(screen.getByText(/10\.000,00/)).toBeInTheDocument();
    });
  });

  it('should display all balance fields', async () => {
    render(<AgencyBalanceBox />);
    
    await waitFor(() => {
      expect(screen.getByText('Toplam Alacak:', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('Toplam Borç:', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('Mevcut Bakiye:', { exact: false })).toBeInTheDocument();
    });
  });
});

