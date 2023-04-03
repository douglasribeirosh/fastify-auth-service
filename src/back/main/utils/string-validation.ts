import { z } from 'zod'

export const hasMinLenght = (min: number) => (s: string) => s.length >= min
export const hasMaxLenght = (max: number) => (s: string) => s.length <= max
export const hasLowerCaseChar = (s: string) => !!s.match(/.*[a-z].*/)
export const hasUpperCaseChar = (s: string) => !!s.match(/.*[A-Z].*/)
export const hasDigit = (s: string) => !!s.match(/.*\d.*/)
export const hasNoWhitespace = (s: string) => !s.includes(' ')
export const hasSpecialChar = (s: string) =>
  !!s.match(/.*[\!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\]\^\_\`\{\|\}\~].*/)
export const hasOnlyAscii = (s: string) => !!s.match(/^[\u0000-\u007f]*$/)

export const refineZodPassword = (s: z.ZodString) =>
  s
    .refine(hasMinLenght(8), { message: 'Password must be at least 8 characters long' })
    .refine(hasMaxLenght(50), { message: 'Password must be at most 50 characters long' })
    .refine(hasLowerCaseChar, { message: 'Password must have at least 1 lower case character' })
    .refine(hasUpperCaseChar, { message: 'Password must have at least 1 upper case character' })
    .refine(hasDigit, { message: 'Password must have at least 1 digit' })
    .refine(hasNoWhitespace, { message: 'Password must not have whitespaces' })
