import { createContext, useContext, useState, type ReactNode } from 'react';

export type ToolType = 'Select' | 'Pencil' | 'Square' | 'Circle' | 'Line' | 'Text' | 'Eraser' | 'Image' | 'Trash';

interface ToolContextType {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  fillColor: string;
  setFillColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
}

const ToolContext = createContext<ToolContextType | undefined>(undefined);

export const ToolProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTool, setActiveTool] = useState<ToolType>('Select');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(2);

  return (
    <ToolContext.Provider
      value={{
        activeTool,
        setActiveTool,
        strokeColor,
        setStrokeColor,
        fillColor,
        setFillColor,
        strokeWidth,
        setStrokeWidth,
      }}
    >
      {children}
    </ToolContext.Provider>
  );
};

export const useTool = () => {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error('useTool must be used within ToolProvider');
  }
  return context;
};

