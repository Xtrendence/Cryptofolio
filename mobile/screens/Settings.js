import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationActions } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Text, TouchableOpacity, View, StyleSheet, ScrollView, Dimensions, Switch } from "react-native";
import { ThemeContext } from "../utils/theme";
import { globalColors, globalStyles } from "../styles/global";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

export default function Settings({ navigation, route }) {
	const { theme, toggleTheme } = React.useContext(ThemeContext);

	return (
		<ScrollView style={[styles.page, styles[`page${theme}`]]} contentContainerStyle={{ padding:20 }} nestedScrollEnabled={true}>
			<View style={[styles.section, styles[`section${theme}`]]}>
				<Text style={[styles.header, styles[`header${theme}`]]}>Appearance</Text>
				<View style={styles.container}>
					<Text style={[styles.containerText, styles[`containerText${theme}`]]}>Theme</Text>
					<Switch trackColor={{ false:globalColors["Dark"].mainFifth, true:globalColors["Light"].accentFirst }} thumbColor={theme === "Dark" ? globalColors["Dark"].accentFirst : globalColors["Light"].mainFirst} onValueChange={() => switchTheme()} value={theme !== "Dark"}/>
				</View>
			</View>
			<StatusBar style={theme === "Dark" ? "light" : "dark"}/>
		</ScrollView>
	);

	function switchTheme() {
		toggleTheme();
	}
}

const styles = StyleSheet.create({
	page: {
		maxHeight:screenHeight - 180,
		backgroundColor:globalColors["Light"].mainSecond
	},
	pageDark: {
		backgroundColor:globalColors["Dark"].mainSecond
	},
	section: {
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
		borderRadius:globalStyles.borderRadius,
		backgroundColor:globalColors["Light"].mainFirst,
		width:"100%",
		alignItems:"center",
		padding:20,
	},
	sectionDark: {
		backgroundColor:globalColors["Dark"].mainFirst
	},
	container: {
		flexDirection:"row"
	},
	containerText: {
		fontSize:16,
		color:globalColors["Light"].mainContrast,
		fontFamily:globalStyles.fontFamily,
		marginRight:4,
		paddingTop:1,
	},
	containerTextDark: {
		color:globalColors["Dark"].mainContrast,
	},
	header: {
		fontSize:18,
		fontWeight:"bold",
		color:globalColors["Light"].mainContrast,
		fontFamily:globalStyles.fontFamily,
		marginBottom:20,
	},
	headerDark: {
		color:globalColors["Dark"].mainContrast
	},
	button: {
		height:40,
		width:200,
		alignItems:"center",
		justifyContent:"center",
		borderRadius:globalStyles.borderRadius,
		backgroundColor:globalColors["Light"].accentFirst
	},
	text: {
		lineHeight:38,
		fontFamily:globalStyles.fontFamily,
		fontSize:18,
		paddingBottom:2,
		color:globalColors["Light"].accentContrast
	}
});