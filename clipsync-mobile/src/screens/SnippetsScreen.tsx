/**
 * Snippets Screen
 * Displays and manages saved snippets
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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Snippet {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

export default function SnippetsScreen() {
  const [snippets, setSnippets] = useState<Snippet[]>([
    { id: '1', title: 'Email Signature', content: 'Best regards,\nJohn Doe\nSoftware Engineer', category: 'Work', createdAt: new Date().toISOString() },
    { id: '2', title: 'API Key Template', content: 'API_KEY=your_key_here\nAPI_SECRET=your_secret_here', category: 'Dev', createdAt: new Date().toISOString() },
    { id: '3', title: 'Meeting Invite', content: 'You are invited to a meeting:\nDate: TBD\nTime: TBD\nLocation: Google Meet', category: 'Work', createdAt: new Date().toISOString() },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSnippets = snippets.filter(
    s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in title and content');
      return;
    }

    if (editingSnippet) {
      setSnippets(prev => prev.map(s =>
        s.id === editingSnippet.id
          ? { ...s, title, content, category }
          : s
      ));
    } else {
      setSnippets(prev => [{
        id: Date.now().toString(),
        title,
        content,
        category,
        createdAt: new Date().toISOString(),
      }, ...prev]);
    }
    resetForm();
  };

  const handleEdit = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setTitle(snippet.title);
    setContent(snippet.content);
    setCategory(snippet.category);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Snippet', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setSnippets(prev => prev.filter(s => s.id !== id)) },
    ]);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('General');
    setEditingSnippet(null);
    setModalVisible(false);
  };

  const renderSnippet = ({ item }: { item: Snippet }) => (
    <TouchableOpacity style={styles.snippetCard} onPress={() => handleEdit(item)}>
      <View style={styles.snippetHeader}>
        <Text style={styles.snippetTitle}>{item.title}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
      <Text style={styles.snippetContent} numberOfLines={2}>{item.content}</Text>
      <View style={styles.snippetActions}>
        <TouchableOpacity onPress={() => handleEdit(item)}>
          <MaterialIcons name="edit" size={20} color="#6366f1" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <MaterialIcons name="delete" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search snippets..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredSnippets}
        renderItem={renderSnippet}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="code" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>No snippets yet</Text>
            <Text style={styles.emptySubtext}>Tap + to create your first snippet</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <MaterialIcons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={resetForm}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={resetForm}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingSnippet ? 'Edit Snippet' : 'New Snippet'}</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.contentInput]}
            placeholder="Snippet content..."
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
          <View style={styles.categoryRow}>
            {['General', 'Work', 'Dev', 'Personal'].map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', margin: 16, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, gap: 8 },
  searchInput: { flex: 1, fontSize: 16 },
  snippetCard: { backgroundColor: '#ffffff', padding: 16, marginHorizontal: 16, marginVertical: 8, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  snippetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  snippetTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  categoryBadge: { backgroundColor: '#ede9fe', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  categoryText: { fontSize: 11, fontWeight: '600', color: '#6366f1' },
  snippetContent: { fontSize: 14, color: '#6b7280', marginBottom: 12, lineHeight: 20 },
  snippetActions: { flexDirection: 'row', gap: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 64 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#374151', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#6b7280', marginTop: 8 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  modalContainer: { flex: 1, backgroundColor: '#ffffff', paddingTop: 60, paddingHorizontal: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  cancelButton: { fontSize: 16, color: '#6b7280' },
  saveButton: { fontSize: 16, fontWeight: '600', color: '#6366f1' },
  input: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
  contentInput: { height: 200 },
  categoryRow: { flexDirection: 'row', gap: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6' },
  categoryChipActive: { backgroundColor: '#6366f1' },
  categoryChipText: { fontSize: 14, color: '#6b7280' },
  categoryChipTextActive: { color: '#ffffff' },
});
