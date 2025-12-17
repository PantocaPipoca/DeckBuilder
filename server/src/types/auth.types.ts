// server/src/types/auth.types.ts
/**
 * Data required for user registration
 * 
 * @property name: users name
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
 * @property email: users email
 * @property pasword: user's password
 */
export interface LoginDTO {
  email: string;
  password: string;
}