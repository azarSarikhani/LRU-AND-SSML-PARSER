import { SSMLNode , SSMLText, SSMLElement, SSMLAttribute, isSSMLElement, isSSMLText } from "./ssml-types";


export function parseSSML(ssml: string): SSMLNode{
	if (!ssml || ssml.trim().length === 0) {
      throw new Error("SSML input cannot be empty");
    }

	if (!validateOpeningAndClosingTag(ssml)){
		throw new Error("Tags could not be parsed");
	}
	return getSSMLNode(ssml);
}

export function validateOpeningAndClosingTag(inputString: string): boolean {
	return inputString.startsWith("<speak") && inputString.endsWith("</speak>")
}

export function getSSMLNode(inputString: string): SSMLNode{
	const tagInfo = extractTagInfo(inputString); //parse tag and attributes
	const body = extractTagBody(inputString, tagInfo.name);

	if (body.length === 0) {
      return createSSMLElement(tagInfo.name, tagInfo.attributes, []);
    }

    if (isTextOnly(body)) {
      const textNode = createSSMLText(unescapeXMLChars(body));
      return createSSMLElement(tagInfo.name, tagInfo.attributes, [textNode]);
    }

	validateMixedContentOpeningAndClosingTag(body);
	const children = parseChildren(body);

    return createSSMLElement(tagInfo.name, tagInfo.attributes, children);  
} 

export function extractTagInfo(inputString: string): { name: string; attributes: SSMLAttribute[] } {
	const fullTagName = inputString.substring(inputString.indexOf("<") + 1, inputString.indexOf(">")).trim();

	if (!fullTagName.includes(" ")) {
		return { name: fullTagName, attributes: [] };
	}

	const name = fullTagName.substring(0, fullTagName.indexOf(" "));
	const attributes = parseAttributes(fullTagName.substring(fullTagName.indexOf(" ") + 1));

	return { name, attributes };	
}

export function parseAttributes(attributeString: string): SSMLAttribute[] {
	if (!attributeString.includes("=")) {
	  throw new Error("Attributes could not be parsed");
	}

	const attributes: SSMLAttribute[] = [];
	let remaining = attributeString;

	while (remaining.includes("=")) {
	  const key = remaining.substring(0, remaining.indexOf("=")).trim();
	  if (key.length === 0) {
		throw new Error("Attributes could not be parsed");
	  }

	  remaining = remaining.substring(remaining.indexOf("=") + 1).trim();
	  
	  const endIndex = !remaining.includes(" ") ? remaining.length : remaining.indexOf(" ");
	  
	  let value = remaining.substring(0, endIndex).trim();
	  if (countDoubleQuotes(value) !== 2) {
		throw new Error("Attributes could not be parsed");
	  }
	  value = value.replace(/"/g, "");
	  
	  attributes.push({ name: key, value: value });
	  remaining = remaining.substring(endIndex);
	  //
	}

	return attributes;
}

export function countDoubleQuotes(str: string): number {
    return (str.match(/"/g) || []).length;
}

export function extractTagBody(inputString: string, tagName: string): string {
    const startTag = `<${tagName}>`;
    const endTag = `</${tagName}>`;
    
    if (!inputString.includes(endTag)) {
      throw new Error("Tags could not be parsed");
    }

    return inputString.substring(startTag.length, inputString.lastIndexOf(endTag));
  }

export function isTextOnly(body: string): boolean {
    return body.indexOf("<") === -1 && body.indexOf(">") === -1;
}

export function unescapeXMLChars(text: string): string {
    return text
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
}

export function createSSMLText(text: string): SSMLText {
    return { text } as SSMLText;
}

export function createSSMLElement(name: string, attributes: SSMLAttribute[], children: SSMLNode[]): SSMLElement {
    return { name, attributes, children } as SSMLElement;
}

export function validateMixedContentOpeningAndClosingTag(body: string): void {
    const hasOpenBracket = body.indexOf("<") !== -1;
    const hasCloseBracket = body.indexOf(">") !== -1;
    
    if ((hasOpenBracket && !hasCloseBracket) || (!hasOpenBracket && hasCloseBracket)) {
      throw new Error("Tags could not be parsed");
    }
}

export function parseChildren(body: string): SSMLNode[] {
	const beforeFirstChild = body.substring(0, body.indexOf("<"));
	const afterLastChild = body.substring(body.lastIndexOf(">") + 1);
	const children = body.substring(beforeFirstChild.length, body.lastIndexOf(">") + 1);

	const childNodes: SSMLNode[] = [];

	//If there's anything before the first child it's text
	if (beforeFirstChild.length > 0) {
      childNodes.push(createSSMLText(unescapeXMLChars(beforeFirstChild)));
    }

	//Parse children recursively
	if (children.length > 0) {
      childNodes.push(getSSMLNode(children));
    }

	//If there's anything after last child it is text
	if (afterLastChild.length > 0) {
      childNodes.push(createSSMLText(unescapeXMLChars(afterLastChild)));
    }

    return childNodes;

}


/**
 * Recursively converts SSML node to string and unescapes XML chars
 */

export function ssmlNodeToText(node: SSMLNode): string {
	const ssmlTextList = getSSMLTextList(node);
	const stringBuffer: string[] = [];
	for (const ssmlText of ssmlTextList) {
	  stringBuffer.push(ssmlText.text);
	}
	return stringBuffer.join("");
}

export function getSSMLTextList(node: SSMLNode): SSMLText[] {
	const ssmlTextList: SSMLText[] = [];

	if (isSSMLText(node)) {
		ssmlTextList.push(node);
	} else if (isSSMLElement(node)) {
		// Iterate over children
		for (const child of node.children) {
		ssmlTextList.push(...getSSMLTextList(child));
		}
	}

	return ssmlTextList;
}