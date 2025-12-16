// server/src/types/auth.types.ts
/**
 * Data required for user registration
 * 
 * @property name: user's name
 * @property email: user's email
 * @property password: user's password
 */
export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

/**
 * Data required for user login
 * 
 * @property email: user's email
 * @property password: user's password
 */
export interface LoginDTO {
  email: string;
  password: string;
}