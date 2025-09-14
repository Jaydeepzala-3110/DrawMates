export interface Point {
  x: number;
  y: number;
}

export type ToolType = "Pencil" | "Circle" | "Square" | "Line";

export interface Shape {
  type: ToolType;
  start: Point;
  end?: Point; 
  points?: Point[]; 
}
