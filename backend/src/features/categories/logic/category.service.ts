import { ConflictError, NotFoundError } from '../../../shared/errors/AppError';
import { CategoryRepository } from './category.repository';
import { CategoryEntity } from './category.entity';

export class CategoryService {
  constructor(private readonly repo: CategoryRepository) {}

  list(): Promise<CategoryEntity[]> {
    return this.repo.list();
  }

  async create(name: string): Promise<CategoryEntity> {
    const existing = await this.repo.findByName(name);
    if (existing) throw new ConflictError(`Category "${name}" already exists`);
    return this.repo.create(name);
  }

  async update(id: string, name: string): Promise<CategoryEntity> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError('Category');
    return this.repo.update(id, name);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError('Category');
    await this.repo.remove(id);
  }
}
