import React from 'react';
import { StyleProp, ViewStyle, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const MDI_NAME_MAP: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  'speedometer': 'speedometer',
  'speedometer-outline': 'speedometer',
  'chart-line': 'chart-timeline-variant',
  'cube': 'cube-outline',
  'cube-outline': 'cube-outline',
  'sparkles': 'creation',
  'sparkles-outline': 'creation-outline',
  'shield-checkmark': 'shield-check',
  'shield-checkmark-outline': 'shield-check-outline',
  'shield-outline': 'shield-outline',
  'notifications': 'bell',
  'notifications-outline': 'bell-outline',
  'settings': 'cog',
  'settings-outline': 'cog-outline',
  'server': 'server',
  'close': 'close',
  'close-circle': 'close-circle',
  'alert-circle': 'alert-circle',
  'checkmark-circle': 'check-circle',
  'flash': 'lightning-bolt',
  'flash-outline': 'lightning-bolt-outline',
  'search': 'magnify',
  'search-outline': 'magnify',
  'document-text': 'file-document-outline',
  'document-text-outline': 'file-document-outline',
  'warning': 'alert',
  'warning-outline': 'alert',
  'pulse': 'pulse',
  'account-group': 'account-group',
  'check-decagram': 'check-decagram',
  'clock-alert-outline': 'clock-alert-outline',
  'heart': 'heart',
  'chart-timeline-variant': 'chart-timeline-variant',
};

export const MdiIcon: React.FC<IconProps> = ({
  name,
  size = 20,
  color = '#FAFAFA',
  style,
}) => {
  const normalizedKey = (name || '').toLowerCase().replace(/^mdi:/, '');
  const iconName = MDI_NAME_MAP[normalizedKey] || (normalizedKey as keyof typeof MaterialCommunityIcons.glyphMap);

  return (
    <View style={style}>
      <MaterialCommunityIcons name={iconName} size={size} color={color} />
    </View>
  );
};

export const Icon = MdiIcon;
