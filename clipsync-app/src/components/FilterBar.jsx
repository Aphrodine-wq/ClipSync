import useClipStore from '../store/useClipStore';

const FilterBar = () => {
  const { activeFilter, setActiveFilter, getClipCounts } = useClipStore();
  const counts = getClipCounts();

  const filters = [
    { label: 'All', value: 'all', count: counts.all },
    { label: 'Code', value: 'code', count: counts.code },
    { label: 'JSON', value: 'json', count: counts.json },
    { label: 'URLs', value: 'url', count: counts.url },
    { label: 'UUIDs', value: 'uuid', count: counts.uuid },
    { label: 'Colors', value: 'color', count: counts.color },
  ];

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
      {filters.map(filter => (
        <button
          key={filter.value}
          onClick={() => setActiveFilter(filter.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150 ease-out ${activeFilter === filter.value ? 'bg-zinc-900 text-white shadow-md' : 'bg-white text-zinc-600 hover:bg-zinc-100'}`}
          style={{ border: activeFilter === filter.value ? 'none' : '1px solid #E5E5E5' }}
        >
          {filter.label}
          {filter.count !== undefined && (
            <span className={`ml-2 ${activeFilter === filter.value ? 'text-zinc-400' : 'text-zinc-400'}`}>
              {filter.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
