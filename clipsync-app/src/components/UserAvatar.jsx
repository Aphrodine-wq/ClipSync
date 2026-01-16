import { getUserColor, getInitials } from '../utils/userColors';

const UserAvatar = ({ 
  user, 
  size = 'medium', 
  showOnline = false,
  className = '' 
}) => {
  const userColor = user?.color || getUserColor(user?.id || user?.email);
  const initials = getInitials(user?.name || user?.email || 'User');
  
  const sizeClasses = {
    small: 'w-6 h-6 text-xs',
    medium: 'w-8 h-8 text-sm',
    large: 'w-12 h-12 text-base',
    xlarge: 'w-16 h-16 text-xl',
  };

  const onlineSize = {
    small: 'w-2 h-2',
    medium: 'w-2.5 h-2.5',
    large: 'w-3 h-3',
    xlarge: 'w-4 h-4',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Avatar Circle */}
      <div 
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          flex items-center justify-center 
          font-bold 
          shadow-md
          transition-all duration-200
          hover:scale-110
          cursor-pointer
        `}
        style={{
          background: userColor.gradient,
          color: userColor.text,
          border: `2px solid ${userColor.light}`,
        }}
        title={user?.name || user?.email}
      >
        {user?.picture ? (
          <img 
            src={user.picture} 
            alt={user.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Online Indicator */}
      {showOnline && user?.isOnline && (
        <div 
          className={`
            absolute bottom-0 right-0 
            ${onlineSize[size]} 
            bg-emerald-500 
            rounded-full 
            border-2 border-white
            animate-pulse
          `}
          title="Online"
        />
      )}
    </div>
  );
};

export default UserAvatar;
