import {
  hasDigit,
  hasLowerCaseChar,
  hasMaxLenght,
  hasMinLenght,
  hasNoWhitespace,
  hasOnlyAscii,
  hasSpecialChar,
  hasUpperCaseChar,
} from '../../../main/utils/string-validation'

describe('string-validation', () => {
  describe('hasMinLenght', () => {
    test('should pass for lengths', () => {
      const hasMinLenghtFunction = hasMinLenght(8)
      expect(hasMinLenghtFunction('a')).toEqual(false)
      expect(hasMinLenghtFunction('abcdefgh')).toEqual(true)
    })
  })
  describe('hasMaxLenght', () => {
    test('should pass for lengths', () => {
      const hasMaxLenghtFunction = hasMaxLenght(8)
      expect(hasMaxLenghtFunction('abcdefghi')).toEqual(false)
      expect(hasMaxLenghtFunction('abcdefgh')).toEqual(true)
    })
  })
  describe('hasLowerCaseChar', () => {
    test('should pass', () => {
      expect(hasLowerCaseChar('A')).toEqual(false)
      expect(hasLowerCaseChar('a')).toEqual(true)
    })
  })
  describe('hasUpperCaseChar', () => {
    test('should pass', () => {
      expect(hasUpperCaseChar('a')).toEqual(false)
      expect(hasUpperCaseChar('A')).toEqual(true)
    })
  })
  describe('hasDigit', () => {
    test('should pass', () => {
      expect(hasDigit('a')).toEqual(false)
      expect(hasDigit('0')).toEqual(true)
    })
  })
  describe('hasNoWhitespace', () => {
    test('should pass', () => {
      expect(hasNoWhitespace('a a')).toEqual(false)
      expect(hasNoWhitespace('aa')).toEqual(true)
    })
  })
  describe('hasSpecialChar', () => {
    test('should pass', () => {
      expect(hasSpecialChar('aa')).toEqual(false)
      Array.from('!"#$%&\'()*+,-./:;<=>?@[]^_`{|}~').forEach((s) => {
        const stringToTest = `a${s}a`
        expect(hasSpecialChar(stringToTest)).toEqual(true)
      })
    })
  })
  describe('hasOnlyAscii', () => {
    test('should pass', () => {
      expect(hasOnlyAscii('')).toEqual(true)
      expect(hasOnlyAscii('.')).toEqual(true)
      expect(hasOnlyAscii('é')).toEqual(false)
      expect(hasOnlyAscii('⌣')).toEqual(false)
      Array.from('!"#$%&\'()*+,-./:;<=>?@[]^_`{|}~').forEach((s) => {
        const stringToTest = `a${s}a`
        expect(hasOnlyAscii(stringToTest)).toEqual(true)
      })
    })
  })
  describe('password', () => {
    test('should pass', () => {
      const password = 'P)ssw0rd'
      expect(hasMinLenght(8)(password)).toEqual(true)
      expect(hasMaxLenght(50)(password)).toEqual(true)
      expect(hasLowerCaseChar(password)).toEqual(true)
      expect(hasUpperCaseChar(password)).toEqual(true)
      expect(hasDigit(password)).toEqual(true)
      expect(hasNoWhitespace(password)).toEqual(true)
      expect(hasSpecialChar(password)).toEqual(true)
      expect(hasOnlyAscii(password)).toEqual(true)
    })
  })
})
