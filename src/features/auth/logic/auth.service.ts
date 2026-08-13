import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../../config';
import { InvalidCredentialsError, ValidationError } from '../../../shared/errors/AppError';
import { AuthRepository } from './auth.repository';
import { LoginResult, UserEntity, UserRole } from './auth.entity';

const SALT_ROUNDS = 10;

export class AuthService {
  constructor(private readonly repo: AuthRepository) {}

  async login(username: string, password: string): Promise<LoginResult> {
    const user = await this.repo.findByUsername(username);
    if (!user || !user.active) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const { passwordHash: _drop, ...entity } = user;
    const token = this.issueToken(entity);

    return { token, user: entity };
  }

  /**
   * Registers a new user. Business rule: the very first user created in
   * the system is automatically a MANAGER (bootstrap — otherwise nobody
   * could create the first manager account). All subsequent creates must
   * come from an authenticated MANAGER (enforced at the route level via
   * requireRole, not here).
   */
  async register(input: {
    username: string;
    password: string;
    fullName: string;
    role?: UserRole;
  }): Promise<UserEntity> {
    if (input.password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    const existing = await this.repo.findByUsername(input.username);
    if (existing) {
      throw new ValidationError(`Username "${input.username}" is already taken`);
    }

    const userCount = await this.repo.countUsers();
    const role: UserRole = userCount === 0 ? 'MANAGER' : (input.role ?? 'CASHIER');

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    return this.repo.create({
      username: input.username,
      passwordHash,
      fullName: input.fullName,
      role,
    });
  }

  async me(userId: string): Promise<UserEntity | null> {
    return this.repo.findById(userId);
  }

  private issueToken(user: UserEntity): string {
    const options: jwt.SignOptions = { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] };
    return jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      config.jwt.secret,
      options
    );
  }
}
