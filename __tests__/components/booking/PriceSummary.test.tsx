import { render, screen, fireEvent } from '@testing-library/react'
import PriceSummary from '@/components/booking/PriceSummary'

describe('PriceSummary', () => {
  const defaultProps = {
    totalPassengers: 2,
    baseTotalPrice: 200.00,
    totalBaggagePrice: 50.00,
    taxes: 30.00,
    finalTotalPrice: 280.00,
    termsAccepted: false,
    bookingType: 'book' as const,
    onTermsChange: jest.fn(),
    onBookingTypeChange: jest.fn(),
    onProceedToPayment: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render price summary with correct title', () => {
      render(<PriceSummary {...defaultProps} />)
      
      expect(screen.getByText('Fiyat Özeti')).toBeInTheDocument()
    })

    it('should display ticket price with passenger count', () => {
      render(<PriceSummary {...defaultProps} />)
      
      expect(screen.getByText('Bilet Fiyatı (x2)')).toBeInTheDocument()
      expect(screen.getByText('200.00 EUR')).toBeInTheDocument()
    })

    it('should display baggage price when not zero', () => {
      render(<PriceSummary {...defaultProps} />)
      
      expect(screen.getByText('Ek Bagaj Ücreti')).toBeInTheDocument()
      expect(screen.getByText('50.00 EUR')).toBeInTheDocument()
    })

    it('should not display baggage price when zero', () => {
      render(<PriceSummary {...defaultProps} totalBaggagePrice={0} />)
      
      expect(screen.queryByText('Ek Bagaj Ücreti')).not.toBeInTheDocument()
    })

    it('should display taxes and fees', () => {
      render(<PriceSummary {...defaultProps} />)
      
      expect(screen.getByText('Vergiler ve Harçlar')).toBeInTheDocument()
      expect(screen.getByText('30.00 EUR')).toBeInTheDocument()
    })

    it('should display total price', () => {
      render(<PriceSummary {...defaultProps} />)
      
      expect(screen.getByText('Toplam')).toBeInTheDocument()
      expect(screen.getByText('280.00 EUR')).toBeInTheDocument()
    })

    it('should render terms and conditions checkbox', () => {
      render(<PriceSummary {...defaultProps} />)
      
      const checkbox = screen.getByRole('checkbox', { name: /Havayolu Taşıma Kuralları/ })
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).not.toBeChecked()
    })

    it('should render booking type radio buttons', () => {
      render(<PriceSummary {...defaultProps} />)
      
      expect(screen.getByLabelText('Rezervasyon Yap')).toBeInTheDocument()
      expect(screen.getByLabelText('Bileti Al')).toBeInTheDocument()
    })

    it('should render proceed to payment button', () => {
      render(<PriceSummary {...defaultProps} />)
      
      expect(screen.getByRole('button', { name: /Ödemeye İlerle/ })).toBeInTheDocument()
    })

    it('should render payment method icons', () => {
      render(<PriceSummary {...defaultProps} />)
      
      expect(screen.getByText('VISA')).toBeInTheDocument()
      expect(screen.getByText('Mastercard')).toBeInTheDocument()
      expect(screen.getByText('Klarna')).toBeInTheDocument()
      expect(screen.getByText('PayPal')).toBeInTheDocument()
    })

    it('should render SSL security message', () => {
      render(<PriceSummary {...defaultProps} />)
      
      expect(screen.getByText('SSL ile korunan güvenli ödeme')).toBeInTheDocument()
    })
  })

  describe('Price Formatting', () => {
    it('should format prices with 2 decimal places', () => {
      const props = {
        ...defaultProps,
        baseTotalPrice: 199.5,
        totalBaggagePrice: 25.7,
        taxes: 15.25,
        finalTotalPrice: 240.45
      }
      
      render(<PriceSummary {...props} />)
      
      expect(screen.getByText('199.50 EUR')).toBeInTheDocument()
      expect(screen.getByText('25.70 EUR')).toBeInTheDocument()
      expect(screen.getByText('15.25 EUR')).toBeInTheDocument()
      expect(screen.getByText('240.45 EUR')).toBeInTheDocument()
    })

    it('should handle zero values correctly', () => {
      const props = {
        ...defaultProps,
        baseTotalPrice: 0,
        totalBaggagePrice: 0,
        taxes: 0,
        finalTotalPrice: 0
      }
      
      render(<PriceSummary {...props} />)
      
      expect(screen.getByText('0.00 EUR')).toBeInTheDocument()
      expect(screen.queryByText('Ek Bagaj Ücreti')).not.toBeInTheDocument()
    })

    it('should handle very large numbers', () => {
      const props = {
        ...defaultProps,
        baseTotalPrice: 9999.99,
        finalTotalPrice: 10999.99
      }
      
      render(<PriceSummary {...props} />)
      
      expect(screen.getByText('9999.99 EUR')).toBeInTheDocument()
      expect(screen.getByText('10999.99 EUR')).toBeInTheDocument()
    })

    it('should handle different passenger counts', () => {
      const testCases = [1, 5, 10, 99]
      
      testCases.forEach(count => {
        const { rerender } = render(<PriceSummary {...defaultProps} totalPassengers={count} />)
        
        expect(screen.getByText(`Bilet Fiyatı (x${count})`)).toBeInTheDocument()
        
        if (count < testCases.length) {
          rerender(<PriceSummary {...defaultProps} totalPassengers={testCases[count]} />)
        }
      })
    })
  })

  describe('User Interactions', () => {
    it('should call onTermsChange when checkbox is clicked', () => {
      const onTermsChange = jest.fn()
      render(<PriceSummary {...defaultProps} onTermsChange={onTermsChange} />)
      
      const checkbox = screen.getByRole('checkbox', { name: /Havayolu Taşıma Kuralları/ })
      fireEvent.click(checkbox)
      
      expect(onTermsChange).toHaveBeenCalledWith(true)
    })

    it('should call onTermsChange with false when unchecking', () => {
      const onTermsChange = jest.fn()
      render(<PriceSummary {...defaultProps} termsAccepted={true} onTermsChange={onTermsChange} />)
      
      const checkbox = screen.getByRole('checkbox', { name: /Havayolu Taşıma Kuralları/ })
      fireEvent.click(checkbox)
      
      expect(onTermsChange).toHaveBeenCalledWith(false)
    })

    it('should call onBookingTypeChange when reserve radio is selected', () => {
      const onBookingTypeChange = jest.fn()
      render(<PriceSummary {...defaultProps} onBookingTypeChange={onBookingTypeChange} />)
      
      const reserveRadio = screen.getByLabelText('Rezervasyon Yap')
      fireEvent.click(reserveRadio)
      
      expect(onBookingTypeChange).toHaveBeenCalledWith('reserve')
    })

    it('should call onBookingTypeChange when book radio is selected', () => {
      const onBookingTypeChange = jest.fn()
      render(<PriceSummary {...defaultProps} bookingType="reserve" onBookingTypeChange={onBookingTypeChange} />)
      
      const bookRadio = screen.getByLabelText('Bileti Al')
      fireEvent.click(bookRadio)
      
      expect(onBookingTypeChange).toHaveBeenCalledWith('book')
    })

    it('should call onProceedToPayment when button is clicked and terms accepted', () => {
      const onProceedToPayment = jest.fn()
      render(<PriceSummary {...defaultProps} termsAccepted={true} onProceedToPayment={onProceedToPayment} />)
      
      const button = screen.getByRole('button', { name: /Ödemeye İlerle/ })
      fireEvent.click(button)
      
      expect(onProceedToPayment).toHaveBeenCalled()
    })

    it('should not call onProceedToPayment when button is clicked and terms not accepted', () => {
      const onProceedToPayment = jest.fn()
      render(<PriceSummary {...defaultProps} termsAccepted={false} onProceedToPayment={onProceedToPayment} />)
      
      const button = screen.getByRole('button', { name: /Ödemeye İlerle/ })
      fireEvent.click(button)
      
      expect(onProceedToPayment).not.toHaveBeenCalled()
    })
  })

  describe('Button States', () => {
    it('should disable payment button when terms not accepted', () => {
      render(<PriceSummary {...defaultProps} termsAccepted={false} />)
      
      const button = screen.getByRole('button', { name: /Ödemeye İlerle/ })
      expect(button).toBeDisabled()
    })

    it('should enable payment button when terms accepted', () => {
      render(<PriceSummary {...defaultProps} termsAccepted={true} />)
      
      const button = screen.getByRole('button', { name: /Ödemeye İlerle/ })
      expect(button).not.toBeDisabled()
    })

    it('should have correct CSS classes when disabled', () => {
      render(<PriceSummary {...defaultProps} termsAccepted={false} />)
      
      const button = screen.getByRole('button', { name: /Ödemeye İlerle/ })
      expect(button).toHaveClass('disabled:bg-gray-400', 'disabled:cursor-not-allowed')
    })

    it('should have correct CSS classes when enabled', () => {
      render(<PriceSummary {...defaultProps} termsAccepted={true} />)
      
      const button = screen.getByRole('button', { name: /Ödemeye İlerle/ })
      expect(button).toHaveClass('bg-green-500', 'hover:bg-green-600')
    })
  })

  describe('Radio Button States', () => {
    it('should show reserve option as selected when bookingType is reserve', () => {
      render(<PriceSummary {...defaultProps} bookingType="reserve" />)
      
      const reserveRadio = screen.getByLabelText('Rezervasyon Yap')
      const bookRadio = screen.getByLabelText('Bileti Al')
      
      expect(reserveRadio).toBeChecked()
      expect(bookRadio).not.toBeChecked()
    })

    it('should show book option as selected when bookingType is book', () => {
      render(<PriceSummary {...defaultProps} bookingType="book" />)
      
      const reserveRadio = screen.getByLabelText('Rezervasyon Yap')
      const bookRadio = screen.getByLabelText('Bileti Al')
      
      expect(reserveRadio).not.toBeChecked()
      expect(bookRadio).toBeChecked()
    })

    it('should have correct radio button names', () => {
      render(<PriceSummary {...defaultProps} />)
      
      const reserveRadio = screen.getByLabelText('Rezervasyon Yap')
      const bookRadio = screen.getByLabelText('Bileti Al')
      
      expect(reserveRadio).toHaveAttribute('name', 'bookingType')
      expect(bookRadio).toHaveAttribute('name', 'bookingType')
    })

    it('should have correct radio button values', () => {
      render(<PriceSummary {...defaultProps} />)
      
      const reserveRadio = screen.getByLabelText('Rezervasyon Yap')
      const bookRadio = screen.getByLabelText('Bileti Al')
      
      expect(reserveRadio).toHaveAttribute('value', 'reserve')
      expect(bookRadio).toHaveAttribute('value', 'book')
    })
  })

  describe('Checkbox States', () => {
    it('should show checkbox as checked when termsAccepted is true', () => {
      render(<PriceSummary {...defaultProps} termsAccepted={true} />)
      
      const checkbox = screen.getByRole('checkbox', { name: /Havayolu Taşıma Kuralları/ })
      expect(checkbox).toBeChecked()
    })

    it('should show checkbox as unchecked when termsAccepted is false', () => {
      render(<PriceSummary {...defaultProps} termsAccepted={false} />)
      
      const checkbox = screen.getByRole('checkbox', { name: /Havayolu Taşıma Kuralları/ })
      expect(checkbox).not.toBeChecked()
    })

    it('should have correct checkbox ID', () => {
      render(<PriceSummary {...defaultProps} />)
      
      const checkbox = screen.getByRole('checkbox', { name: /Havayolu Taşıma Kuralları/ })
      expect(checkbox).toHaveAttribute('id', 'terms')
    })

    it('should have correct checkbox styling classes', () => {
      render(<PriceSummary {...defaultProps} />)
      
      const checkbox = screen.getByRole('checkbox', { name: /Havayolu Taşıma Kuralları/ })
      expect(checkbox).toHaveClass('h-4', 'w-4', 'text-green-600', 'border-gray-300', 'rounded', 'focus:ring-green-500')
    })
  })

  describe('Links in Terms', () => {
    it('should render all terms and conditions links', () => {
      render(<PriceSummary {...defaultProps} />)
      
      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(3)
      
      expect(screen.getByRole('link', { name: /Havayolu Taşıma Kuralları/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Kullanım Şartları/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Gizlilik Politikası/ })).toBeInTheDocument()
    })

    it('should have correct link styling', () => {
      render(<PriceSummary {...defaultProps} />)
      
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveClass('underline', 'hover:text-green-700')
      })
    })

    it('should have href="#" for all links', () => {
      render(<PriceSummary {...defaultProps} />)
      
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveAttribute('href', '#')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper label association for checkbox', () => {
      render(<PriceSummary {...defaultProps} />)
      
      const checkbox = screen.getByRole('checkbox', { name: /Havayolu Taşıma Kuralları/ })
      const label = screen.getByText(/Havayolu Taşıma Kuralları/)
      
      expect(checkbox).toHaveAttribute('id', 'terms')
      expect(label.closest('label')).toHaveAttribute('for', 'terms')
    })

    it('should have proper radio button labels', () => {
      render(<PriceSummary {...defaultProps} />)
      
      const reserveRadio = screen.getByLabelText('Rezervasyon Yap')
      const bookRadio = screen.getByLabelText('Bileti Al')
      
      expect(reserveRadio).toBeInTheDocument()
      expect(bookRadio).toBeInTheDocument()
    })

    it('should have proper button accessibility', () => {
      render(<PriceSummary {...defaultProps} termsAccepted={true} />)
      
      const button = screen.getByRole('button', { name: /Ödemeye İlerle/ })
      expect(button).toHaveAttribute('type', 'button')
    })

    it('should have proper heading hierarchy', () => {
      render(<PriceSummary {...defaultProps} />)
      
      const heading = screen.getByRole('heading', { name: 'Fiyat Özeti' })
      expect(heading.tagName).toBe('H2')
    })
  })

  describe('Edge Cases', () => {
    it('should handle negative prices gracefully', () => {
      const props = {
        ...defaultProps,
        baseTotalPrice: -100,
        totalBaggagePrice: -20,
        taxes: -10,
        finalTotalPrice: -130
      }
      
      render(<PriceSummary {...props} />)
      
      expect(screen.getByText('-100.00 EUR')).toBeInTheDocument()
      expect(screen.getByText('-20.00 EUR')).toBeInTheDocument()
      expect(screen.getByText('-10.00 EUR')).toBeInTheDocument()
      expect(screen.getByText('-130.00 EUR')).toBeInTheDocument()
    })

    it('should handle very small decimal values', () => {
      const props = {
        ...defaultProps,
        baseTotalPrice: 0.01,
        totalBaggagePrice: 0.001,
        taxes: 0.005,
        finalTotalPrice: 0.016
      }
      
      render(<PriceSummary {...props} />)
      
      expect(screen.getByText('0.01 EUR')).toBeInTheDocument()
      expect(screen.getByText('0.00 EUR')).toBeInTheDocument() // 0.001 rounds to 0.00
      expect(screen.getByText('0.02 EUR')).toBeInTheDocument() // 0.016 rounds to 0.02
    })

    it('should handle zero passengers', () => {
      render(<PriceSummary {...defaultProps} totalPassengers={0} />)
      
      expect(screen.getByText('Bilet Fiyatı (x0)')).toBeInTheDocument()
    })

    it('should handle undefined callback functions gracefully', () => {
      const props = {
        ...defaultProps,
        onTermsChange: undefined as any,
        onBookingTypeChange: undefined as any,
        onProceedToPayment: undefined as any
      }
      
      expect(() => render(<PriceSummary {...props} />)).not.toThrow()
    })

    it('should handle rapid clicking on payment button', () => {
      const onProceedToPayment = jest.fn()
      render(<PriceSummary {...defaultProps} termsAccepted={true} onProceedToPayment={onProceedToPayment} />)
      
      const button = screen.getByRole('button', { name: /Ödemeye İlerle/ })
      
      // Rapid clicks
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)
      
      expect(onProceedToPayment).toHaveBeenCalledTimes(3)
    })
  })

  describe('Component Structure', () => {
    it('should have sticky positioning', () => {
      render(<PriceSummary {...defaultProps} />)
      
      const container = screen.getByText('Fiyat Özeti').closest('div')
      expect(container).toHaveClass('sticky', 'top-24')
    })

    it('should have correct styling classes', () => {
      render(<PriceSummary {...defaultProps} />)
      
      const container = screen.getByText('Fiyat Özeti').closest('div')
      expect(container).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'p-6')
    })

    it('should have proper border separator', () => {
      render(<PriceSummary {...defaultProps} />)
      
      const separator = container.querySelector('.border-t')
      expect(separator).toBeInTheDocument()
      expect(separator).toHaveClass('my-4')
    })

    it('should render Shield icon in button', () => {
      render(<PriceSummary {...defaultProps} termsAccepted={true} />)
      
      const button = screen.getByRole('button', { name: /Ödemeye İlerle/ })
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('should render Lock icon in security message', () => {
      render(<PriceSummary {...defaultProps} />)
      
      const securityMessage = screen.getByText('SSL ile korunan güvenli ödeme')
      const lockIcon = securityMessage.parentElement?.querySelector('svg')
      expect(lockIcon).toBeInTheDocument()
    })
  })
})