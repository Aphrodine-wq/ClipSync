/**
 * Teams Screen
 * Displays team collaboration
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TeamsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Teams Screen</Text>
      <Text style={styles.subtext}>Coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  subtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
});

