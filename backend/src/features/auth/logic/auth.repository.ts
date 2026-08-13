import { UserEntity, UserRole, UserWithCredentials } from './auth.entity';

/**
 * Abstract contract — the service layer depends on this interface, not on
 * Prisma directly. The `data/` layer provides the concrete implementation.
 * Lets us swap storage later (e.g. SQLite for a stripped-down offline
 * deployment) without touching business rules.
 */
export interface AuthRepository {
  findByUsername(username: string): Promise<UserWithCredentials | null>;
  findById(id: string): Promise<UserEntity | null>;
  create(input: {
    username: string;
    passwordHash: string;
    fullName: string;
    role: UserRole;
  }): Promise<UserEntity>;
  countUsers(): Promise<number>;
}
