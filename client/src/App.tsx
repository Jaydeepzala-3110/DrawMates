import MainLayout from "./components/MainLayout";
import { ToolProvider } from "./context/ToolContext";

function App() {
  return (
    <ToolProvider>
      <MainLayout />
    </ToolProvider>
  );
}

export default App;
