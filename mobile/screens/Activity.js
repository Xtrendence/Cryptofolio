import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import { Text, StyleSheet, View, Image, Dimensions, ScrollView, Modal, TouchableOpacity, TextInput, RefreshControl, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import LinearGradient from "react-native-linear-gradient";
import { globalColors, globalStyles } from "../styles/global";
import { ThemeContext } from "../utils/theme";
import { getCoinID } from "../utils/requests";
import { empty, separateThousands, abbreviateNumber, epoch, capitalizeFirstLetter, wait, currencies } from "../utils/utils";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

export default function Activity({ navigation }) {
	const { theme } = React.useContext(ThemeContext);

	const activityRef = React.createRef();

	const [pageKey, setPageKey] = React.useState(epoch());

	const [refreshing, setRefreshing] = React.useState(false);

	const [modal, setModal] = React.useState(false);
	const [modalMessage, setModalMessage] = React.useState();
	const [action, setAction] = React.useState("create");
	const [showCoinList, setShowCoinList] = React.useState(false);
	const [coinList, setCoinList] = React.useState();
	const [eventID, setEventID] = React.useState();
	const [coinID, setCoinID] = React.useState();
	const [coinSymbol, setCoinSymbol] = React.useState();
	const [eventDate, setEventDate] = React.useState();
	const [eventType, setEventType] = React.useState("buy");
	const [coinAmount, setCoinAmount] = React.useState();
	const [eventFee, setEventFee] = React.useState();
	const [eventNotes, setEventNotes] = React.useState();
	const [eventExchange, setEventExchange] = React.useState();
	const [coinPair, setCoinPair] = React.useState();
	const [coinPrice, setCoinPrice] = React.useState();
	const [eventFrom, setEventFrom] = React.useState();
	const [eventTo, setEventTo] = React.useState();

	const [activityData, setActivityData] = React.useState([<Text key="loading" style={[styles.loadingText, styles.headerText, styles[`headerText${theme}`]]}>Loading...</Text>]);

	useEffect(() => {
		setInterval(() => {
			if(navigation.isFocused()) {
				getActivity();
			}
		}, 15000);
	}, []);

	useEffect(() => {
		setActivityData([<Text key="loading" style={[styles.loadingText, styles.headerText, styles[`headerText${theme}`]]}>Loading...</Text>]);

		setPageKey(epoch());

		getActivity();
	}, [theme]);

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		getActivity();
		wait(750).then(() => setRefreshing(false));
	}, []);

	return (
		<ScrollView style={[styles.page, styles[`page${theme}`]]} key={pageKey} contentContainerStyle={{ padding:20 }} nestedScrollEnabled={true} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[globalColors[theme].accentFirst]} progressBackgroundColor={globalColors[theme].mainFirst}/>}>
			<Modal animationType="fade" visible={modal} onRequestClose={() => { hideModal()}} transparent={false}>
				<ScrollView style={[styles.modalScroll, styles[`modalScroll${theme}`]]} contentContainerStyle={{ padding:20 }}>
					<View style={styles.modalWrapper}>
						<View stlye={[styles.modal, styles[`modal${theme}`]]}>
							<TextInput style={[styles.input, styles[`input${theme}`]]} placeholder={"Symbol... (e.g. BTC)"} onChangeText={(value) => { setCoinSymbol(value)}} value={coinSymbol} placeholderTextColor={globalColors[theme].mainContrastLight}/>
							<TextInput style={[styles.input, styles[`input${theme}`]]} placeholder={"Date... (e.g. 2021/04/18 04:20)"} onChangeText={(value) => { setEventDate(value)}} value={eventDate} placeholderTextColor={globalColors[theme].mainContrastLight}/>
							<View style={styles.inlineContainer}>
								<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (eventType === "buy") ? styles.inlineButtonActive : null]} onPress={() => { setEventType("buy")}}>
									<Text style={[styles.buttonText, styles[`buttonText${theme}`], (eventType === "buy") ? styles.buttonTextActive : null]}>Buy</Text>
								</TouchableOpacity>
								<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (eventType === "sell") ? styles.inlineButtonActive : null]} onPress={() => { setEventType("sell")}}>
									<Text style={[styles.buttonText, styles[`buttonText${theme}`], (eventType === "sell") ? styles.buttonTextActive : null]}>Sell</Text>
								</TouchableOpacity>
								<TouchableOpacity style={[styles.inlineButton, styles[`inlineButton${theme}`], (eventType === "transfer") ? styles.inlineButtonActive : null]} onPress={() => { setEventType("transfer")}}>
									<Text style={[styles.buttonText, styles[`buttonText${theme}`], (eventType === "transfer") ? styles.buttonTextActive : null]}>Transfer</Text>
								</TouchableOpacity>
							</View>
							<TextInput style={[styles.input, styles[`input${theme}`]]} placeholder={"Amount... (e.g. 2.5)"} onChangeText={(value) => { setCoinAmount(value)}} value={coinAmount} placeholderTextColor={globalColors[theme].mainContrastLight}/>
							<TextInput style={[styles.input, styles[`input${theme}`]]} placeholder={"Fee... (e.g. 0.25)"} onChangeText={(value) => { setEventFee(value)}} value={eventFee} placeholderTextColor={globalColors[theme].mainContrastLight}/>
							<TextInput style={[styles.input, styles[`input${theme}`]]} placeholder={"Notes... (e.g. Rent)"} onChangeText={(value) => { setEventNotes(value)}} value={eventNotes} placeholderTextColor={globalColors[theme].mainContrastLight}/>
							{ (eventType !== "transfer") &&
								<View>
									<TextInput style={[styles.input, styles[`input${theme}`]]} placeholder={"Exchange... (e.g. Coinbase)"} onChangeText={(value) => { setEventExchange(value)}} value={eventExchange} placeholderTextColor={globalColors[theme].mainContrastLight}/>
									<TextInput style={[styles.input, styles[`input${theme}`]]} placeholder={"Pair... (e.g. BTC/USDT)"} onChangeText={(value) => { setCoinPair(value)}} value={coinPair} placeholderTextColor={globalColors[theme].mainContrastLight}/>
									<TextInput style={[styles.input, styles[`input${theme}`]]} placeholder={"Price... (e.g. 59000)"} onChangeText={(value) => { setCoinPrice(value)}} value={coinPrice} placeholderTextColor={globalColors[theme].mainContrastLight}/>
								</View>
							}
							{ (eventType === "transfer") &&
								<View>
									<TextInput style={[styles.input, styles[`input${theme}`]]} placeholder={"From... (e.g. Kraken)"} onChangeText={(value) => { setEventFrom(value)}} value={eventFrom} placeholderTextColor={globalColors[theme].mainContrastLight}/>
									<TextInput style={[styles.input, styles[`input${theme}`]]} placeholder={"To... (e.g. Cold Wallet)"} onChangeText={(value) => { setEventTo(value)}} value={eventTo} placeholderTextColor={globalColors[theme].mainContrastLight}/>
								</View>
							}
							{ showCoinList && !empty(coinList) &&
								<ScrollView style={[styles.coinList, styles[`coinList${theme}`]]} nestedScrollEnabled={true}>
									{
										coinList.map(row => {
											return row;
										})
									}
								</ScrollView>
							}
							{ action !== "create" &&
								<TouchableOpacity style={[styles.button, styles.buttonDelete]} onPress={() => { deleteActivity(eventID)}}>
									<Text style={styles.text}>Remove Activity</Text>
								</TouchableOpacity>
							}
							<View style={styles.buttonWrapper}>
								<TouchableOpacity style={[styles.button, styles[`button${theme}`]]} onPress={() => { hideModal()}}>
									<Text style={styles.text}>Cancel</Text>
								</TouchableOpacity>
								<TouchableOpacity style={[styles.button, styles.buttonConfirm, styles[`buttonConfirm${theme}`]]} onPress={() => { addActivity(coinID, coinSymbol, eventDate, coinAmount, eventFee, eventNotes, eventType, eventExchange, coinPair, coinPrice, eventFrom, eventTo) }}>
									<Text style={styles.text}>Confirm</Text>
								</TouchableOpacity>
							</View>
							{ !empty(modalMessage) &&
								<View style={styles.modalMessageWrapper}>
									<Text style={styles.modalMessage}>{modalMessage}</Text>
								</View>
							}
						</View>
					</View>
				</ScrollView>
			</Modal>
			<ScrollView ref={activityRef} style={[styles.tableWrapper, styles[`tableWrapper${theme}`]]} nestedScrollEnabled={true}>
				{ !empty(activityData) &&
					activityData.map(row => {
						return row;
					})
				}
			</ScrollView>
			<LinearGradient style={[styles.card, { marginTop:20 }]} colors={globalColors[theme].atlasGradient} useAngle={true} angle={45}>
				<TouchableOpacity onPress={() => { setAction("create"); setModal(true)}}>
					<Text style={[styles.cardText, styles[`cardText${theme}`]]}>Record Event</Text>
				</TouchableOpacity>
			</LinearGradient>
			<StatusBar style={theme === "Dark" ? "light" : "dark"}/>
		</ScrollView>
	);

	function hideModal() {
		setEventID();
		setCoinSymbol();
		setEventDate();
		setEventType("buy");
		setCoinAmount();
		setEventFee();
		setEventNotes();
		setEventExchange();
		setCoinPair();
		setCoinPrice();
		setEventFrom();
		setEventTo();
		setShowCoinList(false);
		setCoinList();
		setAction("create");
		setModalMessage();
		setModal(false);
	}

	function addActivity(id, symbol, date, amount, fee, notes, type, exchange, pair, price, from, to) {
		let valid = true;
		let functionArguments = [id, symbol, date, amount, fee, notes, type, exchange, pair, price, from, to];
		for(let i = 0; i < functionArguments.length; i++) {
			let argument = functionArguments[i];
			if(!empty(argument) && argument.includes(",")) {
				valid = false;
			}
		}

		if(valid) {
			setModalMessage("Checking coin...");

			let key = "symbol";
			let value = symbol.trim().toLowerCase();

			getCoinID(key, value).then(async response => {
				if("id" in response) {
					if(action === "create") {
						createActivity(response.id, symbol, date, amount, fee, notes, type, exchange, pair, price, from, to);
					} else {
						updateActivity(eventID, response.id, symbol, date, amount, fee, notes, type, exchange, pair, price, from, to);
					}
				} else if("matches" in response) {
					let matches = response.matches;

					let data = [];

					Object.keys(matches).map(key => {
						let match = matches[key];
						let symbol = Object.keys(match)[0];
						let id = match[symbol];

						data.push(
							<TouchableOpacity key={epoch() + id} onPress={() => { (action === "create") ? createActivity(id, symbol, date, amount, fee, notes, type, exchange, pair, price, from, to) : updateActivity(eventID, id, symbol, date, amount, fee, notes, type, exchange, pair, price, from, to) }}>
								<View style={[styles.row, key % 2 ? {...styles.rowOdd, ...styles[`rowOdd${theme}`]} : null]}>
									<Text style={[styles.cellText, styles[`cellText${theme}`]]} ellipsizeMode="tail">{symbol.toUpperCase()}</Text>
									<Text style={[styles.cellText, styles[`cellText${theme}`], { marginLeft:20 }]} ellipsizeMode="tail">{capitalizeFirstLetter(id)}</Text>
								</View>
							</TouchableOpacity>
						);
					});

					setCoinList(data);
					setShowCoinList(true);
					setModalMessage("Please select a coin from the list.");
				}
			}).catch(error => {
				console.log(error);
			});
		} else {
			setModalMessage("Both fields must be filled out.");
		}
	}

	async function createActivity(id, symbol, date, amount, fee, notes, type, exchange, pair, price, from, to) {
		let api = await AsyncStorage.getItem("api");
		let token = await AsyncStorage.getItem("token");

		let endpoint = api + "activity/create.php";

		let body = { token:token, id:id, symbol:symbol, date:date, amount:amount, fee:fee, notes:notes, type:type, exchange:exchange, pair:pair, price:price, from:from, to:to };

		fetch(endpoint, {
			body: JSON.stringify(body),
			method: "POST",
			headers: {
				Accept: "application/json", "Content-Type": "application/json"
			}
		})
		.then((json) => {
			return json.json();
		})
		.then(async (response) => {
			if(!empty(response.error)) {
				setModalMessage(response.error);
			} else {
				hideModal();
				getActivity();
			}
		}).catch(error => {
			console.log(error);
		});
	}
	
	async function updateActivity(txID, id, symbol, date, amount, fee, notes, type, exchange, pair, price, from, to) {
		let api = await AsyncStorage.getItem("api");
		let token = await AsyncStorage.getItem("token");

		let endpoint = api + "activity/update.php";

		let body = { token:token, txID:txID, id:id, symbol:symbol, date:date, amount:amount, fee:fee, notes:notes, type:type, exchange:exchange, pair:pair, price:price, from:from, to:to };

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
			if(!empty(response.error)) {
				setModalMessage(response.error);
			} else {
				hideModal();
				getActivity();
			}
		}).catch(error => {
			console.log(error);
		});
	}

	async function deleteActivity(txID) {
		if(!empty(txID)) {
			let api = await AsyncStorage.getItem("api");
			let token = await AsyncStorage.getItem("token");

			let endpoint = api + "activity/delete.php";

			let body = { token:token, txID:txID };

			fetch(endpoint, {
				method: "DELETE",
				body: JSON.stringify(body),
				headers: {
					Accept: "application/json", "Content-Type": "application/json"
				}
			})
			.then((json) => {
				return json.json();
			})
			.then(async (response) => {
				if("message" in response) {
					hideModal();
					getActivity();
				} else {
					setModalMessage(response.error);
				}
			}).catch(error => {
				console.log(error);
			});
		} else {
			setModalMessage("Coin ID field must be filled out.");
		}
	}

	async function getActivity() {
		console.log("Activity - Getting Activity - " + epoch());
		
		let theme = empty(await AsyncStorage.getItem("theme")) ? "Light" : await AsyncStorage.getItem("theme");

		let api = await AsyncStorage.getItem("api");
		let token = await AsyncStorage.getItem("token");

		let endpoint = api + "activity/read.php?platform=app&token=" + token;

		fetch(endpoint, {
			method: "GET",
			headers: {
				Accept: "application/json", "Content-Type": "application/json"
			}
		})
		.then((response) => {
			return response.json();
		})
		.then(async (events) => {
			if(Object.keys(events).length === 0) {
				if(navigation.isFocused()) {
					setActivityData([<Text key="empty" style={[styles.loadingText, styles.headerText, styles[`headerText${theme}`], { marginLeft:20 }]}>No Activity Found.</Text>]);
				}
			} else {
				events = sortActivity(events);

				let data = [];

				let index = 0;

				Object.keys(events).map(txID => {
					index += 1;

					let activity = events[txID];
	
					let symbol = activity.symbol.toUpperCase();
					let date = activity.date;
					let amount = activity.amount;
					let fee = activity.fee;
					let notes = activity.notes;
					let type = capitalizeFirstLetter(activity.type);
					let exchange = activity.exchange;
					let pair = activity.pair;
					let price = activity.price;
					let from = activity.from;
					let to = activity.to;

					data.push(
						<TouchableOpacity onPress={() => { setEventID(txID); setCoinSymbol(symbol); setEventDate(date); setEventType(type.toLowerCase()); setCoinAmount(amount); setEventFee(fee); setEventNotes(notes); setEventExchange(exchange); setCoinPair(pair); setCoinPrice(price); setEventFrom(from); setEventTo(to); setAction("update"); setModal(true)}} key={epoch() + txID}>
							<View style={[styles.row, index % 2 ? null : {...styles.rowEven, ...styles[`rowEven${theme}`]}]}>
								<View style={[styles.column, styles.columnLeft]}>
									<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellDate]} ellipsizeMode="tail">{date}</Text>
									<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellType]} ellipsizeMode="tail">{type} - {symbol}</Text>
								</View>
								<View style={[styles.column, styles.columnRight]}>
									<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellAmount]} ellipsizeMode="tail">{amount}</Text>
									<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellNotes]} ellipsizeMode="tail" numberOfLines={1}>{notes}</Text>
								</View>
							</View>
						</TouchableOpacity>
					);
				});

				if(navigation.isFocused()) {
					setActivityData(data);
				}
			}
		}).catch(error => {
			console.log(arguments.callee.name + " - " + error);
		});
	}

	function sortActivity(events) {
		let sorted = {};
		let array = [];
		for(let event in events) {
			array.push([event, events[event].time]);
		}

		array.sort(function(a, b) {
			return a[1] - b[1];
		});

		array.reverse().map(item => {
			sorted[item[0]] = events[item[0]];
		});

		return sorted;
	}
}

String.prototype.replaceAll = function(str1, str2, ignore) {
	return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}

const styles = StyleSheet.create({
	page: {
		height:screenHeight - 190,
		backgroundColor:globalColors["Light"].mainSecond,
	},
	pageDark: {
		backgroundColor:globalColors["Dark"].mainSecond
	},
	modalScroll: {
		backgroundColor:globalColors["Light"].mainThird
	},
	modalScrollDark: {
		backgroundColor:globalColors["Dark"].mainThird
	},
	modalWrapper: {
		width:"100%",
		minHeight:screenHeight - 120,
		flex:1,
		justifyContent:"center",
		alignItems:"center",
	},
	modal: {
		width:300,
		height:300,
		alignItems:"center",
		backgroundColor:globalColors["Light"].mainFirst
	},
	modalDark: {
		backgroundColor:globalColors["Dark"].mainFirst
	},
	modalMessageWrapper: {
		backgroundColor:globalColors["Light"].accentFirst,
		borderRadius:globalStyles.borderRadius,
		width:screenWidth - 180,
		padding:10,
		marginTop:20,
	},
	modalMessage: {
		color:globalColors["Light"].accentContrast,
		fontSize:16,
		fontFamily:globalStyles.fontFamily,
		lineHeight:25,
	},
	inlineContainer: {
		flexDirection:"row",
		flexWrap:"wrap",
		justifyContent:"center",
		marginBottom:20,
		marginLeft:-14,
		width:screenWidth - 150,
	},
	inlineButton: {
		alignItems:"center",
		justifyContent:"center",
		borderRadius:globalStyles.borderRadius,
		padding:10,
		marginRight:10,
		marginLeft:10,
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
		backgroundColor:globalColors["Light"].mainFirst
	},
	inlineButtonDark: {
		backgroundColor:globalColors["Dark"].mainFirst
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
	coinList: {
		maxHeight:106,
		marginBottom:20,
		borderRadius:globalStyles.borderRadius,
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
		backgroundColor:globalColors["Light"].mainFirst
	},
	coinListDark: {
		backgroundColor:globalColors["Dark"].mainFirst
	},
	input: {
		backgroundColor:globalColors["Light"].mainFirst,
		color:globalColors["Light"].mainContrast,
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
		borderRadius:globalStyles.borderRadius,
		paddingLeft:10,
		paddingRight:10,
		marginBottom:20,
		width:screenWidth - 176,
	},
	inputDark: {
		backgroundColor:globalColors["Dark"].mainFirst,
		color:globalColors["Dark"].mainContrast
	},
	buttonWrapper: {
		width:screenWidth - 180,
		flexDirection:"row"
	},
	button: {
		height:40,
		width:((screenWidth - 180) / 2) - 9,
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
		borderRadius:globalStyles.borderRadius,
		alignItems:"center",
		justifyContent:"center",
		borderRadius:globalStyles.borderRadius,
		backgroundColor:globalColors["Light"].mainContrast
	},
	buttonDark: {
		backgroundColor:globalColors["Dark"].mainFirst
	},
	buttonConfirm: {
		marginLeft:20,
		backgroundColor:globalColors["Light"].accentFirst
	},
	buttonConfirmDark: {
		backgroundColor:globalColors["Dark"].accentFirst
	},
	buttonDelete: {
		backgroundColor:"rgb(230,50,50)",
		width:screenWidth - 176,
		marginBottom:20,
	},
	text: {
		lineHeight:38,
		fontFamily:globalStyles.fontFamily,
		fontSize:18,
		paddingBottom:2,
		color:globalColors["Light"].accentContrast
	},
	tableWrapper: {
		backgroundColor:globalColors["Light"].mainFirst,
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
		borderRadius:globalStyles.borderRadius,
		height:screenHeight - 310,
		maxHeight:screenHeight - 310
	},
	tableWrapperDark: {
		backgroundColor:globalColors["Dark"].mainFirst
	},
	row: {
		flexDirection:"row",
		alignItems:"center",
		padding:12
	},
	rowEven: {
		backgroundColor:globalColors["Light"].mainSecond,
	},
	rowEvenDark: {
		backgroundColor:globalColors["Dark"].mainSecond,
	},
	column: {
		width:"50%",
	},
	columnLeft: {
		alignItems:"flex-start"
	},
	columnRight: {
		alignItems:"flex-end"
	},
	loadingText: {
		marginLeft:20,
		marginTop:20
	},
	headerText: {
		fontSize:18,
		fontFamily:globalStyles.fontFamily,
		fontWeight:"bold",
		color:globalColors["Light"].mainContrastLight,
		marginBottom:4,
	},
	headerTextDark: {
		color:globalColors["Dark"].mainContrastLight
	},
	cellText: {
		color:globalColors["Light"].mainContrastLight
	},
	cellTextDark: {
		color:globalColors["Dark"].mainContrastLight
	},
	cellDate: {
		marginBottom:10
	},
	cellAmount: {
		marginBottom:10
	},
	cellNotes: {
		maxWidth:120,
	},
	card: {
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
		borderRadius:globalStyles.borderRadius,
		justifyContent:"center",
		alignItems:"center",
		height:60,
	},
	cardText: {
		lineHeight:56,
		paddingBottom:4,
		fontSize:20,
		fontFamily:globalStyles.fontFamily,
		color:globalColors["Light"].accentContrast,
		fontWeight:"bold",
		textAlign:"center"
	},
	cardTextDark: {
		color:globalColors["Dark"].accentContrast
	}
});