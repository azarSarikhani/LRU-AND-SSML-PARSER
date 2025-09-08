export interface SSMLNode {}

export interface SSMLElement extends SSMLNode {
	readonly name: string;
	readonly attributes: SSMLAttribute[];
	readonly children: SSMLNode[]; //SSMLText or another SSMLElement
}

export interface SSMLText extends SSMLNode {
	readonly text: string;
}

export interface SSMLAttribute {
	readonly name: string;
	readonly value: string;
}


//This function is a type guard that helps ensuring SSMLText type before accessing its text
export function isSSMLText(node: SSMLNode): node is SSMLText{
	return 'text' in node;
}

export function isSSMLElement(node: SSMLNode): node is SSMLElement{
	return 'name' in node && 'attributes' in node && 'children' in node;
}