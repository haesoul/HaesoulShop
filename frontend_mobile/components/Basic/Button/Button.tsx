// components/AppButton.tsx
import { useTheme } from '@/hooks/System/useThemedBackground';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'danger';
}

export const AppButton: React.FC<AppButtonProps> = ({ 
  title, 
  loading = false, 
  variant = 'primary', 
  style, 
  disabled,
  ...props 
}) => {
  const { colors } = useTheme();

  // Определяем цвета в зависимости от варианта
  const getBackgroundColor = () => {
    if (disabled) return '#A0A0A0';
    if (variant === 'outline') return 'transparent';
    if (variant === 'danger') return '#dc3545';
    return colors.primary; // По умолчанию синий
  };

  const getTextColor = () => {
    if (variant === 'outline') return colors.primary;
    return '#FFFFFF';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { 
          backgroundColor: getBackgroundColor(),
          borderColor: variant === 'outline' ? colors.primary : 'transparent',
          borderWidth: variant === 'outline' ? 1.5 : 0
        },
        style
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
});