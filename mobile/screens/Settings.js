import React, { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationActions } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Text, TouchableOpacity, View, StyleSheet, ScrollView, Dimensions, Switch, TextInput, Linking, ToastAndroid, Modal } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import DocumentPicker from "react-native-document-picker";
import * as RNFS from "react-native-fs";
import NoAPI from "../utils/api";
import { ThemeContext } from "../utils/theme";
import { globalColors, globalStyles } from "../styles/global";
import { empty, validJSON } from "../utils/utils";
import { importData, getCoinID, getETHAddressBalance, addHolding, updateHolding } from "../utils/requests";
import styles from "../styles/Settings";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

export default function Settings({ navigation, route }) {
	const { theme, toggleTheme } = React.useContext(ThemeContext);

	const [modal, setModal] = React.useState(false);

	const [noAPIMode, setNoAPIMode] = React.useState(false);

	const [currency, setCurrency] = React.useState();

	const [transactionsAffectHoldings, setTransactionsAffectHoldings] = React.useState();

	const [dashboardWatchlist, setDashboardWatchlist] = React.useState();

	const [additionalDashboardColumns, setAdditionalDashboardColumns] = React.useState();

	const [dashboardMarketSorting, setDashboardMarketSorting] = React.useState();
	const [dashboardMarketSortOrder, setDashboardMarketSortOrder] = React.useState();
	const [dashboardHoldingsSorting, setDashboardHoldingsSorting] = React.useState();
	const [dashboardHoldingsSortOrder, setDashboardHoldingsSortOrder] = React.useState();

	const [highlightPriceChange, setHighlightPriceChange] = React.useState();

	const [defaultPage, setDefaultPage] = React.useState();

	const [ethAddress, setEthAddress] = React.useState();
	const [importTokens, setImportTokens] = React.useState();

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
			<Modal animationType="fade" visible={modal} onRequestClose={() => { hideModal()}} transparent={false}>
				<View style={[styles.modalWrapper, styles[`modalWrapper${theme}`]]}>
					<View stlye={[styles.modal, styles[`modal${theme}`]]}>
						<View style={[styles.buttonWrapper, styles.buttonWrapperCenter]}>
							<TouchableOpacity style={[styles.button, styles.buttonDelete]} onPress={() => { clearNoAPIData()}}>
								<Text style={styles.text}>Delete No-API Data</Text>
							</TouchableOpacity>
							<TouchableOpacity style={[styles.button, styles[`button${theme}`], styles.buttonCancel]} onPress={() => { hideModal()}}>
								<Text style={styles.text}>Cancel</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
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
				<Text style={[styles.header, styles[`header${theme}`]]}>Dashboard Watchlist</Text>
				<View style={styles.container}>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (dashboardWatchlist === "disabled") ? styles.inlineButtonActive : null]} onPress={() => { changeDashboardWatchlist("disabled")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (dashboardWatchlist === "disabled") ? styles.buttonTextActive : null]}>Disabled</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (dashboardWatchlist === "enabled") ? styles.inlineButtonActive : null]} onPress={() => { changeDashboardWatchlist("enabled")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (dashboardWatchlist === "enabled") ? styles.buttonTextActive : null]}>Enabled</Text>
					</TouchableOpacity>
				</View>
			</View>
			<View style={[styles.section, styles[`section${theme}`]]}>
				<Text style={[styles.header, styles[`header${theme}`]]}>Additional Dashboard Columns</Text>
				<View style={styles.container}>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (additionalDashboardColumns === "disabled") ? styles.inlineButtonActive : null]} onPress={() => { changeAdditionalDashboardColumns("disabled")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (additionalDashboardColumns === "disabled") ? styles.buttonTextActive : null]}>Disabled</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (additionalDashboardColumns === "enabled") ? styles.inlineButtonActive : null]} onPress={() => { changeAdditionalDashboardColumns("enabled")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (additionalDashboardColumns === "enabled") ? styles.buttonTextActive : null]}>Enabled</Text>
					</TouchableOpacity>
				</View>
			</View>
			<View style={[styles.section, styles[`section${theme}`]]}>
				<Text style={[styles.header, styles[`header${theme}`]]}>Dashboard Market Sorting</Text>
				<View style={styles.container}>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (dashboardMarketSorting === "coin") ? styles.inlineButtonActive : null]} onPress={() => { changeDashboardMarketSorting("coin")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (dashboardMarketSorting === "coin") ? styles.buttonTextActive : null]}>Coin</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (dashboardMarketSorting === "price") ? styles.inlineButtonActive : null]} onPress={() => { changeDashboardMarketSorting("price")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (dashboardMarketSorting === "price") ? styles.buttonTextActive : null]}>Price</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (dashboardMarketSorting === "marketCap") ? styles.inlineButtonActive : null]} onPress={() => { changeDashboardMarketSorting("marketCap")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (dashboardMarketSorting === "marketCap") ? styles.buttonTextActive : null]}>Market Cap</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (dashboardMarketSorting === "change") ? styles.inlineButtonActive : null]} onPress={() => { changeDashboardMarketSorting("change")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (dashboardMarketSorting === "change") ? styles.buttonTextActive : null]}>Change</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.container}>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (dashboardMarketSortOrder === "descending") ? styles.inlineButtonActive : null]} onPress={() => { changeDashboardMarketSortOrder("descending")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (dashboardMarketSortOrder === "descending") ? styles.buttonTextActive : null]}>Descending</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (dashboardMarketSortOrder === "ascending") ? styles.inlineButtonActive : null]} onPress={() => { changeDashboardMarketSortOrder("ascending")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (dashboardMarketSortOrder === "ascending") ? styles.buttonTextActive : null]}>Ascending</Text>
					</TouchableOpacity>
				</View>
			</View>
			<View style={[styles.section, styles[`section${theme}`]]}>
				<Text style={[styles.header, styles[`header${theme}`]]}>Dashboard Holdings Sorting</Text>
				<View style={styles.container}>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (dashboardHoldingsSorting === "coin") ? styles.inlineButtonActive : null]} onPress={() => { changeDashboardHoldingsSorting("coin")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (dashboardHoldingsSorting === "coin") ? styles.buttonTextActive : null]}>Coin</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (dashboardHoldingsSorting === "amount") ? styles.inlineButtonActive : null]} onPress={() => { changeDashboardHoldingsSorting("amount")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (dashboardHoldingsSorting === "amount") ? styles.buttonTextActive : null]}>Amount</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (dashboardHoldingsSorting === "value") ? styles.inlineButtonActive : null]} onPress={() => { changeDashboardHoldingsSorting("value")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (dashboardHoldingsSorting === "value") ? styles.buttonTextActive : null]}>Value</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (dashboardHoldingsSorting === "change") ? styles.inlineButtonActive : null]} onPress={() => { changeDashboardHoldingsSorting("change")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (dashboardHoldingsSorting === "change") ? styles.buttonTextActive : null]}>Change</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.container}>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (dashboardHoldingsSortOrder === "descending") ? styles.inlineButtonActive : null]} onPress={() => { changeDashboardHoldingsSortOrder("descending")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (dashboardHoldingsSortOrder === "descending") ? styles.buttonTextActive : null]}>Descending</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (dashboardHoldingsSortOrder === "ascending") ? styles.inlineButtonActive : null]} onPress={() => { changeDashboardHoldingsSortOrder("ascending")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (dashboardHoldingsSortOrder === "ascending") ? styles.buttonTextActive : null]}>Ascending</Text>
					</TouchableOpacity>
				</View>
			</View>
			<View style={[styles.section, styles[`section${theme}`]]}>
				<Text style={[styles.header, styles[`header${theme}`]]}>Import ETH Tokens</Text>
				<View style={[styles.sectionDescriptionWrapper, styles[`sectionDescriptionWrapper${theme}`], { marginBottom:20 }]}>
					<Text style={[styles.sectionDescription, styles[`sectionDescription${theme}`]]}>Using Ethplorer, the current balance of the tokens in your ETH wallet can be imported into Cryptofolio. Your Ethereum token holdings would either get added to your current holdings, or would replace them depending on which option you choose. Tokens that aren't listed on CoinGecko would not get added.</Text>
				</View>
				<TextInput style={[styles.input, styles[`input${theme}`]]} placeholder="ETH Address..." placeholderTextColor={globalColors[theme].mainContrastLight} onChangeText={(value) => { setEthAddress(value)}} autoCapitalize="none"/>
				<View style={styles.container}>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], { marginTop:0, marginBottom:0 }, (importTokens === "add") ? styles.inlineButtonActive : null]} onPress={() => { changeImportTokens("add")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (importTokens === "add") ? styles.buttonTextActive : null]}>Add</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], { marginTop:0, marginBottom:0 }, (importTokens === "replace") ? styles.inlineButtonActive : null]} onPress={() => { changeImportTokens("replace")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (importTokens === "replace") ? styles.buttonTextActive : null]}>Replace</Text>
					</TouchableOpacity>
				</View>
				<TouchableOpacity style={[styles.button, { marginTop:20 }]} onPress={() => { importETHTokens(importTokens, ethAddress) }}>
					<Text style={styles.text}>Import</Text>
				</TouchableOpacity>
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
				<Text style={[styles.header, styles[`header${theme}`]]}>Highlight Price Change</Text>
				<View style={styles.container}>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (highlightPriceChange === "disabled") ? styles.inlineButtonActive : null]} onPress={() => { changeHighlightPriceChange("disabled")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (highlightPriceChange === "disabled") ? styles.buttonTextActive : null]}>Disabled</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (highlightPriceChange === "row") ? styles.inlineButtonActive : null]} onPress={() => { changeHighlightPriceChange("row")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (highlightPriceChange === "row") ? styles.buttonTextActive : null]}>Row</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (highlightPriceChange === "text") ? styles.inlineButtonActive : null]} onPress={() => { changeHighlightPriceChange("text")}}>
						<Text style={[styles.buttonText, styles[`buttonText${theme}`], (highlightPriceChange === "text") ? styles.buttonTextActive : null]}>Text</Text>
					</TouchableOpacity>
				</View>
			</View>
			<View style={[styles.section, styles[`section${theme}`]]}>
				<Text style={[styles.header, styles[`header${theme}`]]}>Account</Text>
				{ !noAPIMode &&
					<View>
						{ !empty(accountMessage) &&
							<View style={styles.messageWrapper}>
								<Text style={styles.message}>{accountMessage}</Text>
							</View>
						}
						<TextInput secureTextEntry={!empty(currentPassword)} style={[styles.input, styles[`input${theme}`]]} placeholder="Current Password..." placeholderTextColor={globalColors[theme].mainContrastLight} onChangeText={(value) => { setCurrentPassword(value)}} autoCapitalize="none"/>
						<TextInput secureTextEntry={!empty(newPassword)} style={[styles.input, styles[`input${theme}`]]} placeholder="New Password..." placeholderTextColor={globalColors[theme].mainContrastLight} onChangeText={(value) => { setNewPassword(value)}} autoCapitalize="none"/>
						<TextInput secureTextEntry={!empty(repeatPassword)} style={[styles.input, styles[`input${theme}`]]} placeholder="Repeat Password..." placeholderTextColor={globalColors[theme].mainContrastLight} onChangeText={(value) => { setRepeatPassword(value)}} autoCapitalize="none"/>
						<TouchableOpacity style={styles.button} onPress={() => { changePassword() }}>
							<Text style={styles.text}>Change Password</Text>
						</TouchableOpacity>
					</View>
				}
				{ noAPIMode &&
					<View>
						<TouchableOpacity style={styles.button} onPress={() => { showModal() }}>
							<Text style={styles.text}>Clear No-API Data</Text>
						</TouchableOpacity>
					</View>
				}
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

	function hideModal() {
		setModal(false);
	}

	function showModal() {
		setModal(true);
	}

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

	async function clearNoAPIData() {
		await AsyncStorage.removeItem("NoAPI");
		logout();
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
		if(empty(await AsyncStorage.getItem("NoAPIMode"))) {
			let api = await AsyncStorage.getItem("api");
			let token = await AsyncStorage.getItem("token");
			let username = await AsyncStorage.getItem("username");

			let endpoint = api + "holdings/export.php?token=" + token + "&username=" + username;

			if(type === "activity") {
				endpoint = api + "activity/export.php?token=" + token + "&username=" + username;
			}

			Linking.openURL(endpoint).catch(error => {
				ToastAndroid.showWithGravity("Couldn't open the browser...", ToastAndroid.LONG, ToastAndroid.BOTTOM);
				console.log(error);
			});
		} else {
			let data = await AsyncStorage.getItem("NoAPI");
			if(validJSON(data)) {
				data = JSON.parse(data);
			} else {
				data = {};
			}

			let noAPI = new NoAPI(data, "mobile", AsyncStorage);
			let filename;
			let csv;
			
			if(type === "activity") {
				filename = "Activity-" + Math.floor(new Date().getTime() / 1000) + ".csv";
				csv = noAPI.exportActivity();
			} else {
				filename = "Holdings-" + Math.floor(new Date().getTime() / 1000) + ".csv"
				csv = noAPI.exportHoldings();
			}

			let path = RNFS.DocumentDirectoryPath + "/" + filename;

			RNFS.writeFile(path, csv, "utf8").then((success) => {
				ToastAndroid.showWithGravity("Data exported to: " + path, ToastAndroid.LONG, ToastAndroid.BOTTOM);
			}).catch((error) => {
				ToastAndroid.showWithGravity("Couldn't export data...", ToastAndroid.LONG, ToastAndroid.BOTTOM);
				console.log(error);
			});
		}
	}

	async function importETHTokens(importTokens, address) {
		if(!empty(address)) {
			getETHAddressBalance(address).then(balance => {
				ToastAndroid.showWithGravity("Importing tokens...", ToastAndroid.LONG, ToastAndroid.BOTTOM);

				let eth = parseFloat(balance["ETH"].balance.toFixed(3));
				let tokens = balance.tokens;

				let index = 0;

				Object.keys(tokens).map(key => {
					index++;

					let token = tokens[key];
					let info = token.tokenInfo;
					let symbol = info.symbol;
					if("coingecko" in info) {
						let balance = token.balance;
						let string = balance.toFixed(0);
						let decimals = parseInt(info.decimals);
						let position = string.length - decimals;
						let split = string.split("");
						split.splice(position, 0, ".");
						let join = split.join("");
						
						let id = info.coingecko;
						let amount = parseFloat(parseFloat(join).toFixed(2));

						setTimeout(() => {
							getCoinID("id", id).then(response => {
								if("id" in response) {
									if(importTokens === "add") {
										addHolding(id, symbol, amount);
									} else {
										updateHolding(id, amount);
									}
									ToastAndroid.showWithGravity("Adding " + symbol + ".", ToastAndroid.LONG, ToastAndroid.BOTTOM);
								} else {
									ToastAndroid.showWithGravity("Couldn't add " + symbol + ".", ToastAndroid.LONG, ToastAndroid.BOTTOM);
								}
							}).catch(e => {
								console.log(e);
								ToastAndroid.showWithGravity("Error fetching " + symbol + " details.", ToastAndroid.LONG, ToastAndroid.BOTTOM);
							});
						}, index * 4000);
					}
				});
			}).catch(e => {
				console.log(e);
				ToastAndroid.showWithGravity("Couldn't fetch balance.", ToastAndroid.LONG, ToastAndroid.BOTTOM);
			});
		} else {
			ToastAndroid.showWithGravity("Please provide an address to fetch the balance of.", ToastAndroid.LONG, ToastAndroid.BOTTOM);
		}
	}

	async function changePassword() {
		if(!empty(currentPassword) && !empty(newPassword) && !empty(repeatPassword)) {
			if(newPassword === repeatPassword) {
				let api = await AsyncStorage.getItem("api");
				let username = await AsyncStorage.getItem("username");

				let endpoint = api + "accounts/update.php";

				let body = { username:username, currentPassword:currentPassword, newPassword:newPassword };

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
		if(empty(await AsyncStorage.getItem("NoAPIMode"))) {
			let api = await AsyncStorage.getItem("api");
			let token = await AsyncStorage.getItem("token");
			let username = await AsyncStorage.getItem("username");

			let endpoint = api + "accounts/logout.php?platform=app&token=" + token + "&username=" + username;

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
				await AsyncStorage.removeItem("NoAPIMode");
				await AsyncStorage.removeItem("token");
				await AsyncStorage.removeItem("username");

				navigation.navigate("Login");

				if("error" in response) {
					console.log(response);
				}
			}).catch(error => {
				console.log(error);
			});
		} else {
			await AsyncStorage.removeItem("NoAPIMode");
			await AsyncStorage.removeItem("token");
			await AsyncStorage.removeItem("username");

			navigation.navigate("Login");
		}
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

	async function changeImportTokens(importTokens) {
		let validOptions = ["add", "replace"];
		if(empty(importTokens) || !validOptions.includes(importTokens)) {
			setImportTokens("add");
			await AsyncStorage.setItem("importTokens", "add");
		} else {
			setImportTokens(importTokens);
			await AsyncStorage.setItem("importTokens", importTokens);
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

	async function changeDashboardWatchlist(dashboardWatchlist) {
		let validOptions = ["disabled", "enabled"];
		if(empty(dashboardWatchlist) || !validOptions.includes(dashboardWatchlist)) {
			setDashboardWatchlist("disabled");
			await AsyncStorage.setItem("dashboardWatchlist", "disabled");
		} else {
			setDashboardWatchlist(dashboardWatchlist);
			await AsyncStorage.setItem("dashboardWatchlist", dashboardWatchlist);
		}
	}

	async function changeAdditionalDashboardColumns(additionalDashboardColumns) {
		let validOptions = ["disabled", "enabled"];
		if(empty(additionalDashboardColumns) || !validOptions.includes(additionalDashboardColumns)) {
			setAdditionalDashboardColumns("disabled");
			await AsyncStorage.setItem("additionalDashboardColumns", "disabled");
		} else {
			setAdditionalDashboardColumns(additionalDashboardColumns);
			await AsyncStorage.setItem("additionalDashboardColumns", additionalDashboardColumns);
		}
	}

	async function changeDashboardMarketSorting(dashboardMarketSorting) {
		let validOptions = ["coin", "price", "marketCap", "change"];
		if(empty(dashboardMarketSorting) || !validOptions.includes(dashboardMarketSorting)) {
			setDashboardMarketSorting("marketCap");
			await AsyncStorage.setItem("dashboardMarketSorting", "marketCap");
		} else {
			setDashboardMarketSorting(dashboardMarketSorting);
			await AsyncStorage.setItem("dashboardMarketSorting", dashboardMarketSorting);
		}
	}

	async function changeDashboardMarketSortOrder(dashboardMarketSortOrder) {
		let validOptions = ["descending", "ascending"];
		if(empty(dashboardMarketSortOrder) || !validOptions.includes(dashboardMarketSortOrder)) {
			setDashboardMarketSortOrder("descending");
			await AsyncStorage.setItem("dashboardMarketSortOrder", "descending");
		} else {
			setDashboardMarketSortOrder(dashboardMarketSortOrder);
			await AsyncStorage.setItem("dashboardMarketSortOrder", dashboardMarketSortOrder);
		}
	}

	async function changeDashboardHoldingsSorting(dashboardHoldingsSorting) {
		let validOptions = ["coin", "amount", "value", "change"];
		if(empty(dashboardHoldingsSorting) || !validOptions.includes(dashboardHoldingsSorting)) {
			setDashboardHoldingsSorting("coin");
			await AsyncStorage.setItem("dashboardHoldingsSorting", "coin");
		} else {
			setDashboardHoldingsSorting(dashboardHoldingsSorting);
			await AsyncStorage.setItem("dashboardHoldingsSorting", dashboardHoldingsSorting);
		}
	}

	async function changeDashboardHoldingsSortOrder(dashboardHoldingsSortOrder) {
		let validOptions = ["descending", "ascending"];
		if(empty(dashboardHoldingsSortOrder) || !validOptions.includes(dashboardHoldingsSortOrder)) {
			setDashboardHoldingsSortOrder("descending");
			await AsyncStorage.setItem("dashboardHoldingsSortOrder", "descending");
		} else {
			setDashboardHoldingsSortOrder(dashboardHoldingsSortOrder);
			await AsyncStorage.setItem("dashboardHoldingsSortOrder", dashboardHoldingsSortOrder);
		}
	}

	async function changeHighlightPriceChange(highlightPriceChange) {
		let validOptions = ["disabled", "row", "text"];
		if(empty(highlightPriceChange) || !validOptions.includes(highlightPriceChange)) {
			setHighlightPriceChange("disabled");
			await AsyncStorage.setItem("highlightPriceChange", "disabled");
		} else {
			setHighlightPriceChange(highlightPriceChange);
			await AsyncStorage.setItem("highlightPriceChange", highlightPriceChange);
		}
	}

	async function getSettings() {
		let noAPIMode = await AsyncStorage.getItem("NoAPIMode");
		if(empty(noAPIMode)) {
			setNoAPIMode(false);
		} else {
			setNoAPIMode(true);
		}

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

		let dashboardWatchlist = await AsyncStorage.getItem("dashboardWatchlist");
		if(empty(dashboardWatchlist)) {
			dashboardWatchlist = "disabled";
		}
		setDashboardWatchlist(dashboardWatchlist);

		let additionalDashboardColumns = await AsyncStorage.getItem("additionalDashboardColumns");
		if(empty(additionalDashboardColumns)) {
			additionalDashboardColumns = "disabled";
		}
		setAdditionalDashboardColumns(additionalDashboardColumns);

		let importTokens = await AsyncStorage.getItem("importTokens");
		if(empty(importTokens)) {
			importTokens = "add";
		}
		setImportTokens(importTokens);

		let dashboardMarketSorting = await AsyncStorage.getItem("dashboardMarketSorting");
		if(empty(dashboardMarketSorting)) {
			dashboardMarketSorting = "marketCap";
		}
		setDashboardMarketSorting(dashboardMarketSorting);

		let dashboardMarketSortOrder = await AsyncStorage.getItem("dashboardMarketSortOrder");
		if(empty(dashboardMarketSortOrder)) {
			dashboardMarketSortOrder = "descending";
		}
		setDashboardMarketSortOrder(dashboardMarketSortOrder);

		let dashboardHoldingsSorting = await AsyncStorage.getItem("dashboardHoldingsSorting");
		if(empty(dashboardHoldingsSorting)) {
			dashboardHoldingsSorting = "coin";
		}
		setDashboardHoldingsSorting(dashboardHoldingsSorting);

		let dashboardHoldingsSortOrder = await AsyncStorage.getItem("dashboardHoldingsSortOrder");
		if(empty(dashboardHoldingsSortOrder)) {
			dashboardHoldingsSortOrder = "descending";
		}
		setDashboardHoldingsSortOrder(dashboardHoldingsSortOrder);

		let highlightPriceChange = await AsyncStorage.getItem("highlightPriceChange");
		if(empty(highlightPriceChange)) {
			highlightPriceChange = "disabled";
		}
		setHighlightPriceChange(highlightPriceChange);

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