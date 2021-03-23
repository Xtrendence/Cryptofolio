import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, TouchableOpacity, View } from "react-native";

export default function Settings({ navigation, route }) {
	return (
		<View>
			<Text>Settings</Text>
			<TouchableOpacity onPress={() => toggleTheme()}>
				<Text>Switch Theme</Text>
			</TouchableOpacity>
		</View>
	);

	async function toggleTheme() {
		if(route.params.theme === "dark") {
			await AsyncStorage.setItem("theme", "light");
		} else {
			await AsyncStorage.setItem("theme", "dark");
		}
	}
}