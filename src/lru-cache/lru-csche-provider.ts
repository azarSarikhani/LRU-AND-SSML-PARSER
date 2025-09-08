import { CacheLimits } from './cache-limits'
import { LRUCache } from './lru-cache.interface'
import { LRUCacheImpl } from './lru-cache-imp'

export class LRUCacheProvider{
	static createLRUCache<T>(options: CacheLimits): LRUCache<T>{
		return new LRUCacheImpl<T>(options.getMaxItemsCount())
	}
}