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

	const loadingText = "Loading...";

	const [pageKey, setPageKey] = React.useState(epoch());

	const [refreshing, setRefreshing] = React.useState(false);

	const [modal, setModal] = React.useState(false);
	const [modalMessage, setModalMessage] = React.useState();
	const [action, setAction] = React.useState("create");

	const [activityData, setActivityData] = React.useState([<Text key="loading" style={[styles.loadingText, styles.headerText, styles[`headerText${theme}`]]}>Loading...</Text>]);

	useEffect(() => {
		setInterval(() => {
			if(navigation.isFocused()) {
				getActivity();
			}
		}, 15000)
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
			<Modal animationType="fade" visible={modal} onRequestClose={() => { setAction("create"); setModalMessage(); setModal(false)}} transparent={false}>
				<View style={[styles.modalWrapper, styles[`modalWrapper${theme}`]]}>
					<View stlye={[styles.modal, styles[`modal${theme}`]]}>
						<View style={styles.buttonWrapper}>
							<TouchableOpacity style={[styles.button, styles[`button${theme}`]]} onPress={() => { setAction("create"); setModalMessage(); setModal(false)}}>
								<Text style={styles.text}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity style={[styles.button, styles.buttonConfirm, styles[`buttonConfirm${theme}`]]} onPress={() => { }}>
								<Text style={styles.text}>Confirm</Text>
							</TouchableOpacity>
						</View>
						{ !empty(modalMessage) &&
							<View style={styles.modalMessageWrapper}>
								<Text style={styles.modalMessage}>{modalMessage}</Text>
							</View>
						}
					</View>
					{ action !== "create" &&
						<TouchableOpacity style={[styles.button, styles.buttonDelete]} onPress={() => { deleteActivity(txID)}}>
							<Text style={styles.text}>Remove Activity</Text>
						</TouchableOpacity>
					}
				</View>
			</Modal>
			<ScrollView ref={activityRef} style={[styles.tableWrapper, styles[`tableWrapper${theme}`]]} contentContainerStyle={{ paddingTop:10, paddingBottom:10 }} nestedScrollEnabled={true}>
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

	async function createActivity(id, amount) {
		if(!empty(id) && !empty(amount) && !isNaN(amount)) {
			setModalMessage("Checking coin...");

			let key = "symbol";
			let value = id.trim().toLowerCase();

			if(action === "update") {
				key = "id";
			}

			getCoinID(key, value).then(async response => {
				if("id" in response) {
					processHolding(response.id, amount);
				} else if("matches" in response) {
					let matches = response.matches;

					let data = [];

					Object.keys(matches).map(key => {
						let match = matches[key];
						let symbol = Object.keys(match)[0];
						let id = match[symbol];

						data.push(
							<TouchableOpacity key={epoch() + id} onPress={() => { processHolding(id, amount) }}>
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

	async function processActivity(id, amount) {
		let api = await AsyncStorage.getItem("api");
		let token = await AsyncStorage.getItem("token");

		let endpoint = "https://api.coingecko.com/api/v3/coins/" + id;

		fetch(endpoint, {
			method: "GET",
			headers: {
				Accept: "application/json", "Content-Type": "application/json"
			}
		})
		.then((response) => {
			return response.json();
		})
		.then(async (coin) => {
			if(!empty(coin.error)) {
				setModalMessage("Coin not found. Make sure the ID is right.");
			} else {
				let symbol = coin.symbol;

				let endpoint = api + "holdings/create.php";
				let method = "POST";
				let body = { token:token, id:id, symbol:symbol, amount:amount };

				if(action === "update") {
					endpoint = api + "holdings/update.php";
					method = "PUT";
					body = { token:token, id:id, amount:amount };
				}

				fetch(endpoint, {
					method: method,
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
						setModal(false);
						setModalMessage();
						setAction("create");
						setCoinID();
						setCoinSymbol();
						setCoinAmount();
						setShowCoinList(false);
						setCoinList();
						getHoldings();
					} else {
						setModalMessage(response.error);
					}
				}).catch(error => {
					console.log(error);
				});
			}
		}).catch(error => {
			console.log(error);
		});
	}

	async function deleteActivity(id) {
		if(!empty(id)) {
			id = id.toLowerCase().replaceAll(" ", "-");

			let api = await AsyncStorage.getItem("api");
			let token = await AsyncStorage.getItem("token");

			let endpoint = api + "holdings/delete.php";

			let body = { token:token, id:id };

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
					setModal(false);
					setModalMessage();
					setAction("create");
					setCoinID();
					setCoinSymbol();
					setCoinAmount();
					setShowCoinList(false);
					setCoinList();
					getHoldings();
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
					setActivityData([<Text key="empty" style={[styles.headerText, styles[`headerText${theme}`], { marginLeft:20 }]}>No Activity Found.</Text>]);
				}
			} else {
				let data = [];

				
			}
		}).catch(error => {
			console.log(arguments.callee.name + " - " + error);
		});
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
	modalWrapper: {
		width:"100%",
		height:"100%",
		flex:1,
		justifyContent:"center",
		alignItems:"center",
		backgroundColor:globalColors["Light"].mainThird
	},
	modalWrapperDark: {
		backgroundColor:globalColors["Dark"].mainThird
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
		width:screenWidth - 200,
		padding:10,
		marginTop:20,
	},
	modalMessage: {
		color:globalColors["Light"].accentContrast,
		fontSize:16,
		fontFamily:globalStyles.fontFamily,
		lineHeight:25,
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
		width:screenWidth - 200,
	},
	inputDark: {
		backgroundColor:globalColors["Dark"].mainFirst,
		color:globalColors["Dark"].mainContrast
	},
	buttonWrapper: {
		width:screenWidth - 200,
		flexDirection:"row"
	},
	button: {
		height:40,
		width:((screenWidth - 200) / 2) - 10,
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
		position:"absolute",
		bottom:70,
		backgroundColor:"rgb(230,50,50)",
		width:"auto",
		marginTop:20,
		paddingLeft:14,
		paddingRight:14,
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
		paddingTop:8,
		paddingBottom:8,
		paddingLeft:20,
	},
	rowOdd: {
		backgroundColor:globalColors["Light"].mainSecond,
	},
	rowOddDark: {
		backgroundColor:globalColors["Dark"].mainSecond,
	},
	loadingText: {
		marginLeft:20,
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
	headerRank: {
		width:30
	},
	headerCoin: {
		width:100,
		marginLeft:15,
	},
	headerAmount: {
		width:100
	},
	cellText: {
		color:globalColors["Light"].mainContrastLight
	},
	cellTextDark: {
		color:globalColors["Dark"].mainContrastLight
	},
	cellRank: {
		width:30
	},
	cellSymbol: {
		width:74
	},
	cellAmount: {
		width:100,
	},
	cellImage: {
		width:30,
		height:30,
		marginRight:10,
		borderRadius:15,
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