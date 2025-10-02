import { render, screen, fireEvent } from '@testing-library/react'
import ContactForm from '@/components/booking/ContactForm'

describe('ContactForm', () => {
  const defaultProps = {
    userEmail: null,
    userPhone: null,
    onEmailChange: jest.fn(),
    onPhoneChange: jest.fn(),
    onCountryCodeChange: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render email input with label', () => {
      render(<ContactForm {...defaultProps} />)
      
      expect(screen.getByLabelText('E-posta adresiniz')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('ornek@eposta.com')).toBeInTheDocument()
    })

    it('should render phone input with label', () => {
      render(<ContactForm {...defaultProps} />)
      
      expect(screen.getByLabelText('Cep Telefonunuz')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('5XX XXX XX XX')).toBeInTheDocument()
    })

    it('should render country code select', () => {
      render(<ContactForm {...defaultProps} />)
      
      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()
      expect(screen.getByText('🇹🇷 +90')).toBeInTheDocument()
    })

    it('should render marketing consent checkbox', () => {
      render(<ContactForm {...defaultProps} />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).not.toBeChecked()
    })
  })

  describe('Input Values', () => {
    it('should display email value', () => {
      render(<ContactForm {...defaultProps} userEmail="test@example.com" />)
      
      const emailInput = screen.getByLabelText('E-posta adresiniz')
      expect(emailInput).toHaveValue('test@example.com')
    })

    it('should display phone value', () => {
      render(<ContactForm {...defaultProps} userPhone="5551234567" />)
      
      const phoneInput = screen.getByLabelText('Cep Telefonunuz')
      expect(phoneInput).toHaveValue('5551234567')
    })

    it('should handle null values', () => {
      render(<ContactForm {...defaultProps} userEmail={null} userPhone={null} />)
      
      const emailInput = screen.getByLabelText('E-posta adresiniz')
      const phoneInput = screen.getByLabelText('Cep Telefonunuz')
      
      expect(emailInput).toHaveValue('')
      expect(phoneInput).toHaveValue('')
    })
  })

  describe('User Interactions', () => {
    it('should call onEmailChange when email changes', () => {
      const onEmailChange = jest.fn()
      render(<ContactForm {...defaultProps} onEmailChange={onEmailChange} />)
      
      const emailInput = screen.getByLabelText('E-posta adresiniz')
      fireEvent.change(emailInput, { target: { value: 'new@email.com' } })
      
      expect(onEmailChange).toHaveBeenCalledWith('new@email.com')
    })

    it('should call onPhoneChange when phone changes', () => {
      const onPhoneChange = jest.fn()
      render(<ContactForm {...defaultProps} onPhoneChange={onPhoneChange} />)
      
      const phoneInput = screen.getByLabelText('Cep Telefonunuz')
      fireEvent.change(phoneInput, { target: { value: '5551234567' } })
      
      expect(onPhoneChange).toHaveBeenCalledWith('5551234567')
    })

    it('should call onCountryCodeChange when country changes', () => {
      const onCountryCodeChange = jest.fn()
      render(<ContactForm {...defaultProps} onCountryCodeChange={onCountryCodeChange} />)
      
      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: '+49' } })
      
      expect(onCountryCodeChange).toHaveBeenCalledWith('+49')
    })
  })

  describe('Country Options', () => {
    it('should render all country options', () => {
      render(<ContactForm {...defaultProps} />)
      
      const countries = [
        '🇹🇷 +90', '🇩🇪 +49', '🇫🇷 +33', '🇧🇪 +32', '🇳🇱 +31',
        '🇩🇰 +45', '🇬🇧 +44', '🇸🇪 +46', '🇨🇭 +41', '🇦🇹 +43'
      ]
      
      countries.forEach(country => {
        expect(screen.getByText(country)).toBeInTheDocument()
      })
    })

    it('should have correct option values', () => {
      render(<ContactForm {...defaultProps} />)
      
      const options = screen.getAllByRole('option')
      const expectedValues = ['+90', '+49', '+33', '+32', '+31', '+45', '+44', '+46', '+41', '+43']
      
      options.forEach((option, index) => {
        expect(option).toHaveAttribute('value', expectedValues[index])
      })
    })
  })

  describe('Input Types', () => {
    it('should have correct input types', () => {
      render(<ContactForm {...defaultProps} />)
      
      const emailInput = screen.getByLabelText('E-posta adresiniz')
      const phoneInput = screen.getByLabelText('Cep Telefonunuz')
      
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(phoneInput).toHaveAttribute('type', 'tel')
    })

    it('should have marketing checkbox with correct attributes', () => {
      render(<ContactForm {...defaultProps} />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('id', 'marketing-consent')
      expect(checkbox).toHaveAttribute('type', 'checkbox')
    })
  })

  describe('Text Content', () => {
    it('should render information text', () => {
      render(<ContactForm {...defaultProps} />)
      
      expect(screen.getByText('Uçuş ve bilet bilgilerinizi e-posta ve ücretsiz SMS yoluyla ileteceğiz.')).toBeInTheDocument()
    })

    it('should render consent text with link', () => {
      render(<ContactForm {...defaultProps} />)
      
      expect(screen.getByText(/Uçuş bilgilendirmeleri, fırsat ve kampanyalardan/)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Rıza Metni' })).toBeInTheDocument()
    })

    it('should have consent link with correct href', () => {
      render(<ContactForm {...defaultProps} />)
      
      const link = screen.getByRole('link', { name: 'Rıza Metni' })
      expect(link).toHaveAttribute('href', '#')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string values', () => {
      const onEmailChange = jest.fn()
      const onPhoneChange = jest.fn()
      
      render(<ContactForm {...defaultProps} onEmailChange={onEmailChange} onPhoneChange={onPhoneChange} />)
      
      const emailInput = screen.getByLabelText('E-posta adresiniz')
      const phoneInput = screen.getByLabelText('Cep Telefonunuz')
      
      fireEvent.change(emailInput, { target: { value: '' } })
      fireEvent.change(phoneInput, { target: { value: '' } })
      
      expect(onEmailChange).toHaveBeenCalledWith('')
      expect(onPhoneChange).toHaveBeenCalledWith('')
    })

    it('should handle special characters', () => {
      const onEmailChange = jest.fn()
      const onPhoneChange = jest.fn()
      
      render(<ContactForm {...defaultProps} onEmailChange={onEmailChange} onPhoneChange={onPhoneChange} />)
      
      const emailInput = screen.getByLabelText('E-posta adresiniz')
      const phoneInput = screen.getByLabelText('Cep Telefonunuz')
      
      fireEvent.change(emailInput, { target: { value: 'user+tag@domain.co.uk' } })
      fireEvent.change(phoneInput, { target: { value: '(555) 123-4567' } })
      
      expect(onEmailChange).toHaveBeenCalledWith('user+tag@domain.co.uk')
      expect(onPhoneChange).toHaveBeenCalledWith('(555) 123-4567')
    })

    it('should handle very long values', () => {
      const longEmail = 'very.long.email@very-long-domain.com'
      const longPhone = '12345678901234567890'
      
      render(<ContactForm {...defaultProps} userEmail={longEmail} userPhone={longPhone} />)
      
      const emailInput = screen.getByLabelText('E-posta adresiniz')
      const phoneInput = screen.getByLabelText('Cep Telefonunuz')
      
      expect(emailInput).toHaveValue(longEmail)
      expect(phoneInput).toHaveValue(longPhone)
    })

    it('should handle undefined callback functions', () => {
      const props = {
        ...defaultProps,
        onEmailChange: undefined as any,
        onPhoneChange: undefined as any,
        onCountryCodeChange: undefined as any
      }
      
      expect(() => render(<ContactForm {...props} />)).not.toThrow()
    })
  })

  describe('Multiple Interactions', () => {
    it('should handle multiple email changes', () => {
      const onEmailChange = jest.fn()
      render(<ContactForm {...defaultProps} onEmailChange={onEmailChange} />)
      
      const emailInput = screen.getByLabelText('E-posta adresiniz')
      
      fireEvent.change(emailInput, { target: { value: 'first@email.com' } })
      fireEvent.change(emailInput, { target: { value: 'second@email.com' } })
      
      expect(onEmailChange).toHaveBeenCalledTimes(2)
      expect(onEmailChange).toHaveBeenNthCalledWith(1, 'first@email.com')
      expect(onEmailChange).toHaveBeenNthCalledWith(2, 'second@email.com')
    })

    it('should handle all country code changes', () => {
      const onCountryCodeChange = jest.fn()
      render(<ContactForm {...defaultProps} onCountryCodeChange={onCountryCodeChange} />)
      
      const select = screen.getByRole('combobox')
      const codes = ['+49', '+33', '+32', '+31', '+45']
      
      codes.forEach((code, index) => {
        fireEvent.change(select, { target: { value: code } })
        expect(onCountryCodeChange).toHaveBeenNthCalledWith(index + 1, code)
      })
      
      expect(onCountryCodeChange).toHaveBeenCalledTimes(5)
    })
  })
})