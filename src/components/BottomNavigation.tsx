import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Server, BarChart, Clock, Settings } from 'lucide-react-native';
import { colors } from '../theme/colors';

export const NAV_HEIGHT = 72;

type Props = {
  onTabPress?: (key: string) => void;
};

const TABS = [
  { key: 'Machines', label: 'Machines', Icon: Server },
  { key: 'Reports', label: 'Reports', Icon: BarChart },
  { key: 'History', label: 'History', Icon: Clock },
  { key: 'Settings', label: 'Settings', Icon: Settings },
];

export default function BottomNavigation({ onTabPress }: Props) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string>('Machines');

  const iconScales = useRef<Record<string, Animated.Value>>(
    TABS.reduce<Record<string, Animated.Value>>((acc, t) => {
      acc[t.key] = new Animated.Value(t.key === selected ? 1.15 : 1);
      return acc;
    }, {})
  ).current;

  const barTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.timing(barTranslateY, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [barTranslateY]);

  const onPressTab = (tabKey: string) => {
    if (tabKey === selected) return;

    Animated.parallel([
      Animated.spring(iconScales[tabKey], { toValue: 1.15, useNativeDriver: true }),
      Animated.spring(iconScales[selected], { toValue: 1, useNativeDriver: true }),
    ]).start();

    setSelected(tabKey);
    onTabPress?.(tabKey);
  };

  return (
    <View style={[styles.bottomNavWrapper, { paddingBottom: insets.bottom }]}> 
      <Animated.View style={[styles.bottomNav, { transform: [{ translateY: barTranslateY }] }]}> 
        {TABS.map((tab) => {
          const isActive = selected === tab.key;
          const scale = iconScales[tab.key] || new Animated.Value(1);
          const Icon = tab.Icon as any;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabButton}
              onPress={() => onPressTab(tab.key)}
              activeOpacity={0.85}
            >
              <Animated.View style={{ transform: [{ scale }] }}>
                <Icon size={22} color={isActive ? colors.navActive : colors.navInactive} />
              </Animated.View>
              <Text style={[styles.tabLabel, { color: isActive ? '#000' : colors.navInactive }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  bottomNav: {
    width: '100%',
    height: NAV_HEIGHT,
    borderRadius: 0,
    backgroundColor: colors.cardWhite,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    // shadow on top border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: '#00000010',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
});