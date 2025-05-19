import { Request, Response, NextFunction } from 'express';

type Role = 'user' | 'staff' | 'admin';

export const checkRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role as Role;

    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // For staff users, check if they have access to the requested category
    if (userRole === 'staff' && req.params.category) {
      if (req.user.category !== req.params.category) {
        return res.status(403).json({ error: 'Access denied to this category' });
      }
    }

    next();
  };
};
