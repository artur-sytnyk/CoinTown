
export const capitalize = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export const removeItem = (arr, item) => arr.filter(i => i !== item);

export const nodeDistance = (nodeA, nodeB) => Math.hypot(nodeA.x - nodeB.x, nodeA.y - nodeB.y);