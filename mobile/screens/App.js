import "react-native-gesture-handler";
import FlashMessage from "react-native-flash-message";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import BottomBar from "../components/BottomBar";
import TopBar from "../components/TopBar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../screens/Login";
import Dashboard from "../screens/Dashboard";
import Market from "../screens/Market";
import Holdings from "../screens/Holdings";
import Settings from "../screens/Settings";
import { globalColorsLight, getColors } from "../styles/global";
import { rgbToHex } from "../utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

function navigate(name, params) {
	navigationRef.current?.navigate(name, params);
}

export default function App() {
	const navigationRef = React.createRef();
	const routeNameRef = React.createRef();

	const [active, setActive] = React.useState("Login");
	const [theme, setTheme] = React.useState("light");
	const [colors, setColors] = React.useState(getColors(theme));

	useEffect(() => {
		AsyncStorage.getItem("theme").then(result => {
			if(result === "dark") {
				setTheme("dark");
				setColors(getColors("dark"));
				changeNavigationBarColor(rgbToHex(getColors("dark").mainThird), false);
			} else {
				setTheme("light");
				setColors(getColors("light"));
				changeNavigationBarColor(rgbToHex(getColors("light").mainThird), true);
			}
		}).catch(error => {
			setTheme("light");
			setColors(getColors("light"));
			console.log(error);
		});
	}, []);

	return (
		<NavigationContainer ref={navigationRef} onStateChange={() => checkState()} onReady={() =>
			(routeNameRef.current = navigationRef.current.getCurrentRoute().name)}>
			{ active !== "Login" && 
				<TopBar title={active} colors={colors}></TopBar>
			}
			<Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown:false }}>
				<Stack.Screen name="Login">
					{ () => <Login colors={colors} setActive={setActive}></Login> }
				</Stack.Screen>
				<Stack.Screen name="Dashboard" component={Dashboard} options={horizontalAnimation}></Stack.Screen>
				<Stack.Screen name="Market" component={Market} options={horizontalAnimation}></Stack.Screen>	
				<Stack.Screen name="Holdings" component={Holdings} options={horizontalAnimation}></Stack.Screen>
				<Stack.Screen name="Settings" component={Settings} options={horizontalAnimation}></Stack.Screen>
			</Stack.Navigator>
			{ active !== "Login" && 
				<BottomBar navigation={navigationRef} screen={{ active:active, setActive:setActive }} colors={colors} setColors={setColors} theme={theme} setTheme={setTheme}></BottomBar>
			}
			<FlashMessage position="top" hideStatusBar={true}/>
			<StatusBar style={theme === "dark" ? "light" : "dark"}/>
		</NavigationContainer>
	);

	function checkState() {
		let currentRouteName = navigationRef.current.getCurrentRoute().name;

		setActive(currentRouteName);
	}
}