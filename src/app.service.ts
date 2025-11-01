import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class AppService implements OnModuleDestroy {
  private readonly logger = new Logger(AppService.name);

  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Cleanup logic executed during graceful shutdown
   * Implement this method in services that need to clean up resources
   */
  onModuleDestroy() {
    this.logger.log('AppService is shutting down...');
    // Add cleanup logic here:
    // - Close database connections
    // - Clear caches
    // - Close file handles
    // - Stop background jobs
    // - Send final metrics/logs
  }
}
