import * as React from 'react';
import { Mail, Shield } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full bg-white/50 backdrop-blur-sm border-t border-slate-100 py-4 px-6 mt-auto">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500">
        <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Copyright &copy; 2026 Ali Asger Talib</p>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-slate-400" />
            <p className="text-[10px] uppercase font-bold tracking-tight">Legal Disclaimer: This application is provided for organizational purposes. Data is stored locally.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <a 
            href="mailto:aliasgertalib@gmail.com" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors group"
          >
            <Mail className="w-3 h-3 group-hover:scale-110 transition-transform" />
            <span>aliasgertalib@gmail.com</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
