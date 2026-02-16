import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ImpersonationBanner from '../ui/ImpersonationBanner';
import { useTheme } from '../../hooks/useTheme';

interface AppShellProps {
  children: React.ReactNode;
  currentRoute: string;
  viewMode: 'super' | 'hotel';
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  isImpersonating: boolean;
  impersonatedHotel: string | null;
  onNavigate: (route: string) => void;
  onSwitchBack: () => void;
  onSwitchToHotel: () => void;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onOpenMobileMenu: () => void;
  onLogout: () => void;
}

const AppShell: React.FC<AppShellProps> = ({
  children,
  currentRoute,
  viewMode,
  isSidebarCollapsed,
  isMobileMenuOpen,
  isImpersonating,
  impersonatedHotel,
  onNavigate,
  onSwitchBack,
  onSwitchToHotel,
  onToggleCollapse,
  onCloseMobile,
  onOpenMobileMenu,
  onLogout,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`
      flex h-screen w-screen overflow-hidden font-sans transition-colors duration-500
      ${isDarkMode ? 'bg-theme-dark text-white' : 'bg-theme-light text-slate-900'}
      ${isImpersonating ? 'pt-12' : ''}
    `}>
      {isImpersonating && impersonatedHotel && (
        <ImpersonationBanner 
          hotelName={impersonatedHotel} 
          onExit={onSwitchBack} 
        />
      )}

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={onCloseMobile}
        />
      )}

      <Sidebar 
        currentRoute={currentRoute} 
        onNavigate={onNavigate}
        viewMode={viewMode} 
        onSwitchBack={onSwitchBack}
        onSwitchToHotel={onSwitchToHotel}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={onToggleCollapse}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={onCloseMobile}
        onLogout={onLogout}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header 
          viewMode={viewMode} 
          onNavigate={onNavigate} 
          onOpenMobileMenu={onOpenMobileMenu}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={onToggleCollapse}
          onLogout={onLogout}
        />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar">
          <div className="p-2 md:p-4 pb-10 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
