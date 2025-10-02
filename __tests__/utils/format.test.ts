import { formatDate, formatShortDate } from '@/utils/format'

// Mock date-fns to control the output
jest.mock('date-fns', () => {
  const actual = jest.requireActual('date-fns')
  return {
    ...actual,
    format: jest.fn(),
    parseISO: jest.fn()
  }
})

jest.mock('date-fns/locale', () => ({
  tr: 'mock-tr-locale'
}))

import { format, parseISO } from 'date-fns'

const mockFormat = format as jest.MockedFunction<typeof format>
const mockParseISO = parseISO as jest.MockedFunction<typeof parseISO>

describe('format utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('formatDate', () => {
    it('should format valid date string correctly', () => {
      const mockDate = new Date('2024-01-15T10:30:00Z')
      const expectedOutput = '15 Oca 2024 Pzt'
      
      mockParseISO.mockReturnValue(mockDate)
      mockFormat.mockReturnValue(expectedOutput)

      const result = formatDate('2024-01-15T10:30:00Z')

      expect(mockParseISO).toHaveBeenCalledWith('2024-01-15T10:30:00Z')
      expect(mockFormat).toHaveBeenCalledWith(mockDate, 'dd MMM yyyy EEE', { locale: 'mock-tr-locale' })
      expect(result).toBe(expectedOutput)
    })

    it('should return empty string for empty input', () => {
      const result = formatDate('')
      
      expect(result).toBe('')
      expect(mockParseISO).not.toHaveBeenCalled()
      expect(mockFormat).not.toHaveBeenCalled()
    })

    it('should return empty string for null input', () => {
      const result = formatDate(null as any)
      
      expect(result).toBe('')
      expect(mockParseISO).not.toHaveBeenCalled()
      expect(mockFormat).not.toHaveBeenCalled()
    })

    it('should return empty string for undefined input', () => {
      const result = formatDate(undefined as any)
      
      expect(result).toBe('')
      expect(mockParseISO).not.toHaveBeenCalled()
      expect(mockFormat).not.toHaveBeenCalled()
    })

    it('should return original string when parseISO throws error', () => {
      const invalidDateStr = 'invalid-date'
      mockParseISO.mockImplementation(() => {
        throw new Error('Invalid date')
      })

      const result = formatDate(invalidDateStr)

      expect(mockParseISO).toHaveBeenCalledWith(invalidDateStr)
      expect(mockFormat).not.toHaveBeenCalled()
      expect(result).toBe(invalidDateStr)
    })

    it('should return original string when format throws error', () => {
      const dateStr = '2024-01-15T10:30:00Z'
      const mockDate = new Date(dateStr)
      
      mockParseISO.mockReturnValue(mockDate)
      mockFormat.mockImplementation(() => {
        throw new Error('Format error')
      })

      const result = formatDate(dateStr)

      expect(mockParseISO).toHaveBeenCalledWith(dateStr)
      expect(mockFormat).toHaveBeenCalledWith(mockDate, 'dd MMM yyyy EEE', { locale: 'mock-tr-locale' })
      expect(result).toBe(dateStr)
    })

    it('should handle different valid date formats', () => {
      const testCases = [
        { input: '2024-01-15', expected: '15 Oca 2024 Pzt' },
        { input: '2024-12-31T23:59:59Z', expected: '31 Ara 2024 Sal' },
        { input: '2023-06-15T12:00:00.000Z', expected: '15 Haz 2023 Per' }
      ]

      testCases.forEach(({ input, expected }, index) => {
        const mockDate = new Date(input)
        mockParseISO.mockReturnValue(mockDate)
        mockFormat.mockReturnValue(expected)

        const result = formatDate(input)

        expect(result).toBe(expected)
        expect(mockParseISO).toHaveBeenNthCalledWith(index + 1, input)
        expect(mockFormat).toHaveBeenNthCalledWith(index + 1, mockDate, 'dd MMM yyyy EEE', { locale: 'mock-tr-locale' })
      })
    })

    it('should handle edge case dates', () => {
      const edgeCases = [
        '1970-01-01T00:00:00Z', // Unix epoch
        '2038-01-19T03:14:07Z', // Near 32-bit timestamp limit
        '2000-02-29T12:00:00Z', // Leap year
        '1999-12-31T23:59:59Z'  // Y2K edge
      ]

      edgeCases.forEach((dateStr, index) => {
        const mockDate = new Date(dateStr)
        const expectedOutput = `formatted-date-${index}`
        
        mockParseISO.mockReturnValue(mockDate)
        mockFormat.mockReturnValue(expectedOutput)

        const result = formatDate(dateStr)

        expect(result).toBe(expectedOutput)
        expect(mockParseISO).toHaveBeenCalledWith(dateStr)
        expect(mockFormat).toHaveBeenCalledWith(mockDate, 'dd MMM yyyy EEE', { locale: 'mock-tr-locale' })
      })
    })

    it('should handle whitespace-only strings', () => {
      const whitespaceInputs = ['   ', '\t', '\n', ' \t\n ']

      whitespaceInputs.forEach(input => {
        const result = formatDate(input)
        expect(result).toBe(input) // Should be treated as truthy but invalid
        expect(mockParseISO).toHaveBeenCalledWith(input)
      })
    })
  })

  describe('formatShortDate', () => {
    it('should format valid date string correctly with short format', () => {
      const mockDate = new Date('2024-01-15T10:30:00Z')
      const expectedOutput = '15 Oca Pzt'
      
      mockParseISO.mockReturnValue(mockDate)
      mockFormat.mockReturnValue(expectedOutput)

      const result = formatShortDate('2024-01-15T10:30:00Z')

      expect(mockParseISO).toHaveBeenCalledWith('2024-01-15T10:30:00Z')
      expect(mockFormat).toHaveBeenCalledWith(mockDate, 'dd MMM EEE', { locale: 'mock-tr-locale' })
      expect(result).toBe(expectedOutput)
    })

    it('should return empty string for empty input', () => {
      const result = formatShortDate('')
      
      expect(result).toBe('')
      expect(mockParseISO).not.toHaveBeenCalled()
      expect(mockFormat).not.toHaveBeenCalled()
    })

    it('should return empty string for null input', () => {
      const result = formatShortDate(null as any)
      
      expect(result).toBe('')
      expect(mockParseISO).not.toHaveBeenCalled()
      expect(mockFormat).not.toHaveBeenCalled()
    })

    it('should return empty string for undefined input', () => {
      const result = formatShortDate(undefined as any)
      
      expect(result).toBe('')
      expect(mockParseISO).not.toHaveBeenCalled()
      expect(mockFormat).not.toHaveBeenCalled()
    })

    it('should return original string when parseISO throws error', () => {
      const invalidDateStr = 'not-a-date'
      mockParseISO.mockImplementation(() => {
        throw new Error('Invalid date format')
      })

      const result = formatShortDate(invalidDateStr)

      expect(mockParseISO).toHaveBeenCalledWith(invalidDateStr)
      expect(mockFormat).not.toHaveBeenCalled()
      expect(result).toBe(invalidDateStr)
    })

    it('should return original string when format throws error', () => {
      const dateStr = '2024-01-15T10:30:00Z'
      const mockDate = new Date(dateStr)
      
      mockParseISO.mockReturnValue(mockDate)
      mockFormat.mockImplementation(() => {
        throw new Error('Formatting failed')
      })

      const result = formatShortDate(dateStr)

      expect(mockParseISO).toHaveBeenCalledWith(dateStr)
      expect(mockFormat).toHaveBeenCalledWith(mockDate, 'dd MMM EEE', { locale: 'mock-tr-locale' })
      expect(result).toBe(dateStr)
    })

    it('should use correct short format pattern', () => {
      const dateStr = '2024-06-15T12:00:00Z'
      const mockDate = new Date(dateStr)
      const expectedOutput = '15 Haz Cum'
      
      mockParseISO.mockReturnValue(mockDate)
      mockFormat.mockReturnValue(expectedOutput)

      const result = formatShortDate(dateStr)

      expect(mockFormat).toHaveBeenCalledWith(mockDate, 'dd MMM EEE', { locale: 'mock-tr-locale' })
      expect(result).toBe(expectedOutput)
    })

    it('should handle different months correctly', () => {
      const monthTests = [
        { date: '2024-01-01', expected: '01 Oca Pzt' },
        { date: '2024-02-01', expected: '01 Şub Per' },
        { date: '2024-03-01', expected: '01 Mar Cum' },
        { date: '2024-04-01', expected: '01 Nis Pzt' },
        { date: '2024-05-01', expected: '01 May Çar' },
        { date: '2024-06-01', expected: '01 Haz Cum' },
        { date: '2024-07-01', expected: '01 Tem Pzt' },
        { date: '2024-08-01', expected: '01 Ağu Per' },
        { date: '2024-09-01', expected: '01 Eyl Paz' },
        { date: '2024-10-01', expected: '01 Eki Sal' },
        { date: '2024-11-01', expected: '01 Kas Cum' },
        { date: '2024-12-01', expected: '01 Ara Paz' }
      ]

      monthTests.forEach(({ date, expected }, index) => {
        const mockDate = new Date(date)
        mockParseISO.mockReturnValue(mockDate)
        mockFormat.mockReturnValue(expected)

        const result = formatShortDate(date)

        expect(result).toBe(expected)
        expect(mockFormat).toHaveBeenNthCalledWith(index + 1, mockDate, 'dd MMM EEE', { locale: 'mock-tr-locale' })
      })
    })

    it('should handle leap year dates', () => {
      const leapYearDate = '2024-02-29T12:00:00Z'
      const mockDate = new Date(leapYearDate)
      const expectedOutput = '29 Şub Per'
      
      mockParseISO.mockReturnValue(mockDate)
      mockFormat.mockReturnValue(expectedOutput)

      const result = formatShortDate(leapYearDate)

      expect(result).toBe(expectedOutput)
      expect(mockParseISO).toHaveBeenCalledWith(leapYearDate)
      expect(mockFormat).toHaveBeenCalledWith(mockDate, 'dd MMM EEE', { locale: 'mock-tr-locale' })
    })
  })

  describe('Comparison between formatDate and formatShortDate', () => {
    it('should use different format patterns', () => {
      const dateStr = '2024-01-15T10:30:00Z'
      const mockDate = new Date(dateStr)
      
      mockParseISO.mockReturnValue(mockDate)
      mockFormat.mockReturnValue('formatted-output')

      formatDate(dateStr)
      formatShortDate(dateStr)

      expect(mockFormat).toHaveBeenNthCalledWith(1, mockDate, 'dd MMM yyyy EEE', { locale: 'mock-tr-locale' })
      expect(mockFormat).toHaveBeenNthCalledWith(2, mockDate, 'dd MMM EEE', { locale: 'mock-tr-locale' })
    })

    it('should both handle errors the same way', () => {
      const invalidDate = 'invalid-date-string'
      
      mockParseISO.mockImplementation(() => {
        throw new Error('Parse error')
      })

      const longResult = formatDate(invalidDate)
      const shortResult = formatShortDate(invalidDate)

      expect(longResult).toBe(invalidDate)
      expect(shortResult).toBe(invalidDate)
    })

    it('should both return empty string for falsy values', () => {
      const falsyValues = ['', null, undefined]

      falsyValues.forEach(value => {
        expect(formatDate(value as any)).toBe('')
        expect(formatShortDate(value as any)).toBe('')
      })
    })

    it('should both use Turkish locale', () => {
      const dateStr = '2024-01-15T10:30:00Z'
      const mockDate = new Date(dateStr)
      
      mockParseISO.mockReturnValue(mockDate)
      mockFormat.mockReturnValue('output')

      formatDate(dateStr)
      formatShortDate(dateStr)

      expect(mockFormat).toHaveBeenCalledWith(mockDate, expect.any(String), { locale: 'mock-tr-locale' })
      expect(mockFormat).toHaveBeenCalledWith(mockDate, expect.any(String), { locale: 'mock-tr-locale' })
    })
  })

  describe('Error Handling Edge Cases', () => {
    it('should handle parseISO returning invalid date', () => {
      const invalidDateStr = '2024-13-40' // Invalid month and day
      mockParseISO.mockReturnValue(new Date('Invalid Date'))
      mockFormat.mockImplementation(() => {
        throw new Error('Invalid date object')
      })

      const longResult = formatDate(invalidDateStr)
      const shortResult = formatShortDate(invalidDateStr)

      expect(longResult).toBe(invalidDateStr)
      expect(shortResult).toBe(invalidDateStr)
    })

    it('should handle very long date strings', () => {
      const longDateStr = '2024-01-15T10:30:00.123456789Z' + 'x'.repeat(1000)
      mockParseISO.mockImplementation(() => {
        throw new Error('String too long')
      })

      const longResult = formatDate(longDateStr)
      const shortResult = formatShortDate(longDateStr)

      expect(longResult).toBe(longDateStr)
      expect(shortResult).toBe(longDateStr)
    })

    it('should handle special characters in date strings', () => {
      const specialDateStr = '2024-01-15T10:30:00Z<script>alert("xss")</script>'
      mockParseISO.mockImplementation(() => {
        throw new Error('Invalid characters')
      })

      const longResult = formatDate(specialDateStr)
      const shortResult = formatShortDate(specialDateStr)

      expect(longResult).toBe(specialDateStr)
      expect(shortResult).toBe(specialDateStr)
    })

    it('should handle numeric inputs converted to string', () => {
      const numericInput = 1642248600000 // Timestamp
      const stringInput = String(numericInput)
      
      mockParseISO.mockImplementation(() => {
        throw new Error('Not ISO format')
      })

      const longResult = formatDate(stringInput)
      const shortResult = formatShortDate(stringInput)

      expect(longResult).toBe(stringInput)
      expect(shortResult).toBe(stringInput)
    })
  })
})