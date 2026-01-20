import { useEffect, useState } from 'react';
import { Users, Send, UserPlus, Activity } from 'lucide-react';
import useTeamStore from '../../store/useTeamStore';
import useAuthStore from '../../store/useAuthStore';
import wsClient from '../../services/websocket';
import ClipBubble from '../clips/ClipBubble';
import UserAvatar from '../common/UserAvatar';
import { getUserColor } from '../../utils/userColors';

const TeamSpaceScreen = ({ teamId, onClose }) => {
  const { 
    currentTeam, 
    teamClips, 
    teamMembers,
    getTeam, 
    getTeamClips,
    createTeamClip,
    deleteTeamClip,
    isLoading 
  } = useTeamStore();
  
  const { user } = useAuthStore();
  const [newClipContent, setNewClipContent] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('clips');

  useEffect(() => {
    const loadTeam = async () => {
      await getTeam(teamId);
      await getTeamClips(teamId);
    };
    
    loadTeam();

    // Set up WebSocket listeners for team updates
    const handleTeamClipCreated = ({ teamId: tid, clip }) => {
      if (tid === teamId) {
        useTeamStore.getState().syncTeamClipFromRemote(tid, clip);
      }
    };

    const handleTeamClipDeleted = ({ teamId: tid, clipId }) => {
      if (tid === teamId) {
        useTeamStore.getState().deleteTeamClipFromRemote(tid, clipId);
      }
    };

    wsClient.on('team-clip:created', handleTeamClipCreated);
    wsClient.on('team-clip:deleted', handleTeamClipDeleted);

    return () => {
      wsClient.off('team-clip:created', handleTeamClipCreated);
      wsClient.off('team-clip:deleted', handleTeamClipDeleted);
    };
  }, [teamId, getTeam, getTeamClips]);

  const handleCreateClip = async (e) => {
    e.preventDefault();
    if (!newClipContent.trim()) return;

    try {
      await createTeamClip(teamId, {
        content: newClipContent,
        type: 'text',
      });
      setNewClipContent('');
    } catch (error) {
      console.error('Failed to create team clip:', error);
    }
  };

  const handleDeleteClip = async (clipId) => {
    if (!confirm('Delete this clip?')) return;
    
    try {
      await deleteTeamClip(teamId, clipId);
    } catch (error) {
      console.error('Failed to delete clip:', error);
    }
  };

  const handleCopyClip = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (isLoading && !currentTeam) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin"></div>
          <p className="text-sm text-zinc-600 mt-4">Loading team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">{currentTeam?.name}</h1>
                <p className="text-sm text-zinc-500">
                  {teamMembers?.length || 0} members · {teamClips?.length || 0} clips
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              <UserPlus className="w-4 h-4" strokeWidth={2.5} />
              Invite Members
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mt-4">
            {[
              { id: 'clips', label: 'Clips', icon: Send },
              { id: 'members', label: 'Members', icon: Users },
              { id: 'activity', label: 'Activity', icon: Activity },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:scale-105'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'clips' && (
          <div className="space-y-6">
            {/* New Clip Form - Nintendo DS Style */}
            <div className="bg-white rounded-2xl shadow-lg p-4" style={{ border: '2px solid #E5E5E5' }}>
              <form onSubmit={handleCreateClip} className="flex items-end gap-3">
                <div className="flex-1">
                  <textarea
                    value={newClipContent}
                    onChange={(e) => setNewClipContent(e.target.value)}
                    placeholder="Type a message to your team... 💬"
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        handleCreateClip(e);
                      }
                    }}
                  />
                  <p className="text-xs text-zinc-400 mt-1 px-2">
                    Press Ctrl+Enter to send
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={!newClipContent.trim()}
                  className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg"
                  title="Send message"
                >
                  <Send className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </form>
            </div>

            {/* Team Clips List - Nintendo DS Chat Style */}
            <div className="bg-gradient-to-b from-blue-50 to-purple-50 rounded-2xl shadow-sm p-6 min-h-[500px] chat-scrollbar overflow-y-auto" style={{ border: '2px solid #E5E5E5' }}>
              {teamClips.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <div className="text-6xl mb-4 animate-bounce">💬</div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-2">Start the conversation!</h3>
                  <p className="text-sm text-zinc-500">Share your first clip with the team</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teamClips.map(clip => {
                    const isOwn = clip.user_id === user?.id;
                    const clipUser = {
                      id: clip.user_id,
                      name: clip.user_name,
                      email: clip.user_email,
                      picture: clip.user_picture,
                      color: getUserColor(clip.user_id),
                      isOnline: true, // TODO: Add real online status
                    };

                    return (
                      <ClipBubble
                        key={clip.id}
                        clip={{
                          ...clip,
                          user: clipUser,
                          timestamp: new Date(clip.created_at).getTime(),
                        }}
                        isOwn={isOwn}
                        onCopy={() => handleCopyClip(clip.content)}
                        onPin={() => {}} // Team clips don't have pin functionality yet
                        onDelete={() => handleDeleteClip(clip.id)}
                        showAvatar={true}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="bg-white rounded-2xl shadow-sm" style={{ border: '1px solid #E5E5E5' }}>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" strokeWidth={2} />
                Team Members
              </h3>
              <div className="space-y-3">
                {teamMembers?.map(member => {
                  const memberColor = getUserColor(member.id);
                  return (
                    <div 
                      key={member.id} 
                      className="flex items-center justify-between p-4 rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
                      style={{
                        background: `linear-gradient(135deg, ${memberColor.light} 0%, ${memberColor.bg}10 100%)`,
                        border: `2px solid ${memberColor.bg}30`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar 
                          user={{
                            ...member,
                            color: memberColor,
                            isOnline: true, // TODO: Add real online status
                          }} 
                          size="large" 
                          showOnline={true}
                        />
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">{member.name}</p>
                          <p className="text-xs text-zinc-500">{member.email}</p>
                        </div>
                      </div>
                      <span 
                        className="px-3 py-1 text-xs font-bold rounded-full"
                        style={{
                          background: memberColor.bg,
                          color: memberColor.text,
                        }}
                      >
                        {member.role}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white rounded-2xl shadow-sm p-6" style={{ border: '1px solid #E5E5E5' }}>
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Recent Activity</h3>
            <p className="text-sm text-zinc-500">Activity feed coming soon...</p>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          teamId={teamId}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
};

// Invite Modal Component
const InviteModal = ({ teamId, onClose }) => {
  const { inviteTeamMember } = useTeamStore();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInvite = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await inviteTeamMember(teamId, { email, role });
      onClose();
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900">Invite Team Member</h2>
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

        <form onSubmit={handleInvite}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
              className="w-full px-4 py-2 bg-zinc-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
            >
              <option value="member">Member</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
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
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Inviting...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamSpaceScreen;
