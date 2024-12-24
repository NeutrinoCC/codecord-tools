export interface PortraitConstructor {
  width: number;
  height: number;
}

export enum CoordinateReference {
  "1/2" = "1/2",
  "1/3" = "1/3",
  "1/4" = "1/4",
  "2/3" = "2/3",
  "3/4" = "3/4",
}

export interface ImageOptions {
  imageURL: string;
  borderWidth?: number;
  borderColor?: string;
  frame?: number;
  x?: number;
  y?: number;
  height?: number;
  width?: number;
  justify?: "center" | "left" | "right";
  align?: "center" | "top" | "bottom";
  shadow?: ShadowOptions;
}

export interface TextOptions {
  text: string;
  font: string;
  size: number;
  color?: string;
  x?: number;
  y?: number;
  justify?: "center" | "left" | "right";
  align?: "center" | "top" | "bottom";
  shadow?: ShadowOptions;
}

export interface ShadowOptions {
  offsetX?: number;
  offsetY?: number;
  color?: string;
  blur: number;
}

export interface LineOptions {
  width: number;
  a: number[];
  b: number[];
  shadow?: ShadowOptions;
  color?: string;
}

export interface FillOptions {
  a: number[];
  b: number[];
  color?: string;
}
