import React from "react";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { ThemeContext } from "../utils/theme";

export default function Holdings() {
	const { theme, toggleTheme } = React.useContext(ThemeContext);

	return (
		<View>
			<Text>Holdings</Text>
			<StatusBar style={theme === "Dark" ? "light" : "dark"}/>
		</View>
	);
}