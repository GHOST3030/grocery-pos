export type UserRole = 'MANAGER' | 'ACCOUNTANT' | 'CASHIER';

/** Domain entity — what the rest of the app works with, never the raw Prisma row. */
export interface UserEntity {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  active: boolean;
}

/** Internal shape used only inside auth logic — includes the password hash. */
export interface UserWithCredentials extends UserEntity {
  passwordHash: string;
}

export interface LoginResult {
  token: string;
  user: UserEntity;
}
