import { Request, Response } from 'express';
import { AuthService } from '../logic/auth.service';
import { PrismaAuthRepository } from '../data/auth.repository.impl';
import { UnauthorizedError } from '../../../shared/errors/AppError';

// Composition root for this feature — wires the concrete repository into
// the service. Only place in the feature that knows Prisma exists.
const authService = new AuthService(new PrismaAuthRepository());

export const authController = {
  async login(req: Request, res: Response) {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.json(result);
  },

  async register(req: Request, res: Response) {
    const user = await authService.register(req.body);
    res.status(201).json({ user });
  },

  async me(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError();
    const user = await authService.me(req.user.userId);
    res.json({ user });
  },
};
