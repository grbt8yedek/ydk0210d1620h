import { parseAirport, airportFromCode } from '@/utils/airport'

describe('airport utils', () => {
  describe('parseAirport', () => {
    it('should parse airport string with code and name correctly', () => {
      const result = parseAirport('IST - İstanbul Havalimanı')
      
      expect(result).toEqual({
        code: 'IST',
        name: 'İstanbul Havalimanı'
      })
    })

    it('should parse airport string with multiple dashes', () => {
      const result = parseAirport('JFK - John F. Kennedy International - New York')
      
      expect(result).toEqual({
        code: 'JFK',
        name: 'John F. Kennedy International - New York'
      })
    })

    it('should handle airport string with only code', () => {
      const result = parseAirport('IST')
      
      expect(result).toEqual({
        code: 'IST',
        name: ''
      })
    })

    it('should handle airport string with code and empty name', () => {
      const result = parseAirport('IST - ')
      
      expect(result).toEqual({
        code: 'IST',
        name: ''
      })
    })

    it('should handle empty string input', () => {
      const result = parseAirport('')
      
      expect(result).toEqual({
        code: '',
        name: ''
      })
    })

    it('should handle null input', () => {
      const result = parseAirport(null as any)
      
      expect(result).toEqual({
        code: '',
        name: ''
      })
    })

    it('should handle undefined input', () => {
      const result = parseAirport(undefined as any)
      
      expect(result).toEqual({
        code: '',
        name: ''
      })
    })

    it('should trim whitespace from code and name', () => {
      const result = parseAirport('  IST  -   İstanbul Havalimanı  ')
      
      expect(result).toEqual({
        code: 'IST',
        name: 'İstanbul Havalimanı'
      })
    })

    it('should handle string with no dash separator', () => {
      const result = parseAirport('Istanbul Airport')
      
      expect(result).toEqual({
        code: 'Istanbul Airport',
        name: ''
      })
    })

    it('should handle string with only dashes', () => {
      const result = parseAirport(' - - - ')
      
      expect(result).toEqual({
        code: '',
        name: '- -'
      })
    })

    it('should handle very long airport strings', () => {
      const longString = 'VERYLONGCODE - Very Long Airport Name That Exceeds Normal Length Limits And Contains Many Words'
      const result = parseAirport(longString)
      
      expect(result).toEqual({
        code: 'VERYLONGCODE',
        name: 'Very Long Airport Name That Exceeds Normal Length Limits And Contains Many Words'
      })
    })

    it('should handle special characters in airport names', () => {
      const result = parseAirport('CDG - Charles de Gaulle (Aéroport)')
      
      expect(result).toEqual({
        code: 'CDG',
        name: 'Charles de Gaulle (Aéroport)'
      })
    })

    it('should handle numeric codes', () => {
      const result = parseAirport('123 - Numeric Airport')
      
      expect(result).toEqual({
        code: '123',
        name: 'Numeric Airport'
      })
    })

    it('should handle empty name after dash', () => {
      const result = parseAirport('CODE -')
      
      expect(result).toEqual({
        code: 'CODE',
        name: ''
      })
    })

    it('should handle multiple consecutive dashes', () => {
      const result = parseAirport('ABC - - - Name')
      
      expect(result).toEqual({
        code: 'ABC',
        name: '- - Name'
      })
    })
  })

  describe('airportFromCode', () => {
    it('should return airport object with code for valid input', () => {
      const result = airportFromCode('IST')
      
      expect(result).toEqual({
        code: 'IST',
        name: 'IST',
        city: ''
      })
    })

    it('should handle different airport codes', () => {
      const codes = ['JFK', 'LHR', 'CDG', 'FRA', 'AMS']
      
      codes.forEach(code => {
        const result = airportFromCode(code)
        expect(result).toEqual({
          code: code,
          name: code,
          city: ''
        })
      })
    })

    it('should handle lowercase codes', () => {
      const result = airportFromCode('ist')
      
      expect(result).toEqual({
        code: 'ist',
        name: 'ist',
        city: ''
      })
    })

    it('should handle mixed case codes', () => {
      const result = airportFromCode('IsT')
      
      expect(result).toEqual({
        code: 'IsT',
        name: 'IsT',
        city: ''
      })
    })

    it('should handle numeric codes', () => {
      const result = airportFromCode('123')
      
      expect(result).toEqual({
        code: '123',
        name: '123',
        city: ''
      })
    })

    it('should handle codes with special characters', () => {
      const result = airportFromCode('AB-C')
      
      expect(result).toEqual({
        code: 'AB-C',
        name: 'AB-C',
        city: ''
      })
    })

    it('should handle very long codes', () => {
      const longCode = 'VERYLONGAIRPORTCODE'
      const result = airportFromCode(longCode)
      
      expect(result).toEqual({
        code: longCode,
        name: longCode,
        city: ''
      })
    })

    it('should handle empty string input', () => {
      const result = airportFromCode('')
      
      expect(result).toEqual({
        code: '',
        name: '',
        city: ''
      })
    })

    it('should handle null input', () => {
      const result = airportFromCode(null as any)
      
      expect(result).toEqual({
        code: '',
        name: '',
        city: ''
      })
    })

    it('should handle undefined input', () => {
      const result = airportFromCode(undefined as any)
      
      expect(result).toEqual({
        code: '',
        name: '',
        city: ''
      })
    })

    it('should handle whitespace-only input', () => {
      const result = airportFromCode('   ')
      
      expect(result).toEqual({
        code: '   ',
        name: '   ',
        city: ''
      })
    })

    it('should handle codes with spaces', () => {
      const result = airportFromCode('AB C')
      
      expect(result).toEqual({
        code: 'AB C',
        name: 'AB C',
        city: ''
      })
    })

    it('should always return empty city', () => {
      const codes = ['IST', 'JFK', 'LHR', '', 'test123', '!@#']
      
      codes.forEach(code => {
        const result = airportFromCode(code)
        expect(result.city).toBe('')
      })
    })

    it('should always set name equal to code', () => {
      const codes = ['IST', 'lowercase', 'MiXeD', '123', '!@#$', '   ']
      
      codes.forEach(code => {
        const result = airportFromCode(code)
        expect(result.name).toBe(code)
        expect(result.code).toBe(code)
      })
    })
  })

  describe('Function Behavior', () => {
    it('should be deterministic for parseAirport', () => {
      const input = 'IST - İstanbul Havalimanı'
      
      const result1 = parseAirport(input)
      const result2 = parseAirport(input)
      const result3 = parseAirport(input)
      
      expect(result1).toEqual(result2)
      expect(result2).toEqual(result3)
    })

    it('should be deterministic for airportFromCode', () => {
      const input = 'IST'
      
      const result1 = airportFromCode(input)
      const result2 = airportFromCode(input)
      const result3 = airportFromCode(input)
      
      expect(result1).toEqual(result2)
      expect(result2).toEqual(result3)
    })

    it('should not modify input strings', () => {
      const originalInput1 = '  IST - İstanbul  '
      const originalInput2 = '  JFK  '
      const input1Copy = originalInput1
      const input2Copy = originalInput2
      
      parseAirport(originalInput1)
      airportFromCode(originalInput2)
      
      expect(originalInput1).toBe(input1Copy)
      expect(originalInput2).toBe(input2Copy)
    })

    it('should return objects with consistent structure', () => {
      const parseResult = parseAirport('IST - İstanbul')
      const codeResult = airportFromCode('IST')
      
      expect(parseResult).toHaveProperty('code')
      expect(parseResult).toHaveProperty('name')
      expect(Object.keys(parseResult)).toHaveLength(2)
      
      expect(codeResult).toHaveProperty('code')
      expect(codeResult).toHaveProperty('name')
      expect(codeResult).toHaveProperty('city')
      expect(Object.keys(codeResult)).toHaveLength(3)
    })
  })
})