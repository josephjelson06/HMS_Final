import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTheme } from '../../hooks/useTheme';

export interface DropdownItem {
  icon?: React.ElementType;
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'danger' | 'warning' | 'primary' | 'highlight' | 'selected';
  hasSeparatorAfter?: boolean;
}

interface GlassDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

const GlassDropdown: React.FC<GlassDropdownProps> = ({ trigger, items, align = 'right', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useTheme();

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      updateCoords();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', () => setIsOpen(false));
      window.addEventListener('scroll', () => setIsOpen(false), true);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', () => setIsOpen(false));
      window.removeEventListener('scroll', () => setIsOpen(false), true);
    };
  }, [isOpen]);

  const toggle = () => setIsOpen(!isOpen);

  const getItemStyles = (variant: DropdownItem['variant'] = 'default') => {
    switch (variant) {
      case 'primary': 
        return isDarkMode 
          ? "text-orange-500 hover:bg-orange-500/10" 
          : "text-blue-600 hover:bg-blue-50";
      case 'selected':
      case 'highlight': 
        return isDarkMode 
          ? "bg-orange-500 text-white shadow-[0_10px_20px_-5px_rgba(249,115,22,0.4)]" 
          : "bg-blue-600 text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)]";
      case 'danger':
        return isDarkMode 
          ? "text-red-400 hover:bg-red-500/10 hover:text-red-300" 
          : "text-red-600 hover:bg-red-50";
      case 'warning':
        return isDarkMode 
          ? "text-amber-400 hover:bg-amber-500/10" 
          : "text-amber-600 hover:bg-amber-50";
      default:
        return isDarkMode 
          ? "text-gray-300 hover:bg-white/10 hover:text-white" 
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
    }
  };

  const menuElement = isOpen ? (
    <div 
      ref={dropdownRef}
      style={{ 
        position: 'absolute',
        top: `${coords.top + 8}px`,
        left: align === 'right' 
          ? `${coords.left + coords.width - 240}px` 
          : `${coords.left}px`,
        width: '240px'
      }}
      className={`
        z-[9999] transform transition-all duration-300 origin-top
        animate-in fade-in zoom-in-95
        rounded-[1.25rem]
        backdrop-blur-3xl
        border
        ${isDarkMode 
          ? 'bg-black/80 border-white/10 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)]' 
          : 'bg-white/90 border-black/5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)]'
        }
      `}
    >
      <div className="p-1.5 overflow-hidden rounded-[1.25rem]">
        {items.map((item, index) => {
           const Icon = item.icon;
           const isSpecial = item.variant === 'selected' || item.variant === 'highlight';
           
           return (
            <div key={index}>
              <button
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all duration-200 group
                  ${getItemStyles(item.variant)}
                `}
              >
                {Icon && <Icon size={14} strokeWidth={3} className={isSpecial ? 'text-white' : 'opacity-70 group-hover:opacity-100'} />}
                {item.label}
              </button>
              
              {item.hasSeparatorAfter && (
                <div className={`my-1 h-px mx-2 ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <div className={`relative inline-block text-left ${className}`} ref={triggerRef}>
      <div onClick={toggle} className="cursor-pointer">
        {trigger}
      </div>
      {ReactDOM.createPortal(menuElement, document.body)}
    </div>
  );
};

export default GlassDropdown;