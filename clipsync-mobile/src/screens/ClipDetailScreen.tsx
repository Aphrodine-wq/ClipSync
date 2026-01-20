/**
 * Clip Detail Screen
 * Shows full clip details
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useClipStore } from '../store/useClipStore';
import { clipboardService } from '../services/clipboard';
import { format } from 'date-fns';

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

  const handleCopy = async () => {
    await clipboardService.copy(clip.content);
    // Show toast notification
  };

  const handleDelete = async () => {
    await deleteClip(clip.id);
    navigation.goBack();
  };

  const handlePin = async () => {
    await pinClip(clip.id);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{clip.type}</Text>
        </View>
        {clip.pinned && <MaterialIcons name="push-pin" size={20} color="#6366f1" />}
      </View>

      <View style={styles.content}>
        <Text style={styles.contentText}>{clip.content}</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  },
  contentText: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
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
});

