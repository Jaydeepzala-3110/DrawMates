import { FaPencilAlt, FaCircle, FaSquare, FaFont, FaTrash, FaMinus, FaMousePointer, FaImage, FaEraser } from 'react-icons/fa';
import Whiteboard from './Whiteboard';
import { useTool, type ToolType } from '../context/ToolContext';

const tools: { name: ToolType; icon: any }[] = [
  { name: 'Select', icon: FaMousePointer },
  { name: 'Pencil', icon: FaPencilAlt },
  { name: 'Square', icon: FaSquare },
  { name: 'Circle', icon: FaCircle },
  { name: 'Line', icon: FaMinus },
  { name: 'Text', icon: FaFont },
  { name: 'Eraser', icon: FaEraser },
  { name: 'Image', icon: FaImage },
  { name: 'Trash', icon: FaTrash },
];

const MainLayout: React.FC = () => {
  const { activeTool, setActiveTool, strokeColor, setStrokeColor, strokeWidth, setStrokeWidth } = useTool();

  return (
    <div className="flex flex-col h-screen bg-white text-gray-800">
      {/* Toolbar */}
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-center shadow-sm">
        <div className="flex space-x-2 p-2 bg-white rounded-xl border border-gray-200 items-center">
          {tools.map((tool) => (
            <div
              key={tool.name}
              onClick={() => setActiveTool(tool.name)}
              className={`
                flex items-center justify-center w-10 h-10 rounded-md cursor-pointer
                border ${activeTool === tool.name ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}
                text-gray-700 hover:bg-gray-100 hover:border-gray-600 transition duration-150 ease-in-out
              `}
              title={tool.name}
            >
              <tool.icon className="w-5 h-5" />
            </div>
          ))}

          {/* Color Picker */}
          <div className="border-l border-gray-300 pl-2 ml-2">
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              title="Stroke Color"
            />
          </div>

          {/* Stroke Width */}
          <div className="flex items-center space-x-2 border-l border-gray-300 pl-2 ml-2">
            <input
              type="range"
              min="1"
              max="10"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-20"
              title="Stroke Width"
            />
            <span className="text-sm text-gray-600">{strokeWidth}px</span>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative bg-white">
        <Whiteboard />
      </div>
    </div>
  );
};

export default MainLayout;
