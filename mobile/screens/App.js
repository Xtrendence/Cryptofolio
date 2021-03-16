import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
	return (
		<View style={styles.container}>
			<Text>Cryptofolio</Text>
			<StatusBar style="dark" />
		</View>
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
