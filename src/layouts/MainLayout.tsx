import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import RightPanel from "../components/RightPanel";
import BlocklyWorkspace from "../components/blockly/BlocklyWorkspace";
import { useSelector } from "react-redux";
import { RootState } from "../store";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarOpen = useSelector((state: RootState) => state.uiState.isSidebarOpen);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex transition-transform duration-300 ease-in-out w-full ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-[24%]"
          }`}
        >
          <div className="w-[10%] min-w-[250px] max-w-[300px] border-r border-gray-200 bg-[#CBEAFA]">
            <Sidebar />
          </div>

          <main className="flex-grow overflow-hidden">
            <BlocklyWorkspace />
            {children}
          </main>
        </div>

        <div className="flex-shrink-0 w-1/3 min-w-[250px] max-w-[500px] resize-x overflow-auto border-l border-gray-200 bg-[#CDECF8]">
          <RightPanel />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
