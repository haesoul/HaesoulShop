import React from 'react';
import {
  Animated,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle
} from 'react-native';

type ButtonProps = {
  title?: string | React.ReactNode;
  onPress?: (e?: GestureResponderEvent) => void;
  style?: ViewStyle | any;
  pressableStyle?: any;
  textStyle?: TextStyle | any;
  disabled?: boolean;
  onPressIn?: (e?: GestureResponderEvent) => void;
  onPressOut?: (e?: GestureResponderEvent) => void;
  children?: React.ReactNode;
  onLongPress?: (e?: GestureResponderEvent) => void;
  destructive?: boolean;
};

const AnimatedButton: React.FC<ButtonProps> = ({
  title = 'Button',
  children,
  onPress,
  onLongPress,
  onPressIn: onPressInProp,
  onPressOut: onPressOutProp,
  style,
  pressableStyle,
  textStyle,
  disabled = false,
  destructive = false
}) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = (e?: GestureResponderEvent) => {
    Animated.spring(scale, {
      toValue: 0.85, 
      useNativeDriver: true,
      speed: 20,
      bounciness: 15,
    }).start();
    if (onPressInProp) onPressInProp(e);
  };

  const handlePressOut = (e?: GestureResponderEvent) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 10,  
      bounciness: 20,
    }).start();
    if (onPressOutProp) onPressOutProp(e);
  };


  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onLongPress={disabled ? undefined : onLongPress}
      onPressIn={disabled ? undefined : handlePressIn}
      onPressOut={disabled ? undefined : handlePressOut}
      pressRetentionOffset={{ top: 20, left: 20, bottom: 20, right: 20 }}
      delayLongPress={500}
      style={({ pressed }) => [
        pressableStyle 
      ]}
    >
      <Animated.View
        style={[
          styles.container,
          disabled ? styles.disabledContainer : null,
          style,
          destructive && styles.destructiveButton,
          { transform: [{ scale }],   }
        ]}
      >
        {children ? (
          children
        ) : typeof title === 'string' ? (
          <Text style={[styles.title, disabled ? styles.disabledTitle : null, textStyle, destructive && styles.destructiveText]}>
            {title}
          </Text>
        ) : (
          title
        )}

      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#141414',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
    margin: 3
  },
  disabledContainer: {
    backgroundColor: '#1e1e1e',
    opacity: 0.7,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledTitle: {
    color: '#7a7a7a',
  },
  destructiveButton: {
    backgroundColor: '#3b0b0b',
  },
  destructiveText: {
    color: '#ffb3b3',
  },
});

export default AnimatedButton;















