import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import { Text, StyleSheet, View, Image, Dimensions, ScrollView, Modal, TouchableOpacity, TextInput, RefreshControl, SafeAreaView } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { StatusBar } from "expo-status-bar";
import LinearGradient from "react-native-linear-gradient";
import DatePicker from "react-native-modern-datepicker";
import NoAPI from "../utils/api";
import { globalColors, globalStyles } from "../styles/global";
import { ThemeContext } from "../utils/theme";
import { getCoinID } from "../utils/requests";
import { empty, separateThousands, abbreviateNumber, epoch, capitalizeFirstLetter, wait, currencies, replaceAll, formatDateHuman, formatDate } from "../utils/utils";
import styles from "../styles/Activity";

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
	const [showDatePicker, setShowDatePicker] = React.useState(false);
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
		// setInterval(() => {
		// 	if(navigation.isFocused()) {
		// 		getActivity();
		// 	}
		// }, 15000);

		navigation.addListener("focus", () => {
			if(navigation.isFocused()) {
				setTimeout(() => {
					setPageKey(epoch());
					getActivity();
				}, 500);
			}
		});
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
			<Modal animationType="fade" visible={(showDatePicker)} onRequestClose={() => { setModal(true); setShowDatePicker(false)}} transparent={false}>
				<ScrollView style={[styles.modalScroll, styles[`modalScroll${theme}`]]} contentContainerStyle={{ padding:20 }}>
					<DatePicker 
						onSelectedChange={(date) => { changeDate(date)}} 
						style={styles.calendar}
						options={{
							backgroundColor:globalColors[theme].mainFirst,
							textHeaderColor:globalColors[theme].accentSecond,
							textDefaultColor:globalColors[theme].mainContrast,
							selectedTextColor:globalColors[theme].accentContrast,
							mainColor:globalColors[theme].accentSecond,
							textSecondaryColor:globalColors[theme].accentFirst,
							borderColor:globalColors[theme].accentSecond,
						}}
					/>
					<View style={[styles.buttonWrapper, { justifyContent:"center", width:"100%", marginTop:20 }]}>
						<TouchableOpacity style={[styles.button, styles[`button${theme}`]]} onPress={() => { setModal(true); setShowDatePicker(false)}}>
							<Text style={styles.text}>Cancel</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</Modal>
			<Modal animationType="fade" visible={(modal && !showDatePicker)} onRequestClose={() => { hideModal()}} transparent={false}>
				<ScrollView style={[styles.modalScroll, styles[`modalScroll${theme}`]]} contentContainerStyle={{ padding:20 }}>
					<View style={styles.modalWrapper}>
						<View stlye={[styles.modal, styles[`modal${theme}`]]}>
							<TextInput style={[styles.input, styles[`input${theme}`]]} placeholder={"Symbol... (e.g. BTC)"} onChangeText={(value) => { setCoinSymbol(value)}} value={coinSymbol} placeholderTextColor={globalColors[theme].mainContrastLight}/>
							<View style={[styles.inlineContainer, { marginBottom:0 }]}>
								<TextInput style={[styles.input, styles[`input${theme}`], { width:screenWidth - 240, marginRight:15 }]} placeholder={"Date... (e.g. 2021/04/18 04:20)"} onChangeText={(value) => { setEventDate(value)}} value={eventDate} placeholderTextColor={globalColors[theme].mainContrastLight}/>
								<TouchableOpacity style={[styles.iconButton, styles[`iconButton${theme}`]]} onPress={() => { setShowDatePicker(true)}}>
									<View style={styles.iconWrapper}>
										<Icon name="calendar" size={26} color={globalColors[theme].mainContrastLight}></Icon>
									</View>
								</TouchableOpacity>
							</View>
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

	function changeDate(value) {
		setShowDatePicker(false);
		setEventDate(value);
	}

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

			if(action === "update") {
				key = "id";
				value = id.trim().toLowerCase();
			}

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
			setModalMessage("All fields must be filled out.");
		}
	}

	async function createActivity(id, symbol, date, amount, fee, notes, type, exchange, pair, price, from, to) {
		if(empty(await AsyncStorage.getItem("NoAPIMode"))) {
			let api = await AsyncStorage.getItem("api");
			let token = await AsyncStorage.getItem("token");
			let username = await AsyncStorage.getItem("username");

			let endpoint = api + "activity/create.php";

			let body = { token:token, username:username, id:id, symbol:symbol, date:date, amount:amount, fee:fee, notes:notes, type:type, exchange:exchange, pair:pair, price:price, from:from, to:to };

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
				setModalMessage("Couldn't record activity. Make sure all fields are filled out.");
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
			let response = noAPI.createActivity(id, symbol, date, type, amount, fee, notes, exchange, pair, price, from, to);

			if(!empty(response.error)) {
				setModalMessage(response.error);
			} else {
				hideModal();
				getActivity();
			}
		}
	}
	
	async function updateActivity(txID, id, symbol, date, amount, fee, notes, type, exchange, pair, price, from, to) {
		if(empty(await AsyncStorage.getItem("NoAPIMode"))) {
			let api = await AsyncStorage.getItem("api");
			let token = await AsyncStorage.getItem("token");
			let username = await AsyncStorage.getItem("username");

			let endpoint = api + "activity/update.php";

			let body = { token:token, username:username, txID:txID, id:id, symbol:symbol, date:date, amount:amount, fee:fee, notes:notes, type:type, exchange:exchange, pair:pair, price:price, from:from, to:to };

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
				setModalMessage("Couldn't update activity. Make sure all fields are filled out.");
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
			let response = noAPI.updateActivity(txID, id, symbol, date, type, amount, fee, notes, exchange, pair, price, from, to);

			if(!empty(response.error)) {
				setModalMessage(response.error);
			} else {
				hideModal();
				getActivity();
			}
		}
	}

	async function deleteActivity(txID) {
		if(!empty(txID)) {
			if(empty(await AsyncStorage.getItem("NoAPIMode"))) {
				let api = await AsyncStorage.getItem("api");
				let token = await AsyncStorage.getItem("token");
				let username = await AsyncStorage.getItem("username");

				let endpoint = api + "activity/delete.php";

				let body = { token:token, username:username, txID:txID };

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
				let data = await AsyncStorage.getItem("NoAPI");
				if(validJSON(data)) {
					data = JSON.parse(data);
				} else {
					data = {};
				}

				let noAPI = new NoAPI(data, "mobile", AsyncStorage);
				let response = noAPI.deleteActivity(txID);

				if("message" in response) {
					hideModal();
					getActivity();
				} else {
					setModalMessage(response.error);
				}
			}
		} else {
			setModalMessage("Activity not found.");
		}
	}

	async function getActivity() {
		console.log("Activity - Getting Activity - " + epoch());
		
		let theme = empty(await AsyncStorage.getItem("theme")) ? "Light" : await AsyncStorage.getItem("theme");

		if(empty(await AsyncStorage.getItem("NoAPIMode"))) {
			let api = await AsyncStorage.getItem("api");
			let token = await AsyncStorage.getItem("token");
			let username = await AsyncStorage.getItem("username");

			let endpoint = api + "activity/read.php?platform=app&token=" + token + "&username=" + username;

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
						setActivityData([<Text key="empty" style={[styles.loadingText, styles.headerText, styles[`headerText${theme}`], { marginLeft:20 }]}>No Activity Found...</Text>]);
					}
				} else {
					events = sortActivity(events);

					let data = [];

					let index = 0;

					Object.keys(events).map(txID => {
						index += 1;

						let activity = events[txID];
		
						let id = activity.id;
						let symbol = activity.symbol.toUpperCase();
						let date = activity.date;
						let amount = activity.amount;
						let fee = activity.fee?.toString();
						let notes = activity.notes;
						let type = capitalizeFirstLetter(activity.type);
						let exchange = activity.exchange;
						let pair = activity.pair;
						let price = activity.price?.toString();
						let from = activity.from;
						let to = activity.to;

						data.push(
							<TouchableOpacity onPress={() => { setEventID(txID); setCoinID(id); setCoinSymbol(symbol); setEventDate(date); setEventType(type.toLowerCase()); setCoinAmount(amount); setEventFee(fee); setEventNotes(notes); setEventExchange(exchange); setCoinPair(pair); setCoinPrice(price); setEventFrom(from); setEventTo(to); setAction("update"); setModal(true)}} key={epoch() + txID}>
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
		} else {
			let data = await AsyncStorage.getItem("NoAPI");
			if(validJSON(data)) {
				data = JSON.parse(data);
			} else {
				data = {};
			}

			let noAPI = new NoAPI(data, "mobile", AsyncStorage);
			let events = noAPI.readActivity();

			if(Object.keys(events).length === 0) {
				if(navigation.isFocused()) {
					setActivityData([<Text key="empty" style={[styles.loadingText, styles.headerText, styles[`headerText${theme}`], { marginLeft:20 }]}>No Activity Found...</Text>]);
				}
			} else {
				events = sortActivity(events);

				let data = [];

				let index = 0;

				Object.keys(events).map(txID => {
					index += 1;

					let activity = events[txID];
		
					let id = activity.id;
					let symbol = activity.symbol.toUpperCase();
					let date = activity.date;
					let amount = activity.amount;
					let fee = activity.fee?.toString();
					let notes = activity.notes;
					let type = capitalizeFirstLetter(activity.type);
					let exchange = activity.exchange;
					let pair = activity.pair;
					let price = activity.price?.toString();
					let from = activity.from;
					let to = activity.to;

					data.push(
						<TouchableOpacity onPress={() => { setEventID(txID); setCoinID(id); setCoinSymbol(symbol); setEventDate(date); setEventType(type.toLowerCase()); setCoinAmount(amount); setEventFee(fee); setEventNotes(notes); setEventExchange(exchange); setCoinPair(pair); setCoinPrice(price); setEventFrom(from); setEventTo(to); setAction("update"); setModal(true)}} key={epoch() + txID}>
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
		}
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