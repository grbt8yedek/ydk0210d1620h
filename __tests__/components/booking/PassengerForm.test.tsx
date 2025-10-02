import { render, screen, fireEvent } from '@testing-library/react'
import PassengerForm from '@/components/booking/PassengerForm'
import { createMockPassenger, createMockFlight } from '@/__tests__/helpers/mockData'

describe('PassengerForm Component', () => {
  const mockProps = {
    passengerNumber: 1,
    passengerType: 'Yetişkin' as const,
    savedPassengers: [],
    onSelectPassenger: jest.fn(),
    onFormChange: jest.fn(),
    passengerData: {},
    onSaveToggle: jest.fn(),
    shouldSave: false,
    flight: createMockFlight(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('✅ Rendering', () => {
    it('should render passenger form with correct passenger number', () => {
      render(<PassengerForm {...mockProps} />)
      
      expect(screen.getByText('1. Yetişkin')).toBeInTheDocument()
    })

    it('should render "Yeni Kişi" button when saved passengers exist', () => {
      const props = {
        ...mockProps,
        savedPassengers: [createMockPassenger()],
      }
      
      render(<PassengerForm {...props} />)
      
      expect(screen.getByText('Yeni Kişi')).toBeInTheDocument()
    })

    it('should not show saved passengers section when list is empty', () => {
      render(<PassengerForm {...mockProps} />)
      
      expect(screen.queryByText('YOLCU LİSTEMDEN SEÇ')).not.toBeInTheDocument()
    })
  })

  describe('🎯 Saved Passenger Selection', () => {
    it('should display saved passengers', () => {
      const savedPassenger = createMockPassenger({
        firstName: 'John',
        lastName: 'Doe',
      })
      
      const props = {
        ...mockProps,
        savedPassengers: [savedPassenger],
      }
      
      render(<PassengerForm {...props} />)
      
      expect(screen.getByText(/John/)).toBeInTheDocument()
      expect(screen.getByText(/Doe/)).toBeInTheDocument()
    })

    it('should call onSelectPassenger when saved passenger is clicked', () => {
      const savedPassenger = createMockPassenger()
      const props = {
        ...mockProps,
        savedPassengers: [savedPassenger],
      }
      
      render(<PassengerForm {...props} />)
      
      const passengerButton = screen.getByText(new RegExp(savedPassenger.firstName))
      fireEvent.click(passengerButton)
      
      expect(mockProps.onSelectPassenger).toHaveBeenCalledWith(savedPassenger)
    })

    it('should call onSelectPassenger with null when "Yeni Kişi" is clicked', () => {
      const props = {
        ...mockProps,
        savedPassengers: [createMockPassenger()],
      }
      
      render(<PassengerForm {...props} />)
      
      const newPassengerButton = screen.getByText('Yeni Kişi')
      fireEvent.click(newPassengerButton)
      
      expect(mockProps.onSelectPassenger).toHaveBeenCalledWith(null)
    })
  })

  describe('📝 Form Input', () => {
    it('should call onFormChange when form field changes', () => {
      render(<PassengerForm {...mockProps} />)
      
      const firstNameInput = screen.getByLabelText(/Ad/i)
      fireEvent.change(firstNameInput, { target: { name: 'firstName', value: 'Test' } })
      
      expect(mockProps.onFormChange).toHaveBeenCalledWith('firstName', 'Test')
    })

    it('should handle checkbox changes', () => {
      render(<PassengerForm {...mockProps} />)
      
      const foreignerCheckbox = screen.getByLabelText(/Yabancı/i)
      fireEvent.click(foreignerCheckbox)
      
      expect(mockProps.onFormChange).toHaveBeenCalled()
    })
  })

  describe('🔒 Passenger Type', () => {
    it('should display "Yetişkin" for adult passenger', () => {
      render(<PassengerForm {...mockProps} passengerType="Yetişkin" />)
      
      expect(screen.getByText('1. Yetişkin')).toBeInTheDocument()
    })

    it('should display "Çocuk" for child passenger', () => {
      render(<PassengerForm {...mockProps} passengerType="Çocuk" />)
      
      expect(screen.getByText('1. Çocuk')).toBeInTheDocument()
    })
  })

  describe('💾 Save Toggle', () => {
    it('should call onSaveToggle when save checkbox is toggled', () => {
      render(<PassengerForm {...mockProps} />)
      
      const saveCheckbox = screen.getByLabelText(/kaydet/i)
      fireEvent.click(saveCheckbox)
      
      expect(mockProps.onSaveToggle).toHaveBeenCalled()
    })
  })
})

