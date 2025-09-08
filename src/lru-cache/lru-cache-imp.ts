import { LRUCache } from './lru-cache.interface'

export class LRUCacheImpl <T> implements LRUCache<T> {
	private capacity: number;
	private cache: Map<string, T>;
	private accessOrder : string[];

	constructor(capacity: number){
		this.capacity = capacity;
		this.cache = new Map<string, T>();
		this.accessOrder = [];
	}

	public get(key: string): T | null {
		const value = this.cache.get(key);
		if (value !== undefined){
			//If the key passed to this function has a value this node will become the most recently
			//used node. So we move it to the end of the access order array
			this.pushToTheEndOfAccessOrder(key);
			return value;
		}
		return null;
	}

	public set(key: string, value: T): void{	
		//If a node with the passed key doesn't exist and a new node has to be created first check capacity
		if (!(this.cache.has(key)) && this.cache.size > this.capacity){
			//Remove the least recently used node ( first item in access ordere)
			const lrukey = this.accessOrder.shift();
			if (lrukey){
				this.cache.delete(lrukey);
			}
		}
		//Set function will Adds a new element with a specified key and value to the Map.
		// If an element with the same key already exists, the element will be updated.
		this.cache.set(key, value);
		this.pushToTheEndOfAccessOrder(key);
	}

	private pushToTheEndOfAccessOrder(key : string): void{
		//If key exists in the access order remove it from the ordered list 
		const index = this.accessOrder.indexOf(key);
		if (index > -1){
			this.accessOrder.splice(index, 1);
		}
		//Add the key to the end of the manually managed ordared list
		this.accessOrder.push(key);
	}
}