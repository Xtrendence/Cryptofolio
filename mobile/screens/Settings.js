import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, TouchableOpacity, View } from "react-native";

export default function Settings() {
	return (
		<View>
			<Text>Settings</Text>
			<TouchableOpacity onPress={() => switchTheme()}>
				<Text>Switch Theme</Text>
			</TouchableOpacity>
		</View>
	);

	async function switchTheme() {
		let current = await AsyncStorage.getItem("theme");
		if(current === "dark") {
			await AsyncStorage.setItem("theme", "light");
		} else {
			await AsyncStorage.setItem("theme", "dark");
		}
	}
}