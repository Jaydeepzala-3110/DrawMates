# DrawMates Client - Code Structure Guide

## 🎨 Overview
DrawMates is an Excalidraw-inspired collaborative whiteboard application. This guide explains the codebase structure and how everything works together.

## 📁 File Structure

```
client/src/
├── components/
│   ├── MainLayout.tsx      # Main UI layout with toolbar
│   └── Whiteboard.tsx      # Canvas component with drawing logic
├── context/
│   └── ToolContext.tsx     # Global state for active tool and drawing settings
├── types/
│   └── types.ts            # TypeScript interfaces for shapes and elements
├── utils/
│   └── elementUtils.ts     # Helper functions for shape manipulation
├── App.tsx                 # Root component with context provider
└── main.tsx                # Entry point
```

## 🔧 Core Components

### 1. **App.tsx**
- Root component that wraps everything with `ToolProvider`
- Provides global access to tool state across the app

### 2. **ToolContext.tsx** 
**Purpose:** Centralized state management for drawing tools

**State:**
- `activeTool`: Currently selected tool (Select, Pencil, Square, Circle, Line, etc.)
- `strokeColor`: Color for shape outlines
- `fillColor`: Fill color for shapes
- `strokeWidth`: Thickness of lines

**Usage:**
```tsx
const { activeTool, setActiveTool, strokeColor } = useTool();
```

### 3. **MainLayout.tsx**
**Purpose:** Top-level UI layout with toolbar

**Features:**
- Toolbar with all drawing tools
- Tool selection with visual feedback
- Color picker for stroke color
- Stroke width slider
- Renders the Whiteboard component

**Key Logic:**
- Maps over tools array to render buttons
- Highlights active tool with blue border
- Updates tool context when user clicks a tool

### 4. **Whiteboard.tsx** ⭐
**Purpose:** Main canvas where drawing happens

**State:**
- `elements`: Array of all drawn shapes
- `action`: Current user action ("drawing", "moving", or "none")
- `selectedElement`: Currently selected shape for manipulation

**Key Functions:**

#### `redrawCanvas()`
- Clears canvas and redraws all elements
- Shows preview for shapes being drawn (to prevent wiggle)
- Highlights selected element with dashed blue border
- Called on every elements, selection, or action change

#### `drawPreview()`
- Draws smooth canvas preview while drawing shapes
- Uses standard Canvas 2D API (not rough.js)
- Prevents wiggle by avoiding rough.js regeneration during drag
- Replaced with rough element when drawing completes

#### `createElement()`
- Creates a new DrawElement with rough.js styling
- Generates rough.js drawable for the shape type
- Uses current stroke color, fill, and width from context

#### `handleMouseDown()`
Handles different actions based on active tool:
- **Select:** Find and select element at click position
- **Trash:** Delete element at click position
- **Drawing tools:** Start creating new shape
- Stores mouse position as starting point

#### `handleMouseMove()`
Updates shapes during drawing or moving:
- **Drawing:** Updates endpoint coordinates or adds points (for pencil)
- **Moving:** Translates selected element to new position
- Changes cursor style based on hover state

#### `handleMouseUp()`
- Finalizes the current action
- Adjusts element coordinates (normalize min/max)
- Resets action state to "none"

### 5. **types.ts**
**Key Interfaces:**

```typescript
interface DrawElement {
  id: string;                    // Unique identifier
  type: ShapeType;               // "pencil" | "circle" | "square" | "line" | "text"
  x1, y1, x2, y2: number;        // Bounding coordinates
  points?: Point[];              // Path points (for pencil tool)
  strokeColor: string;           // Outline color
  fillColor: string;             // Fill color
  strokeWidth: number;           // Line thickness
  roughElement?: any;            // rough.js drawable
}
```

### 6. **elementUtils.ts**
**Helper Functions:**

#### `generateId()`
Creates unique IDs using timestamp + random string

#### `createRoughElement(element, rc)`
Generates rough.js drawable based on shape type:
- **line:** `rc.line()`
- **square:** `rc.rectangle()`
- **circle:** `rc.ellipse()` (supports oval shapes)
- **pencil:** `rc.path()` (SVG path from points)

#### `isPointInElement(x, y, element)`
**Hit detection** - checks if point is inside a shape:
- Square: Simple bounding box check
- Circle: Ellipse equation check
- Line: Distance to line segment calculation
- Pencil: Check proximity to any path segment

#### `getElementAtPosition(x, y, elements)`
Finds the topmost element at given position
- Iterates in reverse order (top layer first)
- Returns first element where point is inside

