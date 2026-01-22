// components/AppInput.tsx
import { useTheme } from '@/hooks/System/useThemedBackground';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string; // Текст ошибки, если есть
}

export const AppInput: React.FC<AppInputProps> = ({ label, error, style, ...props }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      
      <TextInput
        style={[
          styles.input,
          { 
            color: colors.text, 
            borderColor: error ? '#dc3545' : colors.inputBorder,
            backgroundColor: colors.background // или немного светлее для контраста
          },
          style
        ]}
        placeholderTextColor="#888"
        {...props}
      />
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
    opacity: 0.8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
});