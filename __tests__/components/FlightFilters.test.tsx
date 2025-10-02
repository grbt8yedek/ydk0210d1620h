import { render, screen, fireEvent } from '@testing-library/react'
import FlightFilters from '@/components/FlightFilters'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}))

describe('FlightFilters Component', () => {
  const mockProps = {
    airlinesList: [
      { name: 'Turkish Airlines', code: 'TK', logoUrl: '/logo-tk.png' },
      { name: 'Pegasus', code: 'PC', logoUrl: '/logo-pc.png' },
    ],
    airlines: ['Turkish Airlines', 'Pegasus'],
    selectedAirlines: [],
    onAirlineChange: jest.fn(),
    allFlights: [],
    priceRange: [100, 1000] as [number, number],
    maxPrice: 1000,
    onMaxPriceChange: jest.fn(),
    departureHourRange: [0, 24] as [number, number],
    onDepartureHourRangeChange: jest.fn(),
    arrivalHourRange: [0, 24] as [number, number],
    onArrivalHourRangeChange: jest.fn(),
    flightDurationRange: [0, 10] as [number, number],
    onFlightDurationRangeChange: jest.fn(),
    maxStops: 2,
    onMaxStopsChange: jest.fn(),
    selectedCabinClass: 'economy',
    onCabinClassChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render airline filter', () => {
    render(<FlightFilters {...mockProps} />)
    expect(screen.getByText('Havayolu')).toBeInTheDocument()
  })

  it('should render airline checkboxes', () => {
    render(<FlightFilters {...mockProps} />)
    expect(screen.getByText('Turkish Airlines')).toBeInTheDocument()
    expect(screen.getByText('Pegasus')).toBeInTheDocument()
  })

  it('should call onAirlineChange when checkbox clicked', () => {
    render(<FlightFilters {...mockProps} />)
    const checkbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(checkbox)
    expect(mockProps.onAirlineChange).toHaveBeenCalledWith('Turkish Airlines')
  })

  it('should show selected airlines as checked', () => {
    const props = { ...mockProps, selectedAirlines: ['Turkish Airlines'] }
    render(<FlightFilters {...props} />)
    const checkbox = screen.getAllByRole('checkbox')[0]
    expect(checkbox).toBeChecked()
  })

  it('should not render airline filter if empty', () => {
    const props = { ...mockProps, airlines: [] }
    render(<FlightFilters {...props} />)
    expect(screen.queryByText('Havayolu')).not.toBeInTheDocument()
  })
})

