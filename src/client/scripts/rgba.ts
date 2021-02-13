export type Rgba = [r: number, g: number, b: number, a: number];

export const toHtmlColor = (rgba: Rgba) => `rgba(${rgba.join()})`;
