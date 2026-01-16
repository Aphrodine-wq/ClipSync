/**
 * History Screen
 * Displays clipboard history
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useClipStore, Clip } from '../store/useClipStore';
import { clipboardService } from '../services/clipboard';
import { formatDistanceToNow } from 'date-fns';

export default function HistoryScreen({ navigation }: any) {
  const {
    clips,
    searchQuery,
    activeFilter,
    isLoading,
    syncStatus,
    setSelectedClip,
    syncWithServer,
  } = useClipStore();

  const filteredClips = useMemo(() => {
    let filtered = [...clips];

    // Apply filter
    if (activeFilter === 'pinned') {
      filtered = filtered.filter(clip => clip.pinned);
    } else if (activeFilter === 'recent') {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      filtered = filtered.filter(
        clip => new Date(clip.createdAt) > oneDayAgo
      );
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        clip =>
          clip.content.toLowerCase().includes(query) ||
          clip.type.toLowerCase().includes(query) ||
          clip.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [clips, activeFilter, searchQuery]);

  const handleClipPress = async (clip: Clip) => {
    // Copy to clipboard
    await clipboardService.copy(clip.content);
    setSelectedClip(clip);
    navigation.navigate('ClipDetail', { clipId: clip.id });
  };

  const renderClip = ({ item }: { item: Clip }) => (
    <TouchableOpacity
      style={styles.clipCard}
      onPress={() => handleClipPress(item)}
    >
      <View style={styles.clipHeader}>
        <View style={styles.clipType}>
          <Text style={styles.clipTypeText}>{item.type}</Text>
        </View>
        {item.pinned && (
          <Icon name="push-pin" size={16} color="#6366f1" />
        )}
      </View>
      <Text style={styles.clipContent} numberOfLines={3}>
        {item.content}
      </Text>
      <View style={styles.clipFooter}>
        <Text style={styles.clipTime}>
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
        </Text>
        {item.tags.length > 0 && (
          <View style={styles.tags}>
            {item.tags.slice(0, 3).map(tag => (
              <Text key={tag} style={styles.tag}>
                #{tag}
              </Text>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredClips}
        renderItem={renderClip}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={syncWithServer}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="content-copy" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>No clips yet</Text>
            <Text style={styles.emptySubtext}>
              Copy something to get started!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  clipCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  clipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clipType: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  clipTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
  },
  clipContent: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
    lineHeight: 20,
  },
  clipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clipTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  tags: {
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    fontSize: 11,
    color: '#6366f1',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
});

