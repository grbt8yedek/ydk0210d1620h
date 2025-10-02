import { render, screen, fireEvent } from '@testing-library/react'
import TripTypeSelector from '@/components/TripTypeSelector'

describe('TripTypeSelector Component', () => {
  const mockProps = {
    tripType: 'oneWay',
    onTripTypeChange: jest.fn(),
    directOnly: false,
    onDirectOnlyChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Desktop Version', () => {
    it('should render all trip types', () => {
      render(<TripTypeSelector {...mockProps} />)
      expect(screen.getByText('Tek yön')).toBeInTheDocument()
      expect(screen.getByText('Gidiş-dönüş')).toBeInTheDocument()
      expect(screen.getByText('Çoklu uçuş')).toBeInTheDocument()
    })

    it('should select oneWay by default', () => {
      render(<TripTypeSelector {...mockProps} />)
      const radio = screen.getByDisplayValue('oneWay')
      expect(radio).toBeChecked()
    })

    it('should call onTripTypeChange when roundTrip selected', () => {
      render(<TripTypeSelector {...mockProps} />)
      const radio = screen.getByDisplayValue('roundTrip')
      fireEvent.click(radio)
      expect(mockProps.onTripTypeChange).toHaveBeenCalledWith('roundTrip')
    })

    it('should call onTripTypeChange when multiCity selected', () => {
      render(<TripTypeSelector {...mockProps} />)
      const radio = screen.getByDisplayValue('multiCity')
      fireEvent.click(radio)
      expect(mockProps.onTripTypeChange).toHaveBeenCalledWith('multiCity')
    })

    it('should render directOnly checkbox', () => {
      render(<TripTypeSelector {...mockProps} />)
      expect(screen.getByLabelText('Aktarmasız')).toBeInTheDocument()
    })

    it('should call onDirectOnlyChange when checkbox clicked', () => {
      render(<TripTypeSelector {...mockProps} />)
      const checkbox = screen.getByLabelText('Aktarmasız')
      fireEvent.click(checkbox)
      expect(mockProps.onDirectOnlyChange).toHaveBeenCalledWith(true)
    })

    it('should show directOnly as checked when true', () => {
      const props = { ...mockProps, directOnly: true }
      render(<TripTypeSelector {...props} />)
      const checkbox = screen.getByLabelText('Aktarmasız')
      expect(checkbox).toBeChecked()
    })

    it('should apply custom className', () => {
      const { container } = render(<TripTypeSelector {...mockProps} className="custom-class" />)
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('Mobile Version', () => {
    it('should render only oneWay and roundTrip', () => {
      render(<TripTypeSelector {...mockProps} isMobile={true} />)
      expect(screen.getByText('Tek yön')).toBeInTheDocument()
      expect(screen.getByText('Gidiş-dönüş')).toBeInTheDocument()
      expect(screen.queryByText('Çoklu uçuş')).not.toBeInTheDocument()
    })

    it('should not render directOnly checkbox', () => {
      render(<TripTypeSelector {...mockProps} isMobile={true} />)
      expect(screen.queryByLabelText('Aktarmasız')).not.toBeInTheDocument()
    })

    it('should call onTripTypeChange on mobile', () => {
      render(<TripTypeSelector {...mockProps} isMobile={true} />)
      const radios = screen.getAllByRole('radio')
      fireEvent.click(radios[1]) // roundTrip
      expect(mockProps.onTripTypeChange).toHaveBeenCalledWith('roundTrip')
    })

    it('should use different radio name for mobile', () => {
      render(<TripTypeSelector {...mockProps} isMobile={true} />)
      const radios = screen.getAllByRole('radio')
      radios.forEach(radio => {
        expect(radio).toHaveAttribute('name', 'tripTypeMobile')
      })
    })
  })

  describe('Trip Type Selection', () => {
    it('should show roundTrip as selected', () => {
      const props = { ...mockProps, tripType: 'roundTrip' }
      render(<TripTypeSelector {...props} />)
      const radio = screen.getByDisplayValue('roundTrip')
      expect(radio).toBeChecked()
    })

    it('should show multiCity as selected', () => {
      const props = { ...mockProps, tripType: 'multiCity' }
      render(<TripTypeSelector {...props} />)
      const radio = screen.getByDisplayValue('multiCity')
      expect(radio).toBeChecked()
    })

    it('should only allow one trip type selected', () => {
      render(<TripTypeSelector {...mockProps} tripType="oneWay" />)
      const oneWay = screen.getByDisplayValue('oneWay')
      const roundTrip = screen.getByDisplayValue('roundTrip')
      const multiCity = screen.getByDisplayValue('multiCity')

      expect(oneWay).toBeChecked()
      expect(roundTrip).not.toBeChecked()
      expect(multiCity).not.toBeChecked()
    })
  })
})

