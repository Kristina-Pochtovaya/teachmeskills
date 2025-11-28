import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsAdult(minAge = 18, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAdult',
      target: object.constructor,
      propertyName,
      constraints: [minAge],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [minAge] = args.constraints;

          if (typeof value !== 'number') {
            return false;
          }

          return value >= minAge;
        },
        defaultMessage(args: ValidationArguments) {
          const [minAge] = args.constraints;

          return `Age $value in the field $property must be not less than ${minAge}`;
        },
      },
    });
  };
}
