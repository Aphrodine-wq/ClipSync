import { useEffect, useState } from 'react';
import useTeamStore from '../../store/useTeamStore';
import useAuthStore from '../../store/useAuthStore';
import TeamSpaceScreen from './TeamSpaceScreen';

const TeamsListScreen = () => {
  const { teams, initialize, createTeam, deleteTeam, isLoading } = useTeamStore();
  const { user } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (selectedTeamId) {
    return (
      <TeamSpaceScreen
        teamId={selectedTeamId}
        onClose={() => setSelectedTeamId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Team Spaces</h1>
            <p className="text-zinc-600 mt-1">Collaborate with your team on shared clipboards</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Team
          </button>
        </div>

        {/* Teams Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin"></div>
            <p className="text-sm text-zinc-600 mt-4">Loading teams...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center" style={{ border: '1px solid #E5E5E5' }}>
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">No teams yet</h3>
            <p className="text-zinc-600 mb-6">Create your first team to start collaborating</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-zinc-900 text-white rounded-lg font-semibold hover:bg-zinc-800 transition-colors"
            >
              Create Your First Team
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map(team => (
              <TeamCard
                key={team.id}
                team={team}
                currentUserId={user?.id}
                onSelect={() => setSelectedTeamId(team.id)}
                onDelete={() => deleteTeam(team.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onCreate={async (teamData) => {
            await createTeam(teamData);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

// Team Card Component
const TeamCard = ({ team, currentUserId, onSelect, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const isOwner = team.owner_id === currentUserId;

  const handleDelete = async () => {
    if (confirm(`Delete team "${team.name}"? This cannot be undone.`)) {
      await onDelete();
    }
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
      style={{ border: '1px solid #E5E5E5' }}
    >
      <div onClick={onSelect} className="p-6">
        {/* Team Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
          <span className="text-2xl">👥</span>
        </div>

        {/* Team Info */}
        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{team.name}</h3>
        <div className="flex items-center gap-4 text-sm text-zinc-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {team.member_count} members
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {team.clip_count} clips
          </span>
        </div>

        {/* Role Badge */}
        <div className="mt-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            team.role === 'owner' ? 'bg-amber-100 text-amber-800' :
            team.role === 'admin' ? 'bg-blue-100 text-blue-800' :
            'bg-zinc-100 text-zinc-700'
          }`}>
            {team.role}
          </span>
        </div>
      </div>

      {/* Menu Button */}
      {isOwner && (
        <div className="absolute top-4 right-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 rounded-lg hover:bg-zinc-100 transition-colors opacity-0 group-hover:opacity-100"
          >
            <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-zinc-200 py-2 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Delete Team
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Create Team Modal Component
const CreateTeamModal = ({ onClose, onCreate }) => {
  const [teamName, setTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await onCreate({ name: teamName.trim() });
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900">Create New Team</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Team Name
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Engineering Team"
              required
              autoFocus
              className="w-full px-4 py-3 bg-zinc-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
            <p className="text-xs text-zinc-500 mt-2">
              Choose a name that describes your team or project
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !teamName.trim()}
              className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">Team Features</p>
              <ul className="text-xs text-blue-700 mt-2 space-y-1">
                <li>• Share clips with team members</li>
                <li>• Real-time collaboration</li>
                <li>• Activity tracking</li>
                <li>• Role-based permissions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsListScreen;
