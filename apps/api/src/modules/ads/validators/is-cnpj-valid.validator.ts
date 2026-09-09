import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function isValidCnpj(cnpj: string): boolean {
  if (!cnpj || typeof cnpj !== 'string') return false;
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleaned)) return false;

  let size = 12;
  let numbers = cleaned.substring(0, size);
  let digits = cleaned.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += Number(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(digits.charAt(0))) return false;

  size = 13;
  numbers = cleaned.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += Number(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(digits.charAt(1))) return false;

  return true;
}

export function IsCnpjValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCnpjValid',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: 'CNPJ inválido: os dígitos verificadores não conferem',
        ...validationOptions,
      },
      validator: {
        validate(value: any, _args: ValidationArguments) {
          return typeof value === 'string' && isValidCnpj(value);
        },
      },
    });
  };
}
