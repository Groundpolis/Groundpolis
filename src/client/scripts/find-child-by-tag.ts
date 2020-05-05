export const findChildByTag = (parent: Node, name: string): Node | null => {
	for (const child of parent.childNodes) {
		// ひとつでも該当するものが見つかったら返す
		if (child.nodeName.toLowerCase() === name.toLowerCase()) {
			return child;
		}
		// 子要素に該当するものが見つかったらそれを返す
		const inChildren = findChildByTag(child, name);
		if (inChildren) return inChildren;
	}
	return null;
}

export default findChildByTag;