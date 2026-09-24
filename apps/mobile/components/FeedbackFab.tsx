import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppStorage } from '../src/storage/app-storage';
import { useThemeColors, Radius, Spacing } from '../utils/theme';
import { useBreakpoint } from '../utils/responsive';

const COACH_MARK_KEY = 'feedback_fab_coach_mark_seen';

export function FeedbackFab() {
  const insets = useSafeAreaInsets();
  const bp = useBreakpoint();
  const isDesktop = bp === 'desktop';
  
  const [expanded, setExpanded] = useState(true);
  const [animation] = useState(new Animated.Value(1));

  useEffect(() => {
    async function checkCoachMark() {
      const seen = await AppStorage.getItem(COACH_MARK_KEY);
      if (seen === 'true') {
        setExpanded(false);
        animation.setValue(0);
      }
    }
    checkCoachMark();
  }, [animation]);

  const handlePress = async () => {
    if (expanded) {
      setExpanded(false);
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      await AppStorage.setItem(COACH_MARK_KEY, 'true');
    }
    router.push('/feedback');
  };

  const bottomOffset = isDesktop ? 24 : Platform.OS === 'ios' ? 84 + 12 : 60 + 12;
  const paddingBottom = Math.max(insets.bottom + bottomOffset, bottomOffset);

  const fabWidth = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [56, 130],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: paddingBottom,
          width: fabWidth,
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
        {expanded && (
          <Text style={styles.label} numberOfLines={1}>
            Feedback
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    height: 56,
    zIndex: 999,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  icon: {
    fontSize: 22,
    color: '#fff',
  },
  label: {
    fontSize: 15,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
    overflow: 'hidden',
  },
});
