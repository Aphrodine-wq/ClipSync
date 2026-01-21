/**
 * Clip Detail Screen
 * Shows full clip details
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useClipStore } from '../store/useClipStore';
import { clipboardService } from '../services/clipboard';
import { format } from 'date-fns';
import { TRANSFORMS } from '../utils/transforms';

type Props = { route: { params: { clipId: string } }; navigation: { goBack: () => void } };
export default function ClipDetailScreen({ route, navigation }: Props) {
  const { clipId } = route.params;
  const { clips, deleteClip, pinClip } = useClipStore();
  const clip = clips.find(c => c.id === clipId);

  if (!clip) {
    return (
      <View style={styles.container}>
        <Text>Clip not found</Text>
      </View>
    );
  }

  const [showPalette, setShowPalette] = React.useState(false);
  const [content, setContent] = React.useState(clip.content);

  // Reset content if clip changes
  React.useEffect(() => {
    setContent(clip.content);
  }, [clip.id]);

  const handleCopy = async () => {
    await clipboardService.copy(content);
  };

  const handleDelete = async () => {
    await deleteClip(clip.id);
    navigation.goBack();
  };

  const handlePin = async () => {
    await pinClip(clip.id);
  };

  const applyTransform = (transformFn: (t: string) => string) => {
    const newContent = transformFn(content);
    setContent(newContent);
    setShowPalette(false);
  };

  const saveChanges = () => {
    // In a real app we'd update the store
    // updateClip(clip.id, { content });
    // For now just copy
    handleCopy();
  };

  const CommandPalette = () => (
    <Modal
      visible={showPalette}
      transparent
      animationType="slide"
      onRequestClose={() => setShowPalette(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Command Palette</Text>
            <TouchableOpacity onPress={() => setShowPalette(false)}>
              <MaterialIcons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.transformList}>
            {TRANSFORMS.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={styles.transformItem}
                onPress={() => applyTransform(t.fn)}
              >
                <MaterialIcons name="transform" size={20} color="#6366f1" />
                <Text style={styles.transformName}>{t.name}</Text>
                <Text style={styles.transformCategory}>{t.category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{clip.type}</Text>
          </View>
          {clip.pinned && <MaterialIcons name="push-pin" size={20} color="#6366f1" />}
        </View>

        <View style={styles.content}>
          <Text style={styles.contentText}>{content}</Text>
        </View>

        <View style={styles.metadata}>
          <Text style={styles.metadataLabel}>Created</Text>
          <Text style={styles.metadataValue}>
            {format(new Date(clip.createdAt), 'PPpp')}
          </Text>
        </View>

        {clip.tags.length > 0 && (
          <View style={styles.tags}>
            <Text style={styles.tagsLabel}>Tags</Text>
            <View style={styles.tagsList}>
              {clip.tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button for Commands */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowPalette(true)}
      >
        <MaterialIcons name="terminal" size={24} color="#ffffff" />
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
          <MaterialIcons name="content-copy" size={24} color="#6366f1" />
          <Text style={styles.actionText}>Copy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handlePin}>
          <MaterialIcons
            name={clip.pinned ? 'push-pin' : 'push-pin'}
            size={24}
            color={clip.pinned ? '#6366f1' : '#9ca3af'}
          />
          <Text style={styles.actionText}>
            {clip.pinned ? 'Unpin' : 'Pin'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <MaterialIcons name="delete" size={24} color="#ef4444" />
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>

      <CommandPalette />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  typeBadge: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
  },
  content: {
    padding: 16,
    minHeight: 200,
  },
  contentText: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
    fontFamily: 'monospace',
  },
  metadata: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  metadataLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  metadataValue: {
    fontSize: 14,
    color: '#111827',
  },
  tags: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  tagsLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#6366f1',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#6366f1',
  },
  deleteButton: {},
  deleteText: {
    color: '#ef4444',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#6366f1',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  transformList: {
    padding: 16,
  },
  transformItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  transformName: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  transformCategory: {
    fontSize: 12,
    color: '#9ca3af',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
});

