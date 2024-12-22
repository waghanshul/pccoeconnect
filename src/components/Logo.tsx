import { Cpu, Zap } from "lucide-react";

export const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-primary rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative flex items-center">
          <Cpu className="w-8 h-8 text-primary" />
          <Zap className="w-4 h-4 text-blue-500 absolute -right-1 -top-1 animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
      </div>
      <div className="flex flex-col items-start">
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          PCCOE
        </span>
        <span className="text-sm font-medium text-muted-foreground -mt-1">
          Connect
        </span>
      </div>
    </div>
  );
};