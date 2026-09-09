import { CacheAdapter } from './cache.adapter';
import { RedisCacheAdapter } from './redis.cache.adapter';
import { MemoryCacheAdapter } from './memory.cache.adapter';

import { Logger } from '@nestjs/common';

const logger = new Logger('CacheFactory');

export function createCacheAdapter(): CacheAdapter {
  if (process.env.NODE_ENV === 'development') {
    logger.log('Utilizando MemoryCacheAdapter');
    return new MemoryCacheAdapter();
  }
  
  logger.log('Utilizando RedisCacheAdapter');
  return new RedisCacheAdapter();
}
