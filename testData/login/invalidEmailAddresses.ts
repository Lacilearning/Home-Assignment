export const invalidEmailAddresses = [
  'customer.example.com',
  'customer@example..com',
  'customer@examplecom',
] as const;

export const emailAddressWithoutBelongingPassword =
  'notMaching@emailaddress.com';