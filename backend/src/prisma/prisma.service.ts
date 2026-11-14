import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    // Enable query logging in development
    if (process.env.NODE_ENV === 'development') {
      (this as unknown as { $on: (event: 'query', callback: (e: { query: string; params: string; duration: number }) => void) => void }).$on('query', (e) => {
        this.logger.debug(`Query: ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`);
      });
    }

    (this as unknown as { $on: (event: 'error', callback: (e: { message: string }) => void) => void }).$on('error', (e) => {
      this.logger.error(`Database Error: ${e.message}`);
    });

    (this as unknown as { $on: (event: 'warn', callback: (e: { message: string }) => void) => void }).$on('warn', (e) => {
      this.logger.warn(`Database Warning: ${e.message}`);
    });

    await this.$connect();
    this.logger.log('Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }
    const models = Reflect.ownKeys(this).filter(
      (key) => typeof key === 'string' && !key.startsWith('_') && !key.startsWith('$'),
    ) as string[];
    return Promise.all(
      models.map((model) => {
        const modelDelegate = (this as Record<string, unknown>)[model];
        if (modelDelegate && typeof modelDelegate === 'object' && 'deleteMany' in modelDelegate && typeof (modelDelegate as { deleteMany: unknown }).deleteMany === 'function') {
          return (modelDelegate as { deleteMany: () => Promise<unknown> }).deleteMany();
        }
        return Promise.resolve();
      }),
    );
  }
}