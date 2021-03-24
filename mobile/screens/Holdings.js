import React from "react";
import { StatusBar } from "expo-status-bar";
import { Text, View, StyleSheet, Dimensions } from "react-native";
import { ThemeContext } from "../utils/theme";
import { globalColors, globalStyles } from "../styles/global";
import { empty, separateThousands, abbreviateNumber, epoch } from "../utils/utils";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

export default function Holdings() {
	const { theme, toggleTheme } = React.useContext(ThemeContext);

	return (
		<View style={[styles.page, styles[`page${theme}`]]}>
			<StatusBar style={theme === "Dark" ? "light" : "dark"}/>
		</View>
	);
}

const styles = StyleSheet.create({
	page: {
		height:screenHeight - 180,
		backgroundColor:globalColors["Light"].mainSecond,
		padding:20,
	},
	pageDark: {
		backgroundColor:globalColors["Dark"].mainSecond
	},
});