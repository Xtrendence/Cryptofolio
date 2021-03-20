import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { globalColorsLight, globalColorsDark, globalStyles } from "../styles/global";

let globalColors = globalColorsLight;

export default function Dashboard() {
	return (
		<View style={styles.page}>
			<Text>Dashboard</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	page: {
		flex:1,
		backgroundColor:globalColors.mainSecond
	}
});