import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

interface ClerkRequest extends Request {
  clerkToken?: string;
}

@Injectable()
export class ClerkMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const clerkReq = req as ClerkRequest;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      clerkReq.clerkToken = authHeader.substring(7);
    }

    next();
  }
}
