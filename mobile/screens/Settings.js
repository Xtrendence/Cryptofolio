import React, { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationActions } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Text, TouchableOpacity, View, StyleSheet, ScrollView, Dimensions, Switch, TextInput, Linking, ToastAndroid } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import DocumentPicker from "react-native-document-picker";
import * as RNFS from "react-native-fs";
import { ThemeContext } from "../utils/theme";
import { globalColors, globalStyles } from "../styles/global";
import { empty } from "../utils/utils";
import { importData } from "../utils/requests";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

export default function Settings({ navigation, route }) {
	const { theme, toggleTheme } = React.useContext(ThemeContext);

	const [currency, setCurrency] = React.useState();

	const [transactionsAffectHoldings, setTransactionsAffectHoldings] = React.useState();

	const [defaultPage, setDefaultPage] = React.useState();

	const [accountMessage, setAccountMessage] = React.useState();
	const [currentPassword, setCurrentPassword] = React.useState();
	const [newPassword, setNewPassword] = React.useState();
	const [repeatPassword, setRepeatPassword] = React.useState();

	useEffect(() => {
		getSettings();

		navigation.addListener("focus", () => {
			if(navigation.isFocused()) {
				getSettings();
			}
		});
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
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (currency === "chf") ? styles.inlineButtonActive : null]} onPress={() => { changeCurrency("chf")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (currency === "chf") ? styles.buttonTextActive : null]}>CHF</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (currency === "aud") ? styles.inlineButtonActive : null]} onPress={() => { changeCurrency("aud")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (currency === "aud") ? styles.buttonTextActive : null]}>AUD</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (currency === "jpy") ? styles.inlineButtonActive : null]} onPress={() => { changeCurrency("jpy")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (currency === "jpy") ? styles.buttonTextActive : null]}>JPY</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (currency === "cad") ? styles.inlineButtonActive : null]} onPress={() => { changeCurrency("cad")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (currency === "cad") ? styles.buttonTextActive : null]}>CAD</Text>
					</TouchableOpacity>
				</View>
			</View>
			<View style={[styles.section, styles[`section${theme}`]]}>
				<Text style={[styles.header, styles[`header${theme}`]]}>Transactions Affect Holdings</Text>
				<View style={styles.container}>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (transactionsAffectHoldings === "disabled") ? styles.inlineButtonActive : null]} onPress={() => { changeTransactionsAffectHoldings("disabled")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (transactionsAffectHoldings === "disabled") ? styles.buttonTextActive : null]}>Disabled</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (transactionsAffectHoldings === "mixed") ? styles.inlineButtonActive : null]} onPress={() => { changeTransactionsAffectHoldings("mixed")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (transactionsAffectHoldings === "mixed") ? styles.buttonTextActive : null]}>Mixed</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (transactionsAffectHoldings === "override") ? styles.inlineButtonActive : null]} onPress={() => { changeTransactionsAffectHoldings("override")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (transactionsAffectHoldings === "override") ? styles.buttonTextActive : null]}>Override</Text>
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
				<TouchableOpacity style={styles.button} onPress={() => { readData("holdings") }}>
					<Text style={styles.text}>Import Holdings</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.button} onPress={() => { exportData("holdings") }}>
					<Text style={styles.text}>Export Holdings</Text>
				</TouchableOpacity>
			</View>
			<View style={[styles.section, styles[`section${theme}`]]}>
				<Text style={[styles.header, styles[`header${theme}`]]}>Activity</Text>
				<TouchableOpacity style={styles.button} onPress={() => { readData("activity") }}>
					<Text style={styles.text}>Import Activity</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.button} onPress={() => { exportData("activity") }}>
					<Text style={styles.text}>Export Activity</Text>
				</TouchableOpacity>
			</View>
			<View style={[styles.section, styles[`section${theme}`]]}>
				<Text style={[styles.header, styles[`header${theme}`]]}>Donate</Text>
				<View style={[styles.sectionDescriptionWrapper, styles[`sectionDescriptionWrapper${theme}`]]}>
					<Text style={[styles.sectionDescription, styles[`sectionDescription${theme}`]]}>If you'd like to donate, then please feel free to do so, it'd be much appreciated. However, I don't want you to feel obliged to do so, and there are no perks for it. If you decide to donate, please contact me afterwards so I can actually thank you, and I'd love to hear about any ideas you may have for Cryptofolio. If they're within the scope of the project, I'll probably implement them.</Text>
				</View>
				<View style={styles.container}>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`]]} onPress={() => { copyAddress("ADA")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`]]}>ADA</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`]]} onPress={() => { copyAddress("XMR")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`]]}>XMR</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`]]} onPress={() => { copyAddress("ETH")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`]]}>ETH</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`]]} onPress={() => { copyAddress("BCH")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`]]}>BCH</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`]]} onPress={() => { copyAddress("BTC")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`]]}>BTC</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`]]} onPress={() => { copyAddress("LTC")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`]]}>LTC</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`]]} onPress={() => { copyAddress("NANO")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`]]}>NANO</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`]]} onPress={() => { copyAddress("DOT")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`]]}>DOT</Text>
					</TouchableOpacity>
				</View>
			</View>
			<StatusBar style={theme === "Dark" ? "light" : "dark"}/>
		</ScrollView>
	);

	function copyAddress(address) {
		let addresses = {
			ADA: "addr1qyh9ejp2z7drzy8vzpyfeuvzuej5t5tnmjyfpfjn0vt722zqupdg44rqfw9fd8jruaez30fg9fxl34vdnncc33zqwhlqn37lz4",
			XMR: "49wDQf83p5tHibw9ay6fBvcv48GJynyjVE2V8EX8Vrtt89rPyECRm5zbBqng3udqrYHTjsZStSpnMCa8JRw7cfyGJwMPxDM",
			ETH: "0x40E1452025d7bFFDfa05d64C2d20Fb87c2b9C0be",
			BCH: "qrvyd467djuxtw5knjt3d50mqzspcf6phydmyl8ka0",
			BTC: "bc1qdy5544m2pwpyr6rhzcqwmerczw7e2ytjjc2wvj",
			LTC: "ltc1qq0ptdjsuvhw6gz9m4huwmhq40gpyljwn5hncxz",
			NANO: "nano_3ed4ip7cjkzkrzh9crgcdipwkp3h49cudxxz4t8x7pkb8rad7bckqfhzyadg",
			DOT: "12nGqTQsgEHwkAuHGNXpvzcfgtQkTeo3WCZgwrXLsiqs3KyA"
		};

		Clipboard.setString(addresses[address]);

		ToastAndroid.showWithGravity("Copied " + address + " address to clipboard.", ToastAndroid.LONG, ToastAndroid.BOTTOM);
	}

	async function readData(type) {
		DocumentPicker.pick({ type:"text/csv", copyTo:"cachesDirectory" }).then(result => {
			RNFS.readFile(result.fileCopyUri, "ascii").then(data => {
				if(type === "holdings") {
					importHoldings(data);
				} else if(type === "activity") {
					importActivity(data);
				}
			}).catch(error => {
				console.log(error);
			});
		}).catch(error => {
			ToastAndroid.showWithGravity("Couldn't open the file picker, or no file was selected...", ToastAndroid.LONG, ToastAndroid.BOTTOM);
			console.log(error);
		});
	}

	async function importHoldings(data) {
		let rows = data.split(/\r?\n/);
		if(rows[0] === "id,symbol,amount") {
			let formatted = [];
			rows.map(row => {
				if(!empty(row) && !row.toLowerCase().includes("symbol,")) {
					formatted.push(row);
				}
			});
			importData("holdings", formatted).then(result => {
				ToastAndroid.showWithGravity(result, ToastAndroid.LONG, ToastAndroid.BOTTOM);
			}).catch(error => {
				ToastAndroid.showWithGravity(error, ToastAndroid.LONG, ToastAndroid.BOTTOM);
			});
		} else {
			ToastAndroid.showWithGravity("Invalid column order. Expected: id, symbol, amount. Make sure to include the header row as well.", ToastAndroid.LONG, ToastAndroid.BOTTOM);
		}
	}

	async function importActivity(data) {
		let rows = data.split(/\r?\n/);
		if(rows[0].includes("id,symbol,date,type,amount,fee,notes,exchange,pair,price,from,to")) {
			let formatted = [];
			rows.map(row => {
				if(!empty(row) && !row.toLowerCase().includes("symbol,")) {
					if(rows[0].includes("txID")) {
						formatted.push(row);
					} else {
						formatted.push("-," + row);
					}
				}
			});
			importData("activity", formatted).then(result => {
				ToastAndroid.showWithGravity(result, ToastAndroid.LONG, ToastAndroid.BOTTOM);
			}).catch(error => {
				ToastAndroid.showWithGravity(error, ToastAndroid.LONG, ToastAndroid.BOTTOM);
			});
		} else {
			ToastAndroid.showWithGravity("Invalid column order. Expected: id, symbol, date, type, amount, fee, notes, exchange, pair, price, from, to. Make sure to include the header row as well.", ToastAndroid.LONG, ToastAndroid.BOTTOM);
		}
	}

	async function exportData(type) {
		let api = await AsyncStorage.getItem("api");
		let token = await AsyncStorage.getItem("token");
		let endpoint = api + "holdings/export.php?token=" + token;

		if(type === "activity") {
			endpoint = api + "activity/export.php?token=" + token;
		}

		Linking.openURL(endpoint).catch(error => {
			ToastAndroid.showWithGravity("Couldn't open the browser...", ToastAndroid.LONG, ToastAndroid.BOTTOM);
			console.log(error);
		});
	}

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
						await AsyncStorage.removeItem("token");
						navigation.navigate("Login");
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
		let validCurrencies = ["usd", "gbp", "eur", "chf", "aud", "jpy", "cad"];
		if(empty(fiatCurrency) || !validCurrencies.includes(fiatCurrency)) {
			setCurrency("usd");
			await AsyncStorage.setItem("currency", "usd");
		} else {
			setCurrency(fiatCurrency);
			await AsyncStorage.setItem("currency", fiatCurrency);
		}
	}

	async function changeTransactionsAffectHoldings(transactionsAffectHoldings) {
		let validOptions = ["disabled", "mixed", "override"];
		if(empty(transactionsAffectHoldings) || !validOptions.includes(transactionsAffectHoldings)) {
			setTransactionsAffectHoldings("disabled");
			await AsyncStorage.setItem("transactionsAffectHoldings", "disabled");
		} else {
			setTransactionsAffectHoldings(transactionsAffectHoldings);
			await AsyncStorage.setItem("transactionsAffectHoldings", transactionsAffectHoldings);
		}
	}

	async function getSettings() {
		let currency = await AsyncStorage.getItem("currency");
		if(empty(currency)) {
			currency = "usd";
		}
		setCurrency(currency);

		let transactionsAffectHoldings = await AsyncStorage.getItem("transactionsAffectHoldings");
		if(empty(transactionsAffectHoldings)) {
			transactionsAffectHoldings = "disabled";
		}
		setTransactionsAffectHoldings(transactionsAffectHoldings);

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
	sectionDescriptionWrapper: {
		alignSelf:"center",
		backgroundColor:globalColors["Light"].mainThird,
		borderRadius:globalStyles.borderRadius,
		width:screenWidth - 120,
		alignItems:"center",
		padding:10,
		marginBottom:10,
	},
	sectionDescriptionWrapperDark: {
		backgroundColor:globalColors["Dark"].mainThird,
	},
	sectionDescription: {
		color:globalColors["Light"].mainContrast,
		fontSize:16,
		fontFamily:globalStyles.fontFamily,
		lineHeight:25,
	},
	sectionDescriptionDark: {
		color:globalColors["Dark"].mainContrast
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