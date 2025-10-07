import type { DrawElement } from '../types/types';
import type { RoughCanvas } from 'roughjs/bin/canvas';

// Generate unique ID for elements
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create a rough.js drawable element
export const createRoughElement = (
  element: DrawElement,
  rc: RoughCanvas
) => {
  const { type, x1, y1, x2, y2, strokeColor, fillColor, strokeWidth, points } = element;
  
  const options = {
    stroke: strokeColor,
    strokeWidth: strokeWidth,
    fill: fillColor === 'transparent' ? undefined : fillColor,
    roughness: 1,
    bowing: 1,
  };

  switch (type) {
    case 'line':
      return rc.line(x1, y1, x2, y2, options);
    case 'square':
      return rc.rectangle(x1, y1, x2 - x1, y2 - y1, options);
    case 'circle': {
      const width = x2 - x1;
      const height = y2 - y1;
      const centerX = x1 + width / 2;
      const centerY = y1 + height / 2;
      const radiusX = Math.abs(width / 2);
      const radiusY = Math.abs(height / 2);
      return rc.ellipse(centerX, centerY, radiusX * 2, radiusY * 2, options);
    }
    case 'pencil': {
      if (!points || points.length < 2) return null;
      const pathData = points.reduce((acc, point, index) => {
        if (index === 0) {
          return `M${point.x},${point.y}`;
        }
        return `${acc} L${point.x},${point.y}`;
      }, '');
      return rc.path(pathData, options);
    }
    default:
      return null;
  }
};

// Check if a point is inside an element
export const isPointInElement = (
  x: number,
  y: number,
  element: DrawElement
): boolean => {
  const { type, x1, y1, x2, y2, points } = element;
  const tolerance = 5; // pixels

  switch (type) {
    case 'square': {
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      return x >= minX - tolerance && x <= maxX + tolerance && 
             y >= minY - tolerance && y <= maxY + tolerance;
    }
    case 'circle': {
      const width = x2 - x1;
      const height = y2 - y1;
      const centerX = x1 + width / 2;
      const centerY = y1 + height / 2;
      const radiusX = Math.abs(width / 2);
      const radiusY = Math.abs(height / 2);
      
      // Check if point is inside ellipse
      const dx = (x - centerX) / (radiusX + tolerance);
      const dy = (y - centerY) / (radiusY + tolerance);
      return (dx * dx + dy * dy) <= 1;
    }
    case 'line': {
      // Distance from point to line segment
      const dist = distanceToLineSegment(x, y, x1, y1, x2, y2);
      return dist < tolerance;
    }
    case 'pencil': {
      if (!points || points.length === 0) return false;
      // Check if point is near any segment of the path
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const dist = distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y);
        if (dist < tolerance) return true;
      }
      return false;
    }
    default:
      return false;
  }
};

// Helper: Calculate distance from point to line segment
const distanceToLineSegment = (
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  }

  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));

  const nearestX = x1 + t * dx;
  const nearestY = y1 + t * dy;

  return Math.sqrt((px - nearestX) ** 2 + (py - nearestY) ** 2);
};

// Get element at position (for selection)
export const getElementAtPosition = (
  x: number,
  y: number,
  elements: DrawElement[]
): DrawElement | null => {
  // Check in reverse order (top to bottom)
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    if (isPointInElement(x, y, element)) {
      return element;
    }
  }
  return null;
};

// Adjust element coordinates when moving
export const adjustElementCoordinates = (element: DrawElement): DrawElement => {
  const { type, x1, y1, x2, y2 } = element;
  
  if (type === 'square' || type === 'circle') {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return { ...element, x1: minX, y1: minY, x2: maxX, y2: maxY };
  }
  
  return element;
};

