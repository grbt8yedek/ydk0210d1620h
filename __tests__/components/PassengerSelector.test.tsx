import { render, screen, fireEvent } from '@testing-library/react'
import PassengerSelector from '@/components/PassengerSelector'

describe('PassengerSelector Component', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    adultCount: 1,
    childCount: 0,
    infantCount: 0,
    onAdultCountChange: jest.fn(),
    onChildCountChange: jest.fn(),
    onInfantCountChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render when closed', () => {
    const props = { ...mockProps, isOpen: false }
    const { container } = render(<PassengerSelector {...props} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render when open', () => {
    render(<PassengerSelector {...mockProps} />)
    expect(screen.getByText('Yolcu Seçimi')).toBeInTheDocument()
  })

  it('should call onClose when close button clicked', () => {
    render(<PassengerSelector {...mockProps} />)
    const closeButton = screen.getAllByText('×')[0]
    fireEvent.click(closeButton)
    expect(mockProps.onClose).toHaveBeenCalled()
  })

  describe('Adult Counter', () => {
    it('should display adult count', () => {
      render(<PassengerSelector {...mockProps} adultCount={2} />)
      const counts = screen.getAllByText('2')
      expect(counts.length).toBeGreaterThan(0)
    })

    it('should increment adult count', () => {
      render(<PassengerSelector {...mockProps} />)
      const plusButtons = screen.getAllByText('+')
      fireEvent.click(plusButtons[0])
      expect(mockProps.onAdultCountChange).toHaveBeenCalledWith(2)
    })

    it('should decrement adult count', () => {
      render(<PassengerSelector {...mockProps} adultCount={2} />)
      const minusButtons = screen.getAllByText('-')
      fireEvent.click(minusButtons[0])
      expect(mockProps.onAdultCountChange).toHaveBeenCalledWith(1)
    })

    it('should not allow adult count below 1', () => {
      render(<PassengerSelector {...mockProps} adultCount={1} />)
      const minusButtons = screen.getAllByText('-')
      fireEvent.click(minusButtons[0])
      expect(mockProps.onAdultCountChange).toHaveBeenCalledWith(1)
    })

    it('should disable minus button when count is 1', () => {
      render(<PassengerSelector {...mockProps} adultCount={1} />)
      const minusButtons = screen.getAllByText('-')
      expect(minusButtons[0]).toBeDisabled()
    })
  })

  describe('Child Counter', () => {
    it('should display child count', () => {
      render(<PassengerSelector {...mockProps} childCount={1} />)
      const counts = screen.getAllByText('1')
      expect(counts.length).toBeGreaterThan(0)
    })

    it('should increment child count', () => {
      render(<PassengerSelector {...mockProps} />)
      const plusButtons = screen.getAllByText('+')
      fireEvent.click(plusButtons[1])
      expect(mockProps.onChildCountChange).toHaveBeenCalledWith(1)
    })

    it('should decrement child count', () => {
      render(<PassengerSelector {...mockProps} childCount={1} />)
      const minusButtons = screen.getAllByText('-')
      fireEvent.click(minusButtons[1])
      expect(mockProps.onChildCountChange).toHaveBeenCalledWith(0)
    })

    it('should not allow child count below 0', () => {
      render(<PassengerSelector {...mockProps} childCount={0} />)
      const minusButtons = screen.getAllByText('-')
      fireEvent.click(minusButtons[1])
      expect(mockProps.onChildCountChange).toHaveBeenCalledWith(0)
    })
  })

  describe('Infant Counter', () => {
    it('should display infant count', () => {
      render(<PassengerSelector {...mockProps} infantCount={1} />)
      const counts = screen.getAllByText('1')
      expect(counts.length).toBeGreaterThan(0)
    })

    it('should increment infant count', () => {
      render(<PassengerSelector {...mockProps} />)
      const plusButtons = screen.getAllByText('+')
      fireEvent.click(plusButtons[2])
      expect(mockProps.onInfantCountChange).toHaveBeenCalledWith(1)
    })

    it('should decrement infant count', () => {
      render(<PassengerSelector {...mockProps} infantCount={1} />)
      const minusButtons = screen.getAllByText('-')
      fireEvent.click(minusButtons[2])
      expect(mockProps.onInfantCountChange).toHaveBeenCalledWith(0)
    })

    it('should not allow infant count below 0', () => {
      render(<PassengerSelector {...mockProps} infantCount={0} />)
      const minusButtons = screen.getAllByText('-')
      fireEvent.click(minusButtons[2])
      expect(mockProps.onInfantCountChange).toHaveBeenCalledWith(0)
    })
  })

  describe('Age Labels', () => {
    it('should show adult age range', () => {
      render(<PassengerSelector {...mockProps} />)
      expect(screen.getAllByText(/12 yaş ve üstü/i).length).toBeGreaterThan(0)
    })

    it('should show child age range', () => {
      render(<PassengerSelector {...mockProps} />)
      expect(screen.getAllByText(/2-11 yaş/i).length).toBeGreaterThan(0)
    })

    it('should show infant age range', () => {
      render(<PassengerSelector {...mockProps} />)
      expect(screen.getAllByText(/0-23 ay/i).length).toBeGreaterThan(0)
    })
  })
})

