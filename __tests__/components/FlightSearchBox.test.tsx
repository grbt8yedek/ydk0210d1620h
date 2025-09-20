import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import FlightSearchBox from '@/components/FlightSearchBox'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('FlightSearchBox', () => {
  const mockProps = {
    onSearch: jest.fn(),
    loading: false,
    error: null,
    onSwapAirports: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders flight search form correctly', () => {
    render(<FlightSearchBox {...mockProps} />)
    
    expect(screen.getByText('Nereden')).toBeInTheDocument()
    expect(screen.getByText('Nereye')).toBeInTheDocument()
    expect(screen.getByText('Gidiş Tarihi')).toBeInTheDocument()
  })

  it('calls onSearch when form is submitted', async () => {
    render(<FlightSearchBox {...mockProps} />)
    
    const searchButton = screen.getByText('Uçuş Ara')
    fireEvent.click(searchButton)
    
    await waitFor(() => {
      expect(mockProps.onSearch).toHaveBeenCalled()
    })
  })

  it('shows loading state correctly', () => {
    render(<FlightSearchBox {...mockProps} loading={true} />)
    
    expect(screen.getByText('Aranıyor...')).toBeInTheDocument()
  })

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'Uçuş bulunamadı'
    render(<FlightSearchBox {...mockProps} error={errorMessage} />)
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('swaps airports when swap button is clicked', () => {
    render(<FlightSearchBox {...mockProps} />)
    
    const swapButton = screen.getByLabelText('Havalimanlarını değiştir')
    fireEvent.click(swapButton)
    
    expect(mockProps.onSwapAirports).toHaveBeenCalled()
  })
})
