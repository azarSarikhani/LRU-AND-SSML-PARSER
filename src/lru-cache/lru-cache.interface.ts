export interface LRUCache<T> {
	get (key: string): T | null;
	set (key: string, value: T): void;
}