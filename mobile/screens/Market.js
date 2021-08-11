import React, { useEffect } from "react";
import { Text, StyleSheet, View, Image, Dimensions, ScrollView, RefreshControl, TouchableOpacity, Modal } from "react-native";
import { StatusBar } from "expo-status-bar";
import Icon from "react-native-vector-icons/FontAwesome5";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stop, LinearGradient as SVGLinearGradient } from "react-native-svg";
import LinearGradient from "react-native-linear-gradient";
import { LineChart } from 'react-native-chart-kit';
import HTML from "react-native-render-html";
import { globalColors, globalStyles } from "../styles/global";
import { ThemeContext } from "../utils/theme";
import { empty, separateThousands, abbreviateNumber, epoch, wait, currencies, replaceAll, formatDate, capitalizeFirstLetter, formatDateHuman, previousYear } from "../utils/utils";
import GradientChart from "../components/GradientChart";
import styles from "../styles/Market";
import { getWatchlist, createWatchlist, deleteWatchlist } from "../utils/requests";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

const gradientColor = () => {
	return (
		<SVGLinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
			<Stop offset="0" stopColor="#feac5e" stopOpacity="1" />
			<Stop offset="0.5" stopColor="#c779d0" stopOpacity="1" />
			<Stop offset="1" stopColor="#4bc0c8" stopOpacity="1" />
		</SVGLinearGradient>
	);
}

export default function Market({ navigation }) {
	const { theme } = React.useContext(ThemeContext);

	const marketRef = React.createRef();

	const loadingText = "Loading...";

	const [pageKey, setPageKey] = React.useState(epoch());

	const [modal, setModal] = React.useState(false);
	const [modalATH, setModalATH] = React.useState("All-Time High: ...");
	const [modalMessage, setModalMessage] = React.useState("Loading Chart...");
	const [modalDescription, setModalDescription] = React.useState("<div>Loading Description...</div>");
	const [modalWatchlist, setModalWatchlist] = React.useState();
	const [chartLabels, setChartLabels] = React.useState();
	const [chartData, setChartData] = React.useState();
	const [chartSegments, setChartSegments] = React.useState(1);
	const [userCurrency, setUserCurrency] = React.useState("$");

	const [coinID, setCoinID] = React.useState();
	const [coinSymbol, setCoinSymbol] = React.useState();

	const [refreshing, setRefreshing] = React.useState(false);

	const [highlightPriceChangeState, setHighlightPriceChangeState] = React.useState("disabled");

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
					setPageKey(epoch());
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
	}, [theme, highlightPriceChangeState]);

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
											yAxisLabel={empty(userCurrency) ? "$" : userCurrency}
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
											gradient={gradientColor()}
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
							{ !empty(modalWatchlist) && !modalWatchlist &&
								<TouchableOpacity style={[styles.modalDescriptionWrapper, styles[`modalDescriptionWrapper${theme}`], { width:220 }]} onPress={() => { createWatchlist(coinID, coinSymbol); setModalWatchlist(true)}}>
									<Text style={[styles.modalDescription, styles[`modalDescription${theme}`]]}>Add To Watchlist</Text>
								</TouchableOpacity>
							}
							{ modalWatchlist &&
								<TouchableOpacity style={[styles.modalDescriptionWrapper, styles[`modalDescriptionWrapper${theme}`], { width:220 }]} onPress={() => { deleteWatchlist(coinID); setModalWatchlist(false)}}>
									<Text style={[styles.modalDescription, styles[`modalDescription${theme}`]]}>Remove From Watchlist</Text>
								</TouchableOpacity>
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
		setModalWatchlist();
		setModal(false);
	}

	async function openModal(id, symbol, currentPrice) {
		setChartData();
		setChartLabels();
		setModalATH("All-Time High: ...");
		setModalDescription("<div>Loading Description...</div>");
		setModalWatchlist();
		
		let currency = await AsyncStorage.getItem("currency");
		if(empty(currency)) {
			currency = "usd";
		}

		setUserCurrency(currencies[currency]);

		setModalMessage("Loading Chart...");
		setModal(true);

		getCoinInfo(id).then(async info => {
			getCoinMarketData(id, currency, previousYear(new Date()), new Date()).then(async data => {
				data = parseMarketData(data, new Date().getTime(), currentPrice);

				if(empty(info.description.en)) {
					info.description.en = "No description found for " + symbol.toUpperCase() + ".";
				}

				if(Object.keys(await getWatchlist()).includes(id)) {
					setModalWatchlist(true);
				} else {
					setModalWatchlist(false);
				}

				setCoinID(id);
				setCoinSymbol(info.symbol);

				let months = data.months;
				let prices = data.prices;

				setChartLabels(months);
				setChartData(prices);
				setChartSegments(4);

				let ath = parseFloat(info.market_data.ath[currency]);

				if(ath > 1) {
					ath = separateThousands(ath.toFixed(2));
				}

				setModalATH("All-Time High: " + currencies[currency] + ath + " (" + formatDateHuman(new Date(Date.parse(info.market_data.ath_date[currency]))).replaceAll(" ", "") + ")");

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

		let highlightPriceChange = await AsyncStorage.getItem("highlightPriceChange");
		if(empty(highlightPriceChange)) {
			highlightPriceChange = "disabled";
		}

		if(highlightPriceChangeState !== highlightPriceChange) {
			setHighlightPriceChangeState(highlightPriceChange);
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
				let change = parseFloat(coin.market_cap_change_percentage_24h);
				let cap = separateThousands(abbreviateNumber(parseFloat(coin.market_cap), 2));

				if(price > 1) {
					price = separateThousands(price);
				}

				let icon = coin.image;

				let id = coin.id;
				let symbol = coin.symbol.toUpperCase();

				let changeType = "";
				if(change > 0) {
					changeType = "Positive";
				} else if(change === 0) {
					changeType = "None"
				} else {
					changeType = "Negative";
				}

				let highlightRow = `rowHighlight${capitalizeFirstLetter(highlightPriceChange)}${changeType}${theme}`;
				let highlightText = `cellHighlight${capitalizeFirstLetter(highlightPriceChange)}${changeType}${theme}`;

				data.push(
					<TouchableOpacity key={epoch() + key} onPress={() => { openModal(id, symbol, coin.current_price)}}>
						<View style={[styles.row, rank % 2 ? {...styles.rowOdd, ...styles[`rowOdd${theme}`]} : null, styles[highlightRow]]}>
							<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellRank, styles[highlightText]]} ellipsizeMode="tail">{rank}</Text>
							<Image style={styles.cellImage} source={{uri:icon}}/>
							<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellSymbol, styles[highlightText]]} ellipsizeMode="tail">{symbol}</Text>
							<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellPrice, styles[highlightText]]} ellipsizeMode="tail">{currencies[currency] + price}</Text>
							<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellCap, styles[highlightText]]} ellipsizeMode="tail">{currencies[currency] + cap}</Text>
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
}