import Link from "next/link";
import { Gift } from "lucide-react";
import ShellLayout from "./components/VSCodeLayout/ShellLayout";

export default function Home() {
  return (
    <ShellLayout>
      <main className="container mx-auto py-6 px-4">
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <h1 className="text-3xl font-bold mb-6">LuckyDraw Management System</h1>
          <p className="text-gray-400 mb-8">Welcome to the LuckyDraw management system. Use the sidebar to navigate.</p>
          
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/rewards" 
              className="bg-[#2d2d2d] hover:bg-[#3c3c3c] border border-[#3c3c3c] p-4 rounded-md flex flex-col items-center w-40 h-40 justify-center transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-[#007acc] flex items-center justify-center mb-3">
                <Gift className="h-6 w-6" />
              </div>
              <span className="font-medium">Rewards</span>
              <span className="text-sm text-gray-400">Manage rewards</span>
            </Link>
            
            {/* Add more dashboard cards as needed */}
          </div>
        </div>
      </main>
    </ShellLayout>
  );
}
