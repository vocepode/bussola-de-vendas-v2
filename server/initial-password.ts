const MIN_INITIAL_PASSWORD_LENGTH = 8;

function pickPasswordFromEnv(value: string | undefined): string | null {
  if (!value) return null;
  if (!value.trim()) return null;
  return value;
}

export function getInitialUserPassword(): string {
  const primary = pickPasswordFromEnv(process.env.INITIAL_USER_PASSWORD);
  const fallback = pickPasswordFromEnv(process.env.HOTMART_DEFAULT_PASSWORD);
  const password = primary ?? fallback;

  if (!password) {
    throw new Error(
      "Senha inicial não configurada. Defina INITIAL_USER_PASSWORD (ou HOTMART_DEFAULT_PASSWORD como fallback)."
    );
  }
  if (password.length < MIN_INITIAL_PASSWORD_LENGTH) {
    throw new Error(
      `Senha inicial inválida: mínimo de ${MIN_INITIAL_PASSWORD_LENGTH} caracteres em INITIAL_USER_PASSWORD/HOTMART_DEFAULT_PASSWORD.`
    );
  }

  return password;
}
