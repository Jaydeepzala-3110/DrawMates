export interface Point {
  x: number;
  y: number;
}

export type ShapeType = "pencil" | "circle" | "square" | "line" | "text";

export interface DrawElement {
  id: string;
  type: ShapeType;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  points?: Point[]; // for pencil/freehand
  text?: string; // for text elements
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  roughElement?: any; // rough.js drawable
}

export interface SelectedElement {
  id: string;
  element: DrawElement;
  offsetX: number;
  offsetY: number;
}
