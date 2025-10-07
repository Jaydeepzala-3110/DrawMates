import { useRef, useState, useLayoutEffect, useEffect } from "react";
import rough from "roughjs";
import { useTool } from "../context/ToolContext";
import type { DrawElement, Point } from "../types/types";
import {
  generateId,
  createRoughElement,
  getElementAtPosition,
  adjustElementCoordinates,
} from "../utils/elementUtils";

type ActionType = "drawing" | "moving" | "none";

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<DrawElement[]>([]);
  const [action, setAction] = useState<ActionType>("none");
  const [selectedElement, setSelectedElement] = useState<DrawElement | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const { activeTool, setActiveTool, strokeColor, fillColor, strokeWidth } = useTool();

  // Resize canvas to fit container
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        redrawCanvas();
      }
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Redraw canvas whenever elements change
  useLayoutEffect(() => {
    redrawCanvas();
  }, [elements, selectedElement, action]);

  // Update cursor when tool changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if (activeTool === "Select") {
      canvas.style.cursor = "default";
    } else {
      canvas.style.cursor = "crosshair";
    }
  }, [activeTool]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const rc = rough.canvas(canvas);

    // Draw all elements
    elements.forEach((element, index) => {
      // If currently drawing this element, show preview instead
      if (action === "drawing" && index === elements.length - 1 && element.type !== "pencil") {
        drawPreview(ctx, element);
      } else if (action === "moving" && selectedElement && element.id === selectedElement.id) {
        // If moving this element, show preview at new position
        drawMovingElement(ctx, rc, selectedElement);
      } else {
        // Draw the element using rough.js
        if (element.roughElement) {
          rc.draw(element.roughElement);
        } else {
          // Fallback: if roughElement is missing, create it on the fly
          const tempRoughElement = createRoughElement(element, rc);
          if (tempRoughElement) {
            rc.draw(tempRoughElement);
          }
        }
      }
    });

    // Draw selection highlight
    if (selectedElement) {
      ctx.strokeStyle = "#0066ff";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);

      const { x1, y1, x2, y2, type } = selectedElement;
      const padding = 8; // Consistent padding around all shapes

      if (type === "circle") {
        // Draw rectangular bounding box for circle (like Excalidraw)
        ctx.strokeRect(x1 - padding, y1 - padding, (x2 - x1) + padding * 2, (y2 - y1) + padding * 2);
      } else if (type === "square") {
        ctx.strokeRect(x1 - padding, y1 - padding, (x2 - x1) + padding * 2, (y2 - y1) + padding * 2);
      } else if (type === "line") {
        const minX = Math.min(x1, x2) - padding;
        const minY = Math.min(y1, y2) - padding;
        const maxX = Math.max(x1, x2) + padding;
        const maxY = Math.max(y1, y2) + padding;
        ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
      } else if (type === "pencil" && selectedElement.points) {
        const points = selectedElement.points;
        if (points.length > 0) {
          const xs = points.map(p => p.x);
          const ys = points.map(p => p.y);
          const minX = Math.min(...xs) - padding;
          const minY = Math.min(...ys) - padding;
          const maxX = Math.max(...xs) + padding;
          const maxY = Math.max(...ys) + padding;
          ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
        }
      }

      ctx.setLineDash([]);
    }
  };

  const drawPreview = (ctx: CanvasRenderingContext2D, element: DrawElement) => {
    const { x1, y1, x2, y2, type, strokeColor, strokeWidth } = element;
    
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.setLineDash([]);

    switch (type) {
      case "line":
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        break;
      case "square":
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        break;
      case "circle": {
        const width = x2 - x1;
        const height = y2 - y1;
        const centerX = x1 + width / 2;
        const centerY = y1 + height / 2;
        const radiusX = Math.abs(width / 2);
        const radiusY = Math.abs(height / 2);
        
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
    }
  };

  const drawMovingElement = (ctx: CanvasRenderingContext2D, rc: any, element: DrawElement) => {
    const { type } = element;
    
    if (type === "pencil") {
      // For pencil, regenerate rough element with new points to show at new position
      const tempRoughElement = createRoughElement(element, rc);
      if (tempRoughElement) {
        rc.draw(tempRoughElement);
      }
    } else {
      // For other shapes, use smooth preview to avoid wiggle
      drawPreview(ctx, element);
    }
  };

  const createElement = (
    id: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    type: "pencil" | "circle" | "square" | "line",
    points?: Point[]
  ): DrawElement => {
    const element: DrawElement = {
      id,
      type,
      x1,
      y1,
      x2,
      y2,
      points,
      strokeColor,
      fillColor,
      strokeWidth,
      roughElement: undefined,
    };

    const canvas = canvasRef.current;
    if (canvas) {
      const rc = rough.canvas(canvas);
      element.roughElement = createRoughElement(element, rc);
    }

    return element;
  };

  const updateElement = (
    id: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    type: "pencil" | "circle" | "square" | "line",
    points?: Point[],
    shouldRegenerateRough = true
  ) => {
    setElements((prevElements) => {
      const elementsCopy = [...prevElements];
      const index = elementsCopy.findIndex((el) => el.id === id);
      if (index !== -1) {
        if (shouldRegenerateRough) {
          // Regenerate rough element (for drawing)
          const updatedElement = createElement(id, x1, y1, x2, y2, type, points);
          elementsCopy[index] = updatedElement;
        } else {
          // Just update coordinates without regenerating rough element (for moving)
          elementsCopy[index] = {
            ...elementsCopy[index],
            x1,
            y1,
            x2,
            y2,
            points,
          };
        }
      }
      return elementsCopy;
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === "Select") {
      const element = getElementAtPosition(x, y, elements);
      if (element) {
        // Store offset from mouse to element's top-left corner
        setOffsetX(x - element.x1);
        setOffsetY(y - element.y1);
        setSelectedElement(element);
        setAction("moving");
      } else {
        setSelectedElement(null);
      }
    } else if (activeTool === "Trash") {
      const element = getElementAtPosition(x, y, elements);
      if (element) {
        setElements((prevElements) =>
          prevElements.filter((el) => el.id !== element.id)
        );
        setSelectedElement(null);
      }
    } else if (activeTool === "Pencil") {
      setAction("drawing");
      const id = generateId();
      const element = createElement(id, x, y, x, y, "pencil", [{ x, y }]);
      setElements((prevElements) => [...prevElements, element]);
      setSelectedElement(null);
    } else if (
      activeTool === "Square" ||
      activeTool === "Circle" ||
      activeTool === "Line"
    ) {
      setAction("drawing");
      const id = generateId();
      let type: "square" | "circle" | "line" = "square";
      if (activeTool === "Circle") type = "circle";
      if (activeTool === "Line") type = "line";

      const element = createElement(id, x, y, x, y, type);
      setElements((prevElements) => [...prevElements, element]);
      setSelectedElement(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Change cursor based on tool and hover
    if (activeTool === "Select") {
      const element = getElementAtPosition(x, y, elements);
      canvas.style.cursor = element ? "move" : "default";
    } else {
      canvas.style.cursor = "crosshair";
    }

    if (action === "drawing") {
      const index = elements.length - 1;
      const { id, x1, y1, type } = elements[index];

      if (type === "pencil") {
        const points = elements[index].points || [];
        const newPoints = [...points, { x, y }];
        // Regenerate for pencil to show smooth path
        updateElement(id, x1, y1, x, y, type, newPoints, true);
      } else if (type !== "text") {
        // Don't regenerate while drawing to avoid wiggle
        updateElement(id, x1, y1, x, y, type, undefined, false);
      }
    } else if (action === "moving" && selectedElement) {
      const { id, x1, y1, x2, y2, type, points } = selectedElement;
      const width = x2 - x1;
      const height = y2 - y1;

      // Calculate new position based on mouse position minus stored offset
      const newX1 = x - offsetX;
      const newY1 = y - offsetY;
      const newX2 = newX1 + width;
      const newY2 = newY1 + height;

      // Calculate how much the element moved
      const deltaX = newX1 - x1;
      const deltaY = newY1 - y1;

      let newPoints: Point[] | undefined;
      if (type === "pencil" && points) {
        newPoints = points.map((point) => ({
          x: point.x + deltaX,
          y: point.y + deltaY,
        }));
      }

      if (type !== "text") {
        // Don't regenerate rough element while moving to avoid wiggle
        updateElement(id, newX1, newY1, newX2, newY2, type, newPoints, false);
        setSelectedElement({
          ...selectedElement,
          x1: newX1,
          y1: newY1,
          x2: newX2,
          y2: newY2,
          points: newPoints,
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (action === "drawing") {
      const index = elements.length - 1;
      const element = elements[index];
      if (element) {
        // Adjust coordinates and regenerate rough element at final size
        const adjustedElement = adjustElementCoordinates(element);
        
        const canvas = canvasRef.current;
        if (canvas && adjustedElement.type !== "text") {
          const rc = rough.canvas(canvas);
          const finalElement: DrawElement = {
            ...adjustedElement,
            roughElement: createRoughElement(adjustedElement, rc),
          };
          
          const elementsCopy = [...elements];
          elementsCopy[index] = finalElement;
          setElements(elementsCopy);
          
          // Auto-select the newly drawn element (show blue box)
          setSelectedElement(finalElement);
        } else {
          const elementsCopy = [...elements];
          elementsCopy[index] = adjustedElement;
          setElements(elementsCopy);
          
          // Auto-select the newly drawn element
          setSelectedElement(adjustedElement);
        }
        
        // Auto-switch to Select tool after drawing (like Excalidraw)
        setActiveTool("Select");
      }
    } else if (action === "moving" && selectedElement) {
      // Regenerate rough element at final position after moving
      const { id, type } = selectedElement;
      if (type !== "text") {
        const canvas = canvasRef.current;
        if (canvas) {
          const rc = rough.canvas(canvas);
          const regeneratedElement: DrawElement = {
            ...selectedElement,
            roughElement: createRoughElement(selectedElement, rc),
          };
          
          setElements((prevElements) => {
            const elementsCopy = [...prevElements];
            const index = elementsCopy.findIndex((el) => el.id === id);
            if (index !== -1) {
              elementsCopy[index] = regeneratedElement;
            }
            return elementsCopy;
          });
          
          setSelectedElement(regeneratedElement);
        }
      }
      // Reset offsets
      setOffsetX(0);
      setOffsetY(0);
    }
    setAction("none");
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};

export default Whiteboard;
