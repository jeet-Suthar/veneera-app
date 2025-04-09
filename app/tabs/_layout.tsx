import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme, View, StyleSheet, Pressable } from "react-native";
import { Colors } from "../utils/theme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          
          if (route.name === "HomeScreen") iconName = focused ? "home" : "home-outline";
          else if (route.name === "ManageScreen") iconName = focused ? "list" : "list-outline";
          else if (route.name === "AddPatientScreen") iconName = "add";
          else if (route.name === "SettingsScreen") iconName = focused ? "settings" : "settings-outline";
          else if (route.name === "ProfileScreen") iconName = focused ? "person" : "person-outline";
          else iconName = "help-circle";

          // Special case for center button
          if (route.name === "AddPatientScreen") {
            return (
              <View style={styles.addButtonWrapper}>
                <View style={[styles.addButtonContainer, { backgroundColor: theme.primary }]}>
                  <Ionicons name={iconName} size={24} color="white" />
                </View>
              </View>
            );
          }

          return (
            <View style={styles.tabIconContainer}>
              <Ionicons name={iconName} size={24} color={color} />
              {focused && <View style={[styles.activeIndicator, { backgroundColor: color }]} />}
            </View>
          );
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarShowLabel: false,
        tabBarStyle: { 
          backgroundColor: theme.surface,
          height: 64,
          borderTopWidth: 0,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          position: 'absolute',
        },
        tabBarItemStyle: {
          paddingVertical: 12,
        },
        tabBarButton: (props) => (
          <Pressable
            {...props}
            android_ripple={{ color: 'transparent' }}
            android_disableSound={true}
            style={props.style}
          />
        ),
      })}
    >
      <Tabs.Screen name="HomeScreen" />
      <Tabs.Screen name="ManageScreen" />
      <Tabs.Screen
        name="AddPatientScreen"
        options={{
          tabBarItemStyle: {
            height: 64,
          }
        }}
      />
      <Tabs.Screen name="SettingsScreen" />
      <Tabs.Screen name="ProfileScreen" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 40,
  },
  activeIndicator: {
    height: 3,
    width: 16,
    borderRadius: 1.5,
    position: 'absolute',
    bottom: -6,
  },
  addButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -12,
  },
  addButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  }
});

