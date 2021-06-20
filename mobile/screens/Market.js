import React, { useEffect } from "react";
import { Text, StyleSheet, View, Image, Dimensions, ScrollView, RefreshControl, TouchableOpacity, Modal } from "react-native";
import { StatusBar } from "expo-status-bar";
import Icon from "react-native-vector-icons/FontAwesome5";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";
import { LineChart } from 'react-native-chart-kit';
import HTML from "react-native-render-html";
import { globalColors, globalStyles } from "../styles/global";
import { ThemeContext } from "../utils/theme";
import { empty, separateThousands, abbreviateNumber, epoch, wait, currencies, replaceAll } from "../utils/utils";
import GradientChart from "../components/GradientChart";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

export default function Market({ navigation }) {
	const { theme } = React.useContext(ThemeContext);

	const marketRef = React.createRef();

	const loadingText = "Loading...";

	const [pageKey, setPageKey] = React.useState(epoch());

	const [modal, setModal] = React.useState(false);
	const [modalATH, setModalATH] = React.useState("All-Time High: ...");
	const [modalMessage, setModalMessage] = React.useState("Loading Chart...");
	const [modalDescription, setModalDescription] = React.useState("<div>Loading Description...</div>");
	const [chartLabels, setChartLabels] = React.useState();
	const [chartData, setChartData] = React.useState();
	const [chartSegments, setChartSegments] = React.useState(1);

	const [refreshing, setRefreshing] = React.useState(false);

	const [marketCap, setMarketCap] = React.useState(loadingText);
	const [marketChange, setMarketChange] = React.useState();
	const [volume, setVolume] = React.useState(loadingText);

	const [marketData, setMarketData] = React.useState([<Text key="loading" style={[styles.loadingText, styles.headerText, styles[`headerText${theme}`]]}>Loading...</Text>]);

	useEffect(() => {
		// setInterval(() => {
		// 	if(navigation.isFocused()) {
		// 		getMarket();
		// 		getGlobal();
		// 	}
		// }, 15000);

		navigation.addListener("focus", () => {
			if(navigation.isFocused()) {
				setTimeout(() => {
					getMarket();
					getGlobal();
				}, 500);
			}
		});
	}, []);

	useEffect(() => {
		setMarketData([<Text key="loading" style={[styles.loadingText, styles.headerText, styles[`headerText${theme}`]]}>Loading...</Text>]);

		setPageKey(epoch());

		getMarket();
		getGlobal();
	}, [theme]);

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		getMarket();
		getGlobal();
		wait(750).then(() => setRefreshing(false));
	}, []);

	return (
		<ScrollView style={[styles.page, styles[`page${theme}`]]} key={pageKey} contentContainerStyle={{ padding:20 }} nestedScrollEnabled={true} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[globalColors[theme].accentFirst]} progressBackgroundColor={globalColors[theme].mainFirst}/>}>
			<Modal animationType="fade" visible={modal} onRequestClose={() => { hideModal()}} transparent={false}>
				<ScrollView style={[styles.modalScroll, styles[`modalScroll${theme}`]]} contentContainerStyle={{paddingBottom:20}}>
					<View style={[styles.modalWrapper, styles[`modalWrapper${theme}`]]}>
						<View stlye={[styles.modal, styles[`modal${theme}`]]}>
							<View style={[styles.chartWrapper, styles[`modal${theme}`]]}>
								<ScrollView horizontal={true} style={{ height:300 }}>
									{ !empty(chartData) && !empty(chartLabels) ? 
										<GradientChart
											data={{
												labels: chartLabels,
												datasets: [
													{
														data: chartData
													}
												]
											}}
											width={1400}
											height={300}
											segments={chartSegments}
											withHorizontalLines={true}
											withVerticalLines={false}
											withVerticalLabels={true}
											yAxisLabel="$"
											yAxisInterval={500}
											formatYLabel={(label) => abbreviateNumber(parseFloat(label), 2)}
											withShadow={false}
											chartConfig={{
												backgroundColor: "rgba(0,0,0,0)",
												backgroundGradientFrom: "rgba(0,0,0,0)",
												backgroundGradientTo: "rgba(0,0,0,0)",
												decimalPlaces: 2,
												color: () => "url(#gradient)",
												labelColor: () => globalColors[theme].mainContrast,
												style: {
													borderRadius: 0
												},
												propsForDots: {
													r: "0",
													strokeWidth: "2",
													stroke: globalColors[theme].mainFifth
												},
												propsForVerticalLabels: {
													fontFamily: globalStyles.fontFamily,
													fontSize: 12,
													rotation: 0,
													fontWeight: "bold",
												},
												propsForBackgroundLines: {
													strokeWidth: 2,
													stroke: globalColors[theme].mainThirdTransparent
												}
											}}
											bezier
											style={{
												backgroundColor: "rgba(255,255,255,0)",
											}}
										/>
									: 
										<View style={{ height:320, width:screenWidth }}></View>
									}
								</ScrollView>
							</View>
							{ !empty(modalMessage) &&
								<View style={styles.modalMessageWrapper}>
									<Text style={styles.modalMessage}>{modalMessage}</Text>
								</View>
							}
							<View style={[styles.modalDescriptionWrapper, styles[`modalDescriptionWrapper${theme}`]]}>
								<Text style={[styles.modalDescription, styles[`modalDescription${theme}`]]}>{modalATH}</Text>
							</View>
							<View style={[styles.modalDescriptionWrapper, styles[`modalDescriptionWrapper${theme}`]]}>
								<HTML style={[styles.modalDescription, styles[`modalDescription${theme}`]]} source={{html:modalDescription}} tagsStyles={{ a: { color:globalColors[theme].accentThird, fontSize:16, fontFamily:globalStyles.fontFamily }, div: { color:globalColors[theme].mainContrast, fontSize:16, fontFamily:globalStyles.fontFamily }}}/>
							</View>
							<View style={styles.buttonWrapper}>
								<TouchableOpacity style={[styles.button, styles[`button${theme}`]]} onPress={() => { hideModal()}}>
									<Text style={styles.text}>Close</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</ScrollView>
			</Modal>
			<LinearGradient style={[styles.card, { marginBottom:20, marginTop:0 }]} colors={globalColors[theme].colorfulGradient} useAngle={true} angle={45}>
				<Text style={[styles.cardText, styles[`cardText${theme}`]]}>{marketCap} {marketChange}</Text>
			</LinearGradient>
			<ScrollView ref={marketRef} style={[styles.tableWrapper, styles[`tableWrapper${theme}`]]} contentContainerStyle={{ paddingTop:10, paddingBottom:10 }} nestedScrollEnabled={true}>
				{ !empty(marketData) &&
					marketData.map(row => {
						return row;
					})
				}
			</ScrollView>
			<LinearGradient style={[styles.card, { marginTop:20 }]} colors={globalColors[theme].orangeGradient} useAngle={true} angle={45}>
				<Text style={[styles.cardText, styles[`cardText${theme}`]]}>{volume}</Text>
			</LinearGradient>
			<StatusBar style={theme === "Dark" ? "light" : "dark"}/>
		</ScrollView>
	);

	function hideModal() {
		setChartData();
		setChartLabels();
		setModalATH("All-Time High: ...");
		setModalDescription("<div>Loading Description...</div>");
		setModal(false);
	}

	async function openModal(id, symbol, currentPrice) {
		let currency = await AsyncStorage.getItem("currency");
		if(empty(currency)) {
			currency = "usd";
		}

		setModalMessage("Loading Chart...");
		setModal(true);

		getCoinInfo(id).then(info => {
			getCoinMarketData(id, currency, previousYear(new Date()), new Date()).then(data => {
				data = parseMarketData(data, new Date().getTime(), currentPrice);

				if(empty(info.description.en)) {
					info.description.en = "No description found for " + symbol.toUpperCase() + ".";
				}

				let months = data.months;
				let prices = data.prices;

				setChartLabels(months);
				setChartData(prices);
				setChartSegments(4);

				let ath = parseFloat(info.market_data.ath[currency]);

				if(ath > 1) {
					ath = separateThousands(ath.toFixed(2));
				}

				setModalATH("All-Time High: " + currencies[currency] + ath);

				setModalMessage();
				setModalDescription("<div>" + info.description.en.replaceAll("\n", "<br>") + "</div>");
			}).catch(error => {
				console.log(error);
			});
		}).catch(error => {
			console.log(error);
		});
	}

	function parseMarketData(data, currentTime, currentPrice) {
		let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		let prices = data.prices;

		prices.push([currentTime, currentPrice]);

		let parsed = {
			labels: [],
			tooltips: [],
			prices: [],
			months: []
		};

		Object.keys(prices).map(key => {
			let time = prices[key][0];
			let price = parseFloat(prices[key][1]);

			parsed.labels.push(new Date(time));
			parsed.tooltips.push(formatDateHuman(new Date(time)));
			parsed.prices.push(price);

			let date = new Date(time);
			let month = date.getMonth();
			let monthName = months[month];

			let lastMonth = parsed.months.slice(key - 31, key);
			if(key - 31 < 0) {
				lastMonth = parsed.months.slice(0, key);
			}

			if(!lastMonth.includes(monthName)) {
				parsed.months.push(monthName);
			} else {
				parsed.months.push("");
			}
		});

		return parsed;
	}

	async function getMarket() {
		console.log("Market - Getting Market - " + epoch());

		let currency = await AsyncStorage.getItem("currency");
		if(empty(currency)) {
			currency = "usd";
		}

		let theme = empty(await AsyncStorage.getItem("theme")) ? "Light" : await AsyncStorage.getItem("theme");

		let endpoint = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + currency + "&order=market_cap_desc&per_page=200&page=1&sparkline=false";

		fetch(endpoint, {
			method: "GET",
			headers: {
				Accept: "application/json", "Content-Type": "application/json"
			}
		})
		.then((response) => {
			return response.json();
		})
		.then(async (coins) => {
			let data = [];

			data.push(
				<View style={styles.row} key={epoch() + "market-header"}>
					<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerRank]} ellipsizeMode="tail">#</Text>
					<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerCoin]} ellipsizeMode="tail">Coin</Text>
					<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerPrice]} ellipsizeMode="tail">Price</Text>
					<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerCap]} ellipsizeMode="tail">Cap</Text>
				</View>
			);

			let keys = Object.keys(coins);

			let rank = 0;

			keys.map(key => {
				rank += 1;

				let coin = coins[key];
				let price = parseFloat(coin.current_price);
				let cap = separateThousands(abbreviateNumber(parseFloat(coin.market_cap), 2));

				if(price > 1) {
					price = separateThousands(price);
				}

				let icon = coin.image;

				let id = coin.id;
				let symbol = coin.symbol.toUpperCase();

				data.push(
					<TouchableOpacity key={epoch() + key} onPress={() => { openModal(id, symbol, coin.current_price)}}>
						<View style={[styles.row, rank % 2 ? {...styles.rowOdd, ...styles[`rowOdd${theme}`]} : null]}>
							<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellRank]} ellipsizeMode="tail">{rank}</Text>
							<Image style={styles.cellImage} source={{uri:icon}}/>
							<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellSymbol]} ellipsizeMode="tail">{symbol}</Text>
							<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellPrice]} ellipsizeMode="tail">{currencies[currency] + price}</Text>
							<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellCap]} ellipsizeMode="tail">{currencies[currency] + cap}</Text>
						</View>
					</TouchableOpacity>
				);
			});

			if(navigation.isFocused()) {
				setMarketData(data);
			}
		}).catch(error => {
			console.log(error);
		});
	}

	async function getGlobal() {
		console.log("Market - Getting Global - " + epoch());

		let endpoint = "https://api.coingecko.com/api/v3/global";

		fetch(endpoint, {
			method: "GET",
			headers: {
				Accept: "application/json", "Content-Type": "application/json"
			}
		})
		.then((response) => {
			return response.json();
		})
		.then(async (global) => {
			let currency = await AsyncStorage.getItem("currency");
			if(empty(currency)) {
				currency = "usd";
			}

			let marketCap = (global.data.total_market_cap[currency]).toFixed(0);
			let marketChange = (global.data.market_cap_change_percentage_24h_usd).toFixed(1);
			let volume = (global.data.total_volume[currency]).toFixed(0);

			if(screenWidth < 380) {
				marketCap = abbreviateNumber(marketCap, 3);
				volume = abbreviateNumber(volume, 0);
			}
			
			if(navigation.isFocused()) {
				setMarketCap(currencies[currency] + separateThousands(marketCap));
				setMarketChange("(" + marketChange + "%)");
				setVolume(currencies[currency] + separateThousands(volume) + " (24h)");
			}
		}).catch(error => {
			console.log(error);
		});
	}

	function getCoinInfo(id) {
		return new Promise((resolve, reject) => {
			console.log("Market - Getting Coin Info - " + epoch());

			let endpoint = "https://api.coingecko.com/api/v3/coins/" + id + "?localization=false&market_data=true";

			fetch(endpoint, {
				method: "GET",
				headers: {
					Accept: "application/json", "Content-Type": "application/json"
				}
			})
			.then((response) => {
				return response.json();
			})
			.then(async (info) => {
				resolve(info);
			})
			.catch(error => {
				reject(error);
			});
		});
	}

	function getCoinMarketData(id, currency, from, to) {
		return new Promise((resolve, reject) => {
			console.log("Market - Getting Coin Market Data - " + epoch());

			let endpoint = "https://api.coingecko.com/api/v3/coins/" + id + "/market_chart/range?vs_currency=" + currency + "&from=" + new Date(Date.parse(from)).getTime() / 1000 + "&to=" + new Date(Date.parse(to)).getTime() / 1000;

			fetch(endpoint, {
				method: "GET",
				headers: {
					Accept: "application/json", "Content-Type": "application/json"
				}
			})
			.then((response) => {
				return response.json();
			})
			.then(async (info) => {
				resolve(info);
			})
			.catch(error => {
				reject(error);
			});
		});
	}

	function formatHour(date) {
		let hours = ("00" + date.getHours()).slice(-2);
		let minutes = ("00" + date.getMinutes()).slice(-2);
		return hours + ":" + minutes;
	}

	function formatDate(date) {
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let year = date.getFullYear();
		return year + " / " + month + " / " + day;
	}

	function formatDateHuman(date) {
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let year = date.getFullYear();
		return day + " / " + month + " / " + year;
	}

	function previousYear(date) {
		let day = date.getDate();
		let month = date.getMonth() + 1;
		let year = date.getFullYear() - 1;
		return new Date(Date.parse(year + "-" + month + "-" + day));
	}

	function previousMonth(date) {
		return new Date(date.getTime() - 2592000 * 1000);
	}

	function previousWeek(date) {
		return new Date(date.getTime() - (60 * 60 * 24 * 6 * 1000));
	}
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
		height:"100%",
		flex:1,
		justifyContent:"flex-start",
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
		alignSelf:"center",
		backgroundColor:globalColors["Light"].accentFirst,
		borderRadius:globalStyles.borderRadius,
		width:200,
		alignItems:"center",
		padding:10,
		marginTop:20,
	},
	modalMessage: {
		color:globalColors["Light"].accentContrast,
		fontSize:16,
		fontFamily:globalStyles.fontFamily,
		lineHeight:25,
	},
	modalDescriptionWrapper: {
		alignSelf:"center",
		backgroundColor:globalColors["Light"].mainThird,
		borderRadius:globalStyles.borderRadius,
		width:screenWidth - 40,
		alignItems:"center",
		padding:10,
		marginTop:20,
	},
	modalDescriptionWrapperDark: {
		backgroundColor:globalColors["Dark"].mainFirst,
	},
	modalDescription: {
		color:globalColors["Light"].mainContrast,
		fontSize:16,
		fontFamily:globalStyles.fontFamily,
		lineHeight:25,
	},
	modalDescriptionDark: {
		color:globalColors["Dark"].mainContrast
	},
	chartWrapper: {
		height:320,
		paddingTop:30,
		width:"100%",
		backgroundColor:globalColors["Light"].mainThird
	},
	chartWrapperDark: {
		backgroundColor:globalColors["Dark"].mainFirst
	},
	buttonWrapper: {
		width:screenWidth - 40,
		marginTop:20,
		alignSelf:"center",
		flexDirection:"row",
		justifyContent:"center",
		alignItems:"center"
	},
	button: {
		height:40,
		width:120,
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
		maxHeight:screenHeight - 390,
		height:screenHeight - 390,
	},
	tableWrapperDark: {
		backgroundColor:globalColors["Dark"].mainFirst
	},
	row: {
		flexDirection:"row",
		alignItems:"center",
		paddingLeft:4,
		paddingTop:8,
		paddingBottom:8,
	},
	rowOdd: {
		backgroundColor:globalColors["Light"].mainSecond,
	},
	rowOddDark: {
		backgroundColor:globalColors["Dark"].mainSecond,
	},
	loadingText: {
		marginLeft:20
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
		width:50,
		paddingLeft:20,
	},
	headerCoin: {
		width:100,
		marginLeft:15,
	},
	headerPrice: {
		width:100,
	},
	cellText: {
		color:globalColors["Light"].mainContrastLight
	},
	cellTextDark: {
		color:globalColors["Dark"].mainContrastLight
	},
	cellRank: {
		width:50,
		paddingLeft:20
	},
	cellSymbol: {
		width:74
	},
	cellPrice: {
		width:100
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
		marginTop:20,
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