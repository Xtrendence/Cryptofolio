import React, { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationActions } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Text, TouchableOpacity, View, StyleSheet, ScrollView, Dimensions, Switch } from "react-native";
import { ThemeContext } from "../utils/theme";
import { globalColors, globalStyles } from "../styles/global";
import { empty } from "../utils/utils";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

export default function Settings({ navigation, route }) {
	const { theme, toggleTheme } = React.useContext(ThemeContext);

	const [defaultPage, setDefaultPage] = React.useState();

	useEffect(() => {
		getSettings();
	}, []);

	return (
		<ScrollView style={[styles.page, styles[`page${theme}`]]} contentContainerStyle={{ padding:20 }} nestedScrollEnabled={true}>
			<View style={[styles.section, styles[`section${theme}`]]}>
				<Text style={[styles.header, styles[`header${theme}`]]}>Appearance</Text>
				<View style={styles.container}>
					<Text style={[styles.containerText, styles[`containerText${theme}`]]}>Theme</Text>
					<Switch trackColor={{ false:globalColors["Dark"].mainFifth, true:globalColors["Light"].accentFirst }} thumbColor={theme === "Dark" ? globalColors["Dark"].accentFirst : globalColors["Light"].mainFirst} onValueChange={() => switchTheme()} value={theme !== "Dark"}/>
				</View>
			</View>
			<View style={[styles.section, styles[`section${theme}`]]}>
				<Text style={[styles.header, styles[`header${theme}`]]}>Default Page</Text>
				<View style={styles.container}>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (defaultPage === "Dashboard") ? styles.inlineButtonActive : null]} onPress={() => { changeDefaultPage("Dashboard")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (defaultPage === "Dashboard") ? styles.buttonTextActive : null]}>Dashboard</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (defaultPage === "Market") ? styles.inlineButtonActive : null]} onPress={() => { changeDefaultPage("Market")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (defaultPage === "Market") ? styles.buttonTextActive : null]}>Market</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (defaultPage === "Holdings") ? styles.inlineButtonActive : null]} onPress={() => { changeDefaultPage("Holdings")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (defaultPage === "Holdings") ? styles.buttonTextActive : null]}>Holdings</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (defaultPage === "Settings") ? styles.inlineButtonActive : null]} onPress={() => { changeDefaultPage("Settings")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (defaultPage === "Settings") ? styles.buttonTextActive : null]}>Settings</Text>
					</TouchableOpacity>
				</View>
			</View>
			<StatusBar style={theme === "Dark" ? "light" : "dark"}/>
		</ScrollView>
	);

	async function changeDefaultPage(page) {
		let validPages = ["Dashboard", "Market", "Holdings", "Settings"];
		if(empty(page) || !validPages.includes(page)) {
			setDefaultPage("Dashboard");
			await AsyncStorage.setItem("defaultPage", "Dashboard");
		} else {
			setDefaultPage(page);
			await AsyncStorage.setItem("defaultPage", page);
		}
	}

	async function getSettings() {
		let validPages = ["Dashboard", "Market", "Holdings", "Settings"];
		let page = await AsyncStorage.getItem("defaultPage");
		if(empty(page) || !validPages.includes(page)) {
			setDefaultPage("Dashboard");
			await AsyncStorage.setItem("defaultPage", "Dashboard");
		} else {
			setDefaultPage(page);
		}
	}

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
		marginBottom:20
	},
	sectionDark: {
		backgroundColor:globalColors["Dark"].mainFirst
	},
	container: {
		flexDirection:"row",
		flexWrap:"wrap",
		justifyContent:"center"
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
	},
	inlineButton: {
		alignItems:"center",
		justifyContent:"center",
		borderRadius:globalStyles.borderRadius,
		padding:10,
		margin:10,
		backgroundColor:globalColors["Light"].mainThird
	},
	inlineButtonDark: {
		backgroundColor:globalColors["Dark"].mainThird
	},
	inlineButtonActive: {
		backgroundColor:globalColors["Light"].accentFirst
	},
	buttonText: {
		fontFamily:globalStyles.fontFamily,
		fontSize:16,
		fontWeight:"bold",
		paddingBottom:2,
		color:globalColors["Light"].mainContrastLight
	},
	buttonTextDark: {
		color:globalColors["Dark"].mainContrastLight
	},
	buttonTextActive: {
		color:globalColors["Light"].accentContrast
	},
});