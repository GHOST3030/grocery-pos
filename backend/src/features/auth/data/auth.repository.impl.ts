import { prisma } from '../../../shared/database/prisma';
import { AuthRepository } from '../logic/auth.repository';
import { UserEntity, UserWithCredentials } from '../logic/auth.entity';

function toEntity(row: {
  id: string;
  username: string;
  fullName: string;
  role: string;
  active: boolean;
}): UserEntity {
  return {
    id: row.id,
    username: row.username,
    fullName: row.fullName,
    role: row.role as UserEntity['role'],
    active: row.active,
  };
}

export class PrismaAuthRepository implements AuthRepository {
  async findByUsername(username: string): Promise<UserWithCredentials | null> {
    const row = await prisma.user.findUnique({ where: { username } });
    if (!row) return null;
    return { ...toEntity(row), passwordHash: row.passwordHash };
  }

  async findById(id: string): Promise<UserEntity | null> {
    const row = await prisma.user.findUnique({ where: { id } });
    return row ? toEntity(row) : null;
  }

  async create(input: {
    username: string;
    passwordHash: string;
    fullName: string;
    role: UserEntity['role'];
  }): Promise<UserEntity> {
    const row = await prisma.user.create({ data: input });
    return toEntity(row);
  }

  async countUsers(): Promise<number> {
    return prisma.user.count();
  }
}
