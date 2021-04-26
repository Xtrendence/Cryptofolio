import React, { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationActions } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Text, TouchableOpacity, View, StyleSheet, ScrollView, Dimensions, Switch, TextInput } from "react-native";
import { ThemeContext } from "../utils/theme";
import { globalColors, globalStyles } from "../styles/global";
import { empty } from "../utils/utils";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

export default function Settings({ navigation, route }) {
	const { theme, toggleTheme } = React.useContext(ThemeContext);

	const [currency, setCurrency] = React.useState();

	const [defaultPage, setDefaultPage] = React.useState();

	const [accountMessage, setAccountMessage] = React.useState();
	const [currentPassword, setCurrentPassword] = React.useState();
	const [newPassword, setNewPassword] = React.useState();
	const [repeatPassword, setRepeatPassword] = React.useState();

	const [holdingsMessage, setHoldingsMessage] = React.useState();

	const [activityMessage, setActivityMessage] = React.useState();

	useEffect(() => {
		getSettings();
	}, []);

	return (
		<ScrollView style={[styles.page, styles[`page${theme}`]]} contentContainerStyle={{ paddingLeft:20, paddingTop:20, paddingRight:20 }} nestedScrollEnabled={true}>
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
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (defaultPage === "Activity") ? styles.inlineButtonActive : null]} onPress={() => { changeDefaultPage("Activity")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (defaultPage === "Activity") ? styles.buttonTextActive : null]}>Activity</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (defaultPage === "Settings") ? styles.inlineButtonActive : null]} onPress={() => { changeDefaultPage("Settings")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (defaultPage === "Settings") ? styles.buttonTextActive : null]}>Settings</Text>
					</TouchableOpacity>
				</View>
			</View>
			<View style={[styles.section, styles[`section${theme}`]]}>
				<Text style={[styles.header, styles[`header${theme}`]]}>Fiat Currency</Text>
				<View style={styles.container}>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (currency === "usd") ? styles.inlineButtonActive : null]} onPress={() => { changeCurrency("usd")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (currency === "usd") ? styles.buttonTextActive : null]}>USD</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (currency === "gbp") ? styles.inlineButtonActive : null]} onPress={() => { changeCurrency("gbp")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (currency === "gbp") ? styles.buttonTextActive : null]}>GBP</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (currency === "eur") ? styles.inlineButtonActive : null]} onPress={() => { changeCurrency("eur")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (currency === "eur") ? styles.buttonTextActive : null]}>EUR</Text>
					</TouchableOpacity>
				</View>
			</View>
			<View style={[styles.section, styles[`section${theme}`]]}>
				<Text style={[styles.header, styles[`header${theme}`]]}>Account</Text>
				{ !empty(accountMessage) &&
					<View style={styles.messageWrapper}>
						<Text style={styles.message}>{accountMessage}</Text>
					</View>
				}
				<TextInput style={[styles.input, styles[`input${theme}`]]} placeholder="Current Password..." placeholderTextColor={globalColors[theme].mainContrastLight} onChangeText={(value) => { setCurrentPassword(value)}} autoCapitalize="none"/>
				<TextInput style={[styles.input, styles[`input${theme}`]]} placeholder="New Password..." placeholderTextColor={globalColors[theme].mainContrastLight} onChangeText={(value) => { setNewPassword(value)}} autoCapitalize="none"/>
				<TextInput style={[styles.input, styles[`input${theme}`]]} placeholder="Repeat Password..." placeholderTextColor={globalColors[theme].mainContrastLight} onChangeText={(value) => { setRepeatPassword(value)}} autoCapitalize="none"/>
				<TouchableOpacity style={styles.button} onPress={() => { changePassword() }}>
					<Text style={styles.text}>Change Password</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.button} onPress={() => { logout() }}>
					<Text style={styles.text}>Logout</Text>
				</TouchableOpacity>
			</View>
			<View style={[styles.section, styles[`section${theme}`]]}>
				<Text style={[styles.header, styles[`header${theme}`]]}>Holdings</Text>
				{ !empty(holdingsMessage) &&
					<View style={styles.messageWrapper}>
						<Text style={styles.message}>{holdingsMessage}</Text>
					</View>
				}
				<TouchableOpacity style={styles.button} onPress={() => {  }}>
					<Text style={styles.text}>Import Holdings</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.button} onPress={() => {  }}>
					<Text style={styles.text}>Export Holdings</Text>
				</TouchableOpacity>
			</View>
			<View style={[styles.section, styles[`section${theme}`]]}>
				<Text style={[styles.header, styles[`header${theme}`]]}>Activity</Text>
				{ !empty(activityMessage) &&
					<View style={styles.messageWrapper}>
						<Text style={styles.message}>{activityMessage}</Text>
					</View>
				}
				<TouchableOpacity style={styles.button} onPress={() => {  }}>
					<Text style={styles.text}>Import Activity</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.button} onPress={() => {  }}>
					<Text style={styles.text}>Export Activity</Text>
				</TouchableOpacity>
			</View>
			<StatusBar style={theme === "Dark" ? "light" : "dark"}/>
		</ScrollView>
	);

	async function changePassword() {
		if(!empty(currentPassword) && !empty(newPassword) && !empty(repeatPassword)) {
			if(newPassword === repeatPassword) {
				let api = await AsyncStorage.getItem("api");

				let endpoint = api + "account/update.php";

				let body = { currentPassword:currentPassword, newPassword:newPassword };

				fetch(endpoint, {
					body: JSON.stringify(body),
					method: "PUT",
					headers: {
						Accept: "application/json", "Content-Type": "application/json"
					}
				})
				.then((json) => {
					return json.json();
				})
				.then(async (response) => {
					if("error" in response) {
						setAccountMessage(response.error);
					} else {
						logout();
					}
				}).catch(error => {
					console.log(error);
				});
			} else {
				setAccountMessage("Passwords don't match.");
			}
		} else {
			setAccountMessage("All three fields must be filled out.");
		}
	}

	async function logout() {
		let api = await AsyncStorage.getItem("api");
		let token = await AsyncStorage.getItem("token");

		let endpoint = api + "account/logout.php?platform=app&token=" + token;

		fetch(endpoint, {
			method: "GET",
			headers: {
				Accept: "application/json", "Content-Type": "application/json"
			}
		})
		.then((json) => {
			return json.json();
		})
		.then(async (response) => {
			navigation.navigate("Login");

			if("error" in response) {
				console.log(response);
			}
		}).catch(error => {
			console.log(error);
		});
	}

	async function changeDefaultPage(page) {
		let validPages = ["Dashboard", "Market", "Holdings", "Activity", "Settings"];
		if(empty(page) || !validPages.includes(page)) {
			setDefaultPage("Dashboard");
			await AsyncStorage.setItem("defaultPage", "Dashboard");
		} else {
			setDefaultPage(page);
			await AsyncStorage.setItem("defaultPage", page);
		}
	}

	async function changeCurrency(fiatCurrency) {
		let validCurrencies = ["usd", "gbp", "eur"];
		if(empty(fiatCurrency) || !validCurrencies.includes(fiatCurrency)) {
			setCurrency("usd");
			await AsyncStorage.setItem("currency", "usd");
		} else {
			setCurrency(fiatCurrency);
			await AsyncStorage.setItem("currency", fiatCurrency);
		}
	}

	async function getSettings() {
		let currency = await AsyncStorage.getItem("currency");
		if(empty(currency)) {
			currency = "usd";
		}
		setCurrency(currency);

		let validPages = ["Dashboard", "Market", "Holdings", "Activity", "Settings"];
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
		maxHeight:screenHeight - 190,
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
	messageWrapper: {
		backgroundColor:"rgb(230,50,50)",
		borderRadius:globalStyles.borderRadius,
		width:200,
		padding:10,
		marginBottom:20,
	},
	message: {
		color:globalColors["Light"].accentContrast,
		fontSize:16,
		fontFamily:globalStyles.fontFamily,
		lineHeight:25,
	},
	button: {
		marginBottom:20,
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
	input: {
		backgroundColor:globalColors["Light"].mainFirst,
		color:globalColors["Light"].mainContrast,
		paddingLeft:10,
		paddingRight:10,
		width:200,
		height:40,
		marginBottom:20,
		borderRadius:globalStyles.borderRadius,
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
	},
	inputDark: {
		backgroundColor:globalColors["Dark"].mainThird,
		color:globalColors["Dark"].mainContrast
	},
});