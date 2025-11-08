import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DashboardLayout = () => {
  return (
    <div className="h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="ml-72 h-screen flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-3 md:p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
