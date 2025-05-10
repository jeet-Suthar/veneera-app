import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
  Easing,
} from 'react-native';
import { Colors } from '../../utils/theme';
import { useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

type AlertType = 'info' | 'success' | 'error' | 'warning' | 'question';

export type AlertButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

type AlertDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  buttons?: AlertButton[];
  type?: AlertType;
  onDismiss?: () => void;
};

export function AlertDialog({
  visible,
  title,
  message,
  buttons = [{ text: 'OK', style: 'default' }],
  type = 'info',
  onDismiss,
}: AlertDialogProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [animation] = React.useState(new Animated.Value(0));

  // Get icon and color based on type
  const alertConfig = {
    info: { icon: 'information-outline', color: theme.primary },
    success: { icon: 'check-circle-outline', color: '#4CAF50' },
    error: { icon: 'alert-circle-outline', color: '#F44336' },
    warning: { icon: 'alert-outline', color: '#FF9800' },
    question: { icon: 'help-circle-outline', color: theme.primary },
  };

  const { icon, color } = alertConfig[type];

  React.useEffect(() => {
    if (visible) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, animation]);

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onDismiss}>
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay}>
          <BlurView 
            intensity={colorScheme === 'dark' ? 80 : 50} 
            tint={colorScheme === 'dark' ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill} 
          />
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.container,
                { backgroundColor: theme.surface, transform: [{ scale }], opacity },
              ]}
            >
              <View style={styles.iconContainer}>
                <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
                  <MaterialCommunityIcons name={icon as any} size={28} color={color} />
                </View>
              </View>
              
              <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
              <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
              
              <View style={styles.buttonContainer}>
                {buttons.map((button, index) => {
                  let buttonStyle;
                  let textColor;

                  switch (button.style) {
                    case 'destructive':
                      buttonStyle = { backgroundColor: '#FF4D4F20' };
                      textColor = 'rgba(255, 77, 79, 0.8)';
                      break;
                    case 'cancel':
                      buttonStyle = { backgroundColor: theme.secondary };
                      textColor = theme.text;
                      break;
                    default:
                      buttonStyle = { backgroundColor: theme.primary + '20' };
                      textColor = 'white';
                  }

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.button,
                        buttonStyle,
                        index !== buttons.length - 1 && styles.buttonMargin,
                      ]}
                      onPress={() => {
                        button.onPress && button.onPress();
                        onDismiss && onDismiss();
                      }}
                    >
                      <Text style={[styles.buttonText, { color: textColor }]}>{button.text}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: width * 0.85,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 8,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonMargin: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 