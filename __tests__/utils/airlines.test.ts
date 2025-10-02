import { getAirlineCheckInUrl } from '@/utils/airlines'

describe('getAirlineCheckInUrl', () => {
  describe('Valid Airline Names', () => {
    it('should return correct URL for Turkish Airlines', () => {
      const result = getAirlineCheckInUrl('turkish airlines')
      expect(result).toBe('https://www.turkishairlines.com/tr-tr/ucak-bileti/online-check-in/')
    })

    it('should return correct URL for Pegasus Airlines', () => {
      const result = getAirlineCheckInUrl('pegasus airlines')
      expect(result).toBe('https://www.flypgs.com/online-check-in')
    })

    it('should return correct URL for SunExpress', () => {
      const result = getAirlineCheckInUrl('sunexpress')
      expect(result).toBe('https://www.sunexpress.com/tr/online-check-in/')
    })

    it('should return correct URL for AnadoluJet', () => {
      const result = getAirlineCheckInUrl('anadolujet')
      expect(result).toBe('https://www.anadolujet.com/tr/kurumsal/online-check-in')
    })

    it('should return correct URL for AJet', () => {
      const result = getAirlineCheckInUrl('ajet')
      expect(result).toBe('https://www.ajet.com/tr/online-islemler/check-in')
    })

    it('should return correct URL for Corendon Airlines', () => {
      const result = getAirlineCheckInUrl('corendon airlines')
      expect(result).toBe('https://www.corendonairlines.com/tr/online-check-in')
    })

    it('should return correct URL for Lufthansa', () => {
      const result = getAirlineCheckInUrl('lufthansa')
      expect(result).toBe('https://www.lufthansa.com/tr/tr/online-check-in')
    })

    it('should return correct URL for KLM', () => {
      const result = getAirlineCheckInUrl('klm')
      expect(result).toBe('https://www.klm.com.tr/check-in')
    })
  })

  describe('Case Insensitivity', () => {
    it('should handle uppercase airline names', () => {
      const result = getAirlineCheckInUrl('TURKISH AIRLINES')
      expect(result).toBe('https://www.turkishairlines.com/tr-tr/ucak-bileti/online-check-in/')
    })

    it('should handle mixed case airline names', () => {
      const result = getAirlineCheckInUrl('Turkish Airlines')
      expect(result).toBe('https://www.turkishairlines.com/tr-tr/ucak-bileti/online-check-in/')
    })

    it('should handle camelCase airline names', () => {
      const result = getAirlineCheckInUrl('turkishAirlines')
      expect(result).toBe(undefined) // Should not match due to no space
    })

    it('should handle all caps for single word airlines', () => {
      const result = getAirlineCheckInUrl('LUFTHANSA')
      expect(result).toBe('https://www.lufthansa.com/tr/tr/online-check-in')
    })

    it('should handle mixed case for single word airlines', () => {
      const result = getAirlineCheckInUrl('Lufthansa')
      expect(result).toBe('https://www.lufthansa.com/tr/tr/online-check-in')
    })

    it('should handle all lowercase', () => {
      const result = getAirlineCheckInUrl('pegasus airlines')
      expect(result).toBe('https://www.flypgs.com/online-check-in')
    })
  })

  describe('Whitespace Handling', () => {
    it('should handle leading and trailing spaces', () => {
      const result = getAirlineCheckInUrl('  turkish airlines  ')
      expect(result).toBe('https://www.turkishairlines.com/tr-tr/ucak-bileti/online-check-in/')
    })

    it('should handle multiple spaces between words', () => {
      const result = getAirlineCheckInUrl('turkish    airlines')
      expect(result).toBe(undefined) // Should not match due to multiple spaces
    })

    it('should handle tabs and other whitespace', () => {
      const result = getAirlineCheckInUrl('\tturkish airlines\n')
      expect(result).toBe('https://www.turkishairlines.com/tr-tr/ucak-bileti/online-check-in/')
    })

    it('should handle single word airlines with spaces', () => {
      const result = getAirlineCheckInUrl('  lufthansa  ')
      expect(result).toBe('https://www.lufthansa.com/tr/tr/online-check-in')
    })
  })

  describe('Invalid Inputs', () => {
    it('should return undefined for empty string', () => {
      const result = getAirlineCheckInUrl('')
      expect(result).toBe(undefined)
    })

    it('should return undefined for null input', () => {
      const result = getAirlineCheckInUrl(null as any)
      expect(result).toBe(undefined)
    })

    it('should return undefined for undefined input', () => {
      const result = getAirlineCheckInUrl(undefined as any)
      expect(result).toBe(undefined)
    })

    it('should return undefined for whitespace-only string', () => {
      const result = getAirlineCheckInUrl('   ')
      expect(result).toBe(undefined)
    })

    it('should return undefined for unknown airline', () => {
      const result = getAirlineCheckInUrl('unknown airline')
      expect(result).toBe(undefined)
    })

    it('should return undefined for partial matches', () => {
      const result = getAirlineCheckInUrl('turkish')
      expect(result).toBe(undefined)
    })

    it('should return undefined for airline with extra words', () => {
      const result = getAirlineCheckInUrl('turkish airlines international')
      expect(result).toBe(undefined)
    })

    it('should return undefined for numbers', () => {
      const result = getAirlineCheckInUrl('123')
      expect(result).toBe(undefined)
    })

    it('should return undefined for special characters', () => {
      const result = getAirlineCheckInUrl('@#$%^&*()')
      expect(result).toBe(undefined)
    })
  })

  describe('Edge Cases', () => {
    it('should handle airline names with different spacing', () => {
      const testCases = [
        { input: 'turkish airlines', expected: 'https://www.turkishairlines.com/tr-tr/ucak-bileti/online-check-in/' },
        { input: 'pegasus airlines', expected: 'https://www.flypgs.com/online-check-in' },
        { input: 'corendon airlines', expected: 'https://www.corendonairlines.com/tr/online-check-in' }
      ]

      testCases.forEach(({ input, expected }) => {
        const result = getAirlineCheckInUrl(input)
        expect(result).toBe(expected)
      })
    })

    it('should be case insensitive for all airlines', () => {
      const airlines = [
        'TURKISH AIRLINES',
        'PEGASUS AIRLINES', 
        'SUNEXPRESS',
        'ANADOLUJET',
        'AJET',
        'CORENDON AIRLINES',
        'LUFTHANSA',
        'KLM'
      ]

      airlines.forEach(airline => {
        const result = getAirlineCheckInUrl(airline)
        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
        expect(result).toMatch(/^https?:\/\//)
      })
    })

    it('should handle very long invalid airline names', () => {
      const longName = 'very long airline name that does not exist in our database'.repeat(10)
      const result = getAirlineCheckInUrl(longName)
      expect(result).toBe(undefined)
    })

    it('should handle airline names with special characters', () => {
      const specialNames = [
        'turkish-airlines',
        'turkish_airlines',
        'turkish.airlines',
        'turkish@airlines',
        'turkish#airlines'
      ]

      specialNames.forEach(name => {
        const result = getAirlineCheckInUrl(name)
        expect(result).toBe(undefined)
      })
    })

    it('should handle non-string inputs gracefully', () => {
      const nonStringInputs = [
        123,
        true,
        false,
        {},
        [],
        new Date(),
        Symbol('test')
      ]

      nonStringInputs.forEach(input => {
        const result = getAirlineCheckInUrl(input as any)
        expect(result).toBe(undefined)
      })
    })

    it('should verify all URLs are valid format', () => {
      const airlines = [
        'turkish airlines',
        'pegasus airlines',
        'sunexpress',
        'anadolujet',
        'ajet',
        'corendon airlines',
        'lufthansa',
        'klm'
      ]

      airlines.forEach(airline => {
        const result = getAirlineCheckInUrl(airline)
        expect(result).toBeDefined()
        expect(result).toMatch(/^https:\/\//)
        expect(result).not.toContain(' ')
        expect(result).toMatch(/\.(com|tr)/)
      })
    })
  })

  describe('Function Behavior', () => {
    it('should be deterministic - same input should always return same output', () => {
      const testInputs = [
        'turkish airlines',
        'LUFTHANSA',
        '  klm  ',
        'unknown airline',
        ''
      ]

      testInputs.forEach(input => {
        const result1 = getAirlineCheckInUrl(input)
        const result2 = getAirlineCheckInUrl(input)
        const result3 = getAirlineCheckInUrl(input)

        expect(result1).toBe(result2)
        expect(result2).toBe(result3)
      })
    })

    it('should not modify input string', () => {
      const originalInput = '  TURKISH AIRLINES  '
      const inputCopy = originalInput
      
      getAirlineCheckInUrl(originalInput)
      
      expect(originalInput).toBe(inputCopy)
    })

    it('should return string or undefined only', () => {
      const testInputs = [
        'turkish airlines',
        'unknown airline',
        '',
        null,
        undefined
      ]

      testInputs.forEach(input => {
        const result = getAirlineCheckInUrl(input as any)
        expect(typeof result === 'string' || result === undefined).toBe(true)
      })
    })
  })
})
