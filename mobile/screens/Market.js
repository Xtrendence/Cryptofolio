import React from "react";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { ThemeContext } from "../utils/theme";

export default function Market() {
	const { theme, toggleTheme } = React.useContext(ThemeContext);

	return (
		<View>
			<Text>Market</Text>
			<StatusBar style={theme === "Dark" ? "light" : "dark"}/>
		</View>
	);
}