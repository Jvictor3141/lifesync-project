export const PASSWORD_RULES = [
  {
    id: 'length',
    label: '8 caracteres',
    test: (password) => password.length >= 8,
  },
  {
    id: 'upper',
    label: 'Letra maiúscula',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'lower',
    label: 'Letra minúscula',
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'Número',
    test: (password) => /[0-9]/.test(password),
  },
  {
    id: 'symbol',
    label: 'Símbolo',
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
];

export const getPasswordChecks = (password = '') => (
  PASSWORD_RULES.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }))
);

export const isStrongPassword = (password = '') => (
  PASSWORD_RULES.every((rule) => rule.test(password))
);
