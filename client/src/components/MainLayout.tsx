import { FaPencilAlt, FaCircle, FaSquare, FaFont, FaTrash, FaMinus, FaArrowRight, FaImage, FaEraser } from 'react-icons/fa';
import Whiteboard from './Whiteboard';

const tools = [
  { name: 'Select', icon: FaArrowRight, active: true },
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
  return (
    <div className="flex flex-col h-screen bg-white text-gray-800">
      {/* Toolbar */}
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-center shadow-sm">
        <div className="flex space-x-2 p-2 bg-white rounded-xl border border-gray-200 items-center">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className={`
                flex items-center justify-center w-10 h-10 rounded-md cursor-pointer
                border ${tool.active ? 'border-purple-500' : 'border-gray-300'}
                text-gray-700 hover:border-gray-600 transition duration-150 ease-in-out
              `}
              title={tool.name}
            >
              <tool.icon className="w-5 h-5" />
            </div>
          ))}
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