#### `adjustElementCoordinates(element)`
Normalizes coordinates so x1 < x2 and y1 < y2
- Ensures consistent coordinate system
- Important for proper rendering and selection

## 🎯 How Drawing Works

### Drawing a Shape (e.g., Square)
1. User clicks Square tool → `setActiveTool('Square')`
2. User clicks canvas → `handleMouseDown()`
   - Creates new element with start point
   - Sets action to "drawing"
   - Creates initial rough element
3. User drags mouse → `handleMouseMove()`
   - Updates element's x2, y2 with current position
   - **Does NOT regenerate rough element** (prevents wiggle)
   - Shows smooth canvas preview instead
   - Triggers redraw via state update
4. User releases mouse → `handleMouseUp()`
   - Adjusts coordinates
   - **Regenerates rough element once** at final size
   - Finalizes shape with hand-drawn style

### Selection & Moving
1. User clicks Select tool
2. User clicks on shape → `handleMouseDown()`
   - `getElementAtPosition()` finds clicked element
   - Sets `selectedElement` and action to "moving"
3. User drags → `handleMouseMove()`
   - Calculates new position with offset
   - Updates element coordinates
4. Canvas shows blue dashed selection border

### Pencil Drawing
1. Creates initial point on mouse down
2. Adds new point to `points` array on every mouse move
3. rough.js draws smooth path through all points

## 🔑 Key Technologies

- **React** - Component architecture and state management
- **TypeScript** - Type safety
- **rough.js** - Hand-drawn style rendering
- **Canvas API** - Drawing surface
- **Tailwind CSS** - Styling

## 🐛 Common Issues & Solutions

### Issue: Shapes can't be selected
**Cause:** `activeTool` not set to "Select"
**Solution:** Ensure ToolProvider wraps the app and tool state is working

### Issue: Drawing doesn't show up
**Cause:** rough.js element not created or canvas not redrawing
**Solution:** Check `createRoughElement()` and `redrawCanvas()` are called

### Issue: Shapes wiggle/jitter while drawing or moving
**Cause:** rough.js regenerates with new randomness on every mouse move
**Solution:** Use `shouldRegenerateRough = false` during interaction, and show canvas preview instead. Only regenerate once when action completes.

### Issue: Shapes disappear on resize
**Cause:** Canvas state lost on resize
**Solution:** Store elements in React state, redraw on resize event

### Issue: Selection highlight not showing
**Cause:** `selectedElement` state not set or render logic issue
**Solution:** Verify selection logic in `handleMouseDown()` and drawing in `redrawCanvas()`

### Issue: No preview while drawing shapes
**Cause:** rough.js element not regenerated during drawing
**Solution:** Use `drawPreview()` to show smooth canvas outline while dragging

## 🚀 Future Enhancements

- [ ] Text tool implementation
- [ ] Image upload support
- [ ] Eraser tool
- [ ] Undo/Redo functionality
- [ ] Socket.io integration for real-time collaboration
- [ ] Export to PNG/SVG
- [ ] Keyboard shortcuts
- [ ] Multi-select with Ctrl/Cmd
- [ ] Resize handles on selected shapes
- [ ] Copy/paste
- [ ] Layers panel

## 📖 How to Add a New Shape Tool

1. **Add tool type** to `ToolType` in `ToolContext.tsx`:
   ```typescript
   export type ToolType = '...' | 'Triangle';
   ```

2. **Add icon** to `MainLayout.tsx` tools array:
   ```typescript
   { name: 'Triangle', icon: FaTriangleIcon }
   ```

3. **Add shape type** to `types.ts`:
   ```typescript
   export type ShapeType = "..." | "triangle";
   ```

4. **Implement rendering** in `elementUtils.ts` → `createRoughElement()`:
   ```typescript
   case 'triangle':
     return rc.polygon([
       [x1, y2],          // bottom left
       [(x1 + x2) / 2, y1], // top center
       [x2, y2]           // bottom right
     ], options);
   ```

5. **Add hit detection** in `isPointInElement()`:
   ```typescript
   case 'triangle':
     // Implement point-in-polygon check
   ```

6. **Handle in Whiteboard** → `handleMouseDown()`:
   ```typescript
   else if (activeTool === 'Triangle') {
     // Same as other shapes
   }
   ```

## 🎓 Learning Resources

- [rough.js Documentation](https://roughjs.com/)
- [Canvas API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [React Context Guide](https://react.dev/reference/react/useContext)
- [Excalidraw Source Code](https://github.com/excalidraw/excalidraw)

---

**Happy Drawing! 🎨**

