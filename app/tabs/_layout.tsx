import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme, View, StyleSheet } from "react-native";
import { Colors } from "../utils/theme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, focused }) => {
          let iconName: any;
          let size = 24;
          
          if (route.name === "HomeScreen") iconName = focused ? "home" : "home-outline";
          else if (route.name === "ManageScreen") iconName = focused ? "list" : "list-outline";
          else if (route.name === "AddPatientScreen") iconName = "add";
          else if (route.name === "SettingsScreen") iconName = focused ? "settings" : "settings-outline";
          else if (route.name === "ProfileScreen") iconName = focused ? "person" : "person-outline";

          return (
            <View style={[
              styles.iconContainer,
              route.name === "AddPatientScreen" && styles.addButtonContainer
            ]}>
              <Ionicons name={iconName} size={route.name === "AddPatientScreen" ? 32 : size} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarShowLabel: false,
        tabBarStyle: { 
          backgroundColor: theme.surface,
          height: 70,
          borderTopWidth: 0,
          elevation: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
          ...styles.shadow
        },
        tabBarItemStyle: {
          paddingVertical: 10,
        },
      })}
    >
      <Tabs.Screen name="HomeScreen" />
      <Tabs.Screen name="ManageScreen" />
      <Tabs.Screen
        name="AddPatientScreen"
        options={{
          tabBarItemStyle: {
            height: 70,
            marginTop: -20,
          }
        }}
      />
      <Tabs.Screen name="SettingsScreen" />
      <Tabs.Screen name="ProfileScreen" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4D8EFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#4D8EFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  }
});
