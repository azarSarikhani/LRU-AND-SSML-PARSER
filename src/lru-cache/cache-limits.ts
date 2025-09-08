export class CacheLimits{
	private readonly maxItemsCount : number;

	constructor(maxItemsCount : number){
		this.maxItemsCount = maxItemsCount;
	}

	public getMaxItemsCount(): number{
		return this.maxItemsCount;
	}
}