import { useState } from 'react';
import { 
  Filter, 
  Code2, 
  Braces, 
  Link, 
  Fingerprint, 
  Palette, 
  Mail,
  Globe,
  Key,
  Settings2,
  FolderOpen,
  Type,
  Layers,
  ChevronDown,
  X,
  Sparkles
} from 'lucide-react';
import useClipStore from '../../store/useClipStore';

// Filter configurations with icons and colors
const filterConfig = {
  all: { 
    icon: Layers, 
    label: 'All', 
    gradient: 'from-zinc-500 to-slate-600',
    bg: 'bg-zinc-100',
    activeBg: 'bg-gradient-to-r from-zinc-700 to-zinc-900',
  },
  code: { 
    icon: Code2, 
    label: 'Code', 
    gradient: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-50',
    activeBg: 'bg-gradient-to-r from-sky-500 to-blue-600',
  },
  json: { 
    icon: Braces, 
    label: 'JSON', 
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    activeBg: 'bg-gradient-to-r from-violet-500 to-purple-600',
  },
  url: { 
    icon: Link, 
    label: 'URLs', 
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    activeBg: 'bg-gradient-to-r from-emerald-500 to-teal-600',
  },
  uuid: { 
    icon: Fingerprint, 
    label: 'UUIDs', 
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    activeBg: 'bg-gradient-to-r from-amber-500 to-orange-600',
  },
  color: { 
    icon: Palette, 
    label: 'Colors', 
    gradient: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50',
    activeBg: 'bg-gradient-to-r from-pink-500 to-rose-600',
  },
  email: { 
    icon: Mail, 
    label: 'Emails', 
    gradient: 'from-indigo-500 to-blue-600',
    bg: 'bg-indigo-50',
    activeBg: 'bg-gradient-to-r from-indigo-500 to-blue-600',
  },
  ip: { 
    icon: Globe, 
    label: 'IPs', 
    gradient: 'from-teal-500 to-cyan-600',
    bg: 'bg-teal-50',
    activeBg: 'bg-gradient-to-r from-teal-500 to-cyan-600',
  },
  token: { 
    icon: Key, 
    label: 'Tokens', 
    gradient: 'from-red-500 to-rose-600',
    bg: 'bg-red-50',
    activeBg: 'bg-gradient-to-r from-red-500 to-rose-600',
  },
  env: { 
    icon: Settings2, 
    label: 'ENV', 
    gradient: 'from-lime-500 to-green-600',
    bg: 'bg-lime-50',
    activeBg: 'bg-gradient-to-r from-lime-500 to-green-600',
  },
  path: { 
    icon: FolderOpen, 
    label: 'Paths', 
    gradient: 'from-orange-500 to-amber-600',
    bg: 'bg-orange-50',
    activeBg: 'bg-gradient-to-r from-orange-500 to-amber-600',
  },
  text: { 
    icon: Type, 
    label: 'Text', 
    gradient: 'from-zinc-500 to-slate-600',
    bg: 'bg-zinc-50',
    activeBg: 'bg-gradient-to-r from-zinc-500 to-zinc-600',
  },
};

const FilterBar = () => {
  const { activeFilter, setActiveFilter, getClipCounts } = useClipStore();
  const [showMore, setShowMore] = useState(false);
  const counts = getClipCounts();
  
  // Primary filters (always visible)
  const primaryFilters = ['all', 'code', 'json', 'url', 'uuid', 'color'];
  
  // Secondary filters (shown in dropdown)
  const secondaryFilters = ['email', 'ip', 'token', 'env', 'path', 'text'];
  
  // Check if active filter is in secondary
  const isSecondaryActive = secondaryFilters.includes(activeFilter);
  
  return (
    <div className="mb-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" strokeWidth={2} />
          <span className="text-sm font-medium text-zinc-700">Filter by type</span>
        </div>
        
        {activeFilter !== 'all' && (
          <button
            onClick={() => setActiveFilter('all')}
            className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X className="w-3 h-3" strokeWidth={2} />
            Clear filter
          </button>
        )}
      </div>
      
      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Primary Filters */}
        {primaryFilters.map(filterKey => {
          const config = filterConfig[filterKey];
          const Icon = config.icon;
          const count = counts[filterKey] || 0;
          const isActive = activeFilter === filterKey;
          
          return (
            <button
              key={filterKey}
              onClick={() => setActiveFilter(filterKey)}
              className={`
                group
                flex items-center gap-2
                px-3 py-2
                rounded-xl
                text-sm font-medium
                transition-all duration-200 ease-out
                ${isActive 
                  ? `${config.activeBg} text-white shadow-lg scale-105` 
                  : `${config.bg} text-zinc-700 hover:scale-105 hover:shadow-md`
                }
              `}
            >
              <Icon 
                className={`w-4 h-4 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} 
                strokeWidth={2} 
              />
              <span>{config.label}</span>
              {count > 0 && (
                <span 
                  className={`
                    px-1.5 py-0.5 
                    rounded-md 
                    text-xs font-bold
                    ${isActive ? 'bg-white/20' : 'bg-black/5'}
                  `}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
        
        {/* More Filters Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMore(!showMore)}
            className={`
              flex items-center gap-2
              px-3 py-2
              rounded-xl
              text-sm font-medium
              transition-all duration-200
              ${isSecondaryActive 
                ? `${filterConfig[activeFilter].activeBg} text-white shadow-lg` 
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }
            `}
          >
            {isSecondaryActive ? (
              <>
                {(() => {
                  const Icon = filterConfig[activeFilter].icon;
                  return <Icon className="w-4 h-4" strokeWidth={2} />;
                })()}
                <span>{filterConfig[activeFilter].label}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" strokeWidth={2} />
                <span>More</span>
              </>
            )}
            <ChevronDown 
              className={`w-4 h-4 transition-transform duration-200 ${showMore ? 'rotate-180' : ''}`} 
              strokeWidth={2} 
            />
          </button>
          
          {/* Dropdown Menu */}
          {showMore && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setShowMore(false)}
              />
              
              {/* Menu */}
              <div 
                className="
                  absolute top-full left-0 mt-2
                  w-48
                  bg-white
                  rounded-xl
                  shadow-xl
                  border border-zinc-200
                  py-2
                  z-20
                  animate-fadeIn
                "
              >
                {secondaryFilters.map(filterKey => {
                  const config = filterConfig[filterKey];
                  const Icon = config.icon;
                  const count = counts[filterKey] || 0;
                  const isActive = activeFilter === filterKey;
                  
                  return (
                    <button
                      key={filterKey}
                      onClick={() => {
                        setActiveFilter(filterKey);
                        setShowMore(false);
                      }}
                      className={`
                        w-full
                        flex items-center justify-between
                        px-3 py-2
                        text-sm
                        transition-colors
                        ${isActive 
                          ? 'bg-zinc-100 text-zinc-900 font-medium' 
                          : 'text-zinc-700 hover:bg-zinc-50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-lg ${config.bg}`}>
                          <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                        </div>
                        <span>{config.label}</span>
                      </div>
                      {count > 0 && (
                        <span className="text-xs text-zinc-400">{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Active Filter Summary */}
      {activeFilter !== 'all' && (
        <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
          <span>Showing</span>
          <span className="font-semibold text-zinc-700">
            {counts[activeFilter] || 0}
          </span>
          <span>{filterConfig[activeFilter]?.label.toLowerCase()} clips</span>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
