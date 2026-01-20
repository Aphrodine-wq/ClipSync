/**
 * Teams Screen
 * Displays team collaboration and shared clips
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  clipCount: number;
}

export default function TeamsScreen() {
  const [teams, setTeams] = useState<Team[]>([
    {
      id: '1',
      name: 'Engineering',
      description: 'Development team shared clips',
      members: [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'owner' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'admin' },
        { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'member' },
      ],
      clipCount: 24,
    },
    {
      id: '2',
      name: 'Design',
      description: 'Design resources and links',
      members: [
        { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'owner' },
        { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', role: 'member' },
      ],
      clipCount: 12,
    },
  ]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }
    setTeams(prev => [...prev, {
      id: Date.now().toString(),
      name: newTeamName,
      description: newTeamDesc,
      members: [{ id: 'me', name: 'You', email: 'you@example.com', role: 'owner' }],
      clipCount: 0,
    }]);
    setNewTeamName('');
    setNewTeamDesc('');
    setModalVisible(false);
  };

  const handleLeaveTeam = (teamId: string) => {
    Alert.alert('Leave Team', 'Are you sure you want to leave this team?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => setTeams(prev => prev.filter(t => t.id !== teamId)) },
    ]);
  };

  const renderTeam = ({ item }: { item: Team }) => (
    <TouchableOpacity style={styles.teamCard} onPress={() => setSelectedTeam(item)}>
      <View style={styles.teamIcon}>
        <Text style={styles.teamIconText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{item.name}</Text>
        <Text style={styles.teamDescription}>{item.description}</Text>
        <View style={styles.teamMeta}>
          <View style={styles.metaItem}>
            <MaterialIcons name="group" size={14} color="#6b7280" />
            <Text style={styles.metaText}>{item.members.length} members</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons name="content-copy" size={14} color="#6b7280" />
            <Text style={styles.metaText}>{item.clipCount} clips</Text>
          </View>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
    </TouchableOpacity>
  );

  const renderMember = ({ item }: { item: TeamMember }) => (
    <View style={styles.memberRow}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
      </View>
      <View style={[styles.roleBadge, item.role === 'owner' && styles.ownerBadge]}>
        <Text style={styles.roleText}>{item.role}</Text>
      </View>
    </View>
  );

  if (selectedTeam) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => setSelectedTeam(null)}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
          <Text style={styles.backText}>Teams</Text>
        </TouchableOpacity>

        <View style={styles.teamHeader}>
          <View style={styles.teamIconLarge}>
            <Text style={styles.teamIconTextLarge}>{selectedTeam.name.charAt(0)}</Text>
          </View>
          <Text style={styles.teamNameLarge}>{selectedTeam.name}</Text>
          <Text style={styles.teamDescLarge}>{selectedTeam.description}</Text>
        </View>

        <Text style={styles.sectionTitle}>Members ({selectedTeam.members.length})</Text>
        <FlatList
          data={selectedTeam.members}
          renderItem={renderMember}
          keyExtractor={item => item.id}
        />

        <TouchableOpacity style={styles.leaveButton} onPress={() => handleLeaveTeam(selectedTeam.id)}>
          <Text style={styles.leaveButtonText}>Leave Team</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={teams}
        renderItem={renderTeam}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="group" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>No teams yet</Text>
            <Text style={styles.emptySubtext}>Create a team to share clips</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <MaterialIcons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Team</Text>
            <TouchableOpacity onPress={handleCreateTeam}>
              <Text style={styles.saveButton}>Create</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Team Name"
            value={newTeamName}
            onChangeText={setNewTeamName}
          />
          <TextInput
            style={[styles.input, styles.descInput]}
            placeholder="Description (optional)"
            value={newTeamDesc}
            onChangeText={setNewTeamDesc}
            multiline
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  teamCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 16, marginHorizontal: 16, marginVertical: 8, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  teamIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  teamIconText: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  teamInfo: { flex: 1 },
  teamName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  teamDescription: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  teamMeta: { flexDirection: 'row', gap: 16, marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#6b7280' },
  emptyState: { alignItems: 'center', paddingVertical: 64 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#374151', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#6b7280', marginTop: 8 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  modalContainer: { flex: 1, backgroundColor: '#ffffff', paddingTop: 60, paddingHorizontal: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  cancelButton: { fontSize: 16, color: '#6b7280' },
  saveButton: { fontSize: 16, fontWeight: '600', color: '#6366f1' },
  input: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
  descInput: { height: 100 },
  backButton: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 8 },
  backText: { fontSize: 16, color: '#111827' },
  teamHeader: { alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  teamIconLarge: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  teamIconTextLarge: { fontSize: 32, fontWeight: 'bold', color: '#ffffff' },
  teamNameLarge: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  teamDescLarge: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6b7280', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, textTransform: 'uppercase' },
  memberRow: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#ffffff', marginHorizontal: 16, marginVertical: 4, borderRadius: 12 },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  memberAvatarText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: '500', color: '#111827' },
  memberEmail: { fontSize: 12, color: '#6b7280' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: '#e5e7eb' },
  ownerBadge: { backgroundColor: '#fef3c7' },
  roleText: { fontSize: 11, fontWeight: '600', color: '#374151', textTransform: 'uppercase' },
  leaveButton: { margin: 16, padding: 16, borderRadius: 12, backgroundColor: '#fef2f2', alignItems: 'center' },
  leaveButtonText: { fontSize: 16, fontWeight: '600', color: '#ef4444' },
});
