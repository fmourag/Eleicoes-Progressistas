import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useBreakpoint } from '../utils/responsive';

export function FeedbackFab() {
  const insets = useSafeAreaInsets();
  const bp = useBreakpoint();
  const isDesktop = bp === 'desktop';

  const handlePress = () => {
    router.push('/feedback');
  };

  const bottomOffset = isDesktop ? 32 : Platform.OS === 'ios' ? 84 + 16 : 60 + 16;
  const paddingBottom = Math.max(insets.bottom + bottomOffset, bottomOffset);

  return (
    <View
      style={[
        styles.container,
        {
          bottom: paddingBottom,
          right: isDesktop ? 32 : 16,
        }
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        style={[
          styles.button,
          { backgroundColor: '#1B5E20' }
        ]}
        accessibilityLabel="Enviar feedback ou participar do teste fechado"
        accessibilityRole="button"
      >
        <Text style={styles.icon}>💬</Text>
        <Text style={styles.label} numberOfLines={1}>
          Feedback
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    height: 48,
    zIndex: 999,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  icon: {
    fontSize: 20,
    color: '#fff',
  },
  label: {
    fontSize: 15,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
});
