import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import BottomBar from "../components/BottomBar";
import TopBar from "../components/TopBar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../screens/Login";
import Dashboard from "../screens/Dashboard";
import Market from "../screens/Market";
import Holdings from "../screens/Holdings";
import Settings from "../screens/Settings";

const Stack = createStackNavigator();

const horizontalAnimation = {
	gestureDirection:"horizontal",
	cardStyleInterpolator: ({ current, layouts }) => {
		return {
			cardStyle: {
				transform: [{
					translateX:current.progress.interpolate({
						inputRange:[0, 1],
						outputRange:[layouts.screen.width, 0],
					}),
				}],
			}
		};
	},
};

const navigationRef = React.createRef();

function navigate(name, params) {
	navigationRef.current?.navigate(name, params);
}

export default function App() {
	return (
		<NavigationContainer ref={navigationRef}>
			<TopBar title="Login"></TopBar>
			<Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown:false }}>
				<Stack.Screen name="Login" component={Login}></Stack.Screen>
				<Stack.Screen name="Dashboard" component={Dashboard} options={horizontalAnimation}></Stack.Screen>	
				<Stack.Screen name="Market" component={Market} options={horizontalAnimation}></Stack.Screen>	
				<Stack.Screen name="Holdings" component={Holdings} options={horizontalAnimation}></Stack.Screen>	
				<Stack.Screen name="Settings" component={Settings} options={horizontalAnimation}></Stack.Screen>	
			</Stack.Navigator>
			<BottomBar navigation={navigationRef}></BottomBar>
			<StatusBar style="dark"/>
		</NavigationContainer>
	);
}

const styles = StyleSheet.create({
	container: {
		flex:1,
		backgroundColor:"rgb(240,240,240)",
		alignItems:"center",
		justifyContent:"center",
	},
});
