import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import { Text, StyleSheet, View, Image, Dimensions, ScrollView, Modal, TouchableOpacity, TextInput, RefreshControl, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import { Stop, LinearGradient as SVGLinearGradient } from "react-native-svg";
import LinearGradient from "react-native-linear-gradient";
import moment from "moment";
import { globalColors, globalStyles } from "../styles/global";
import { ThemeContext } from "../utils/theme";
import { getCoinID } from "../utils/requests";
import GradientChart from "../components/GradientChart";
import { empty, separateThousands, abbreviateNumber, epoch, capitalizeFirstLetter, wait, currencies, validJSON, previousYear, formatDate, formatDateHuman, formatDateHyphenated } from "../utils/utils";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

const gradientColor = () => {
	return (
		<SVGLinearGradient id="gradient" x1="1" y1="0" x2="0" y2="1">
			<Stop offset="0" stopColor="#11998e" stopOpacity="1" />
			<Stop offset="1" stopColor="#38ef7d" stopOpacity="1" />
		</SVGLinearGradient>
	);
}

export default function Holdings({ navigation }) {
	const { theme } = React.useContext(ThemeContext);

	const holdingsRef = React.createRef();

	const loadingText = "Loading...";

	const [pageKey, setPageKey] = React.useState(epoch());
	const [holdingsKey, setHoldingsKey] = React.useState(epoch());

	const [refreshing, setRefreshing] = React.useState(false);

	const [transactionsAffectHoldingsState, setTransactionsAffectHoldingsState] = React.useState("disabled");
	const [highlightPriceChangeState, setHighlightPriceChangeState] = React.useState("disabled");

	const [modal, setModal] = React.useState(false);
	const [modalMessage, setModalMessage] = React.useState();
	const [action, setAction] = React.useState("create");
	const [coinID, setCoinID] = React.useState();
	const [coinSymbol, setCoinSymbol] = React.useState();
	const [coinAmount, setCoinAmount] = React.useState();
	const [showCoinList, setShowCoinList] = React.useState(false);
	const [coinList, setCoinList] = React.useState();

	const [holdingsCache, setHoldingsCache] = React.useState();
	const [chartModal, setChartModal] = React.useState(false);
	const [chartModalMessage, setChartModalMessage] = React.useState();
	const [chartLabels, setChartLabels] = React.useState();
	const [chartDataset, setChartDataset] = React.useState();
	const [chartSegments, setChartSegments] = React.useState(1);
	const [chartStats, setChartStats] = React.useState();
	const [userCurrency, setUserCurrency] = React.useState("$");

	const [holdingsValue, setHoldingsValue] = React.useState(loadingText);

	const [holdingsData, setHoldingsData] = React.useState([<Text key="loading" style={[styles.loadingText, styles.headerText, styles[`headerText${theme}`]]}>Loading...</Text>]);

	useEffect(() => {
		// setInterval(() => {
		// 	if(navigation.isFocused()) {
		// 		getHoldings();
		// 	}
		// }, 10000);

		navigation.addListener("focus", () => {
			if(navigation.isFocused()) {
				setTimeout(() => {
					setPageKey(epoch());
					getHoldings();
				}, 500);
			}
		});
	}, []);

	useEffect(() => {
		setHoldingsData([<Text key="loading" style={[styles.loadingText, styles.headerText, styles[`headerText${theme}`]]}>Loading...</Text>]);

		setPageKey(epoch());

		getHoldings();
	}, [theme]);

	useEffect(() => {
		setHoldingsKey(epoch());
	}, [theme, transactionsAffectHoldingsState, highlightPriceChangeState]);

	const onRefresh = React.useCallback(() => {
		setRefreshing(true);
		getHoldings();
		wait(750).then(() => setRefreshing(false));
	}, []);

	return (
		<ScrollView style={[styles.page, styles[`page${theme}`]]} key={pageKey} contentContainerStyle={{ padding:20 }} nestedScrollEnabled={true} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[globalColors[theme].accentFirst]} progressBackgroundColor={globalColors[theme].mainFirst}/>}>
			<Modal animationType="fade" visible={modal} onRequestClose={() => { hideModal()}} transparent={false}>
				<View style={[styles.modalWrapper, styles[`modalWrapper${theme}`]]}>
					<View stlye={[styles.modal, styles[`modal${theme}`]]}>
						<TextInput style={[styles.input, styles[`input${theme}`], (action !== "create") ? { backgroundColor:globalColors[theme].mainFourth, color:globalColors[theme].mainContrastLight } : null]} placeholder={"Coin Symbol... (e.g. BTC)"} onChangeText={(value) => { setCoinSymbol(value)}} value={coinSymbol} placeholderTextColor={globalColors[theme].mainContrastLight} editable={(action === "create")} spellCheck={false}/>
						<TextInput style={[styles.input, styles[`input${theme}`]]} placeholder={"Amount... (e.g. 2.5)"} onChangeText={(value) => { setCoinAmount(value)}} value={coinAmount} placeholderTextColor={globalColors[theme].mainContrastLight} onSubmitEditing={() => createHolding(coinSymbol, coinAmount)}/>
						{ showCoinList && !empty(coinList) &&
							<ScrollView style={[styles.coinList, styles[`coinList${theme}`]]} nestedScrollEnabled={true}>
								{
									coinList.map(row => {
										return row;
									})
								}
							</ScrollView>
						}
						<View style={styles.buttonWrapper}>
							<TouchableOpacity style={[styles.button, styles[`button${theme}`]]} onPress={() => { hideModal()}}>
								<Text style={styles.text}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity style={[styles.button, styles.buttonConfirm, styles[`buttonConfirm${theme}`]]} onPress={() => { action === "create" ? createHolding(coinSymbol, coinAmount) : createHolding(coinID, coinAmount)}}>
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
						<TouchableOpacity style={[styles.button, styles.buttonDelete]} onPress={() => { deleteHolding(coinID)}}>
							<Text style={styles.text}>Remove Asset</Text>
						</TouchableOpacity>
					}
				</View>
			</Modal>
			<Modal animationType="fade" visible={chartModal} onRequestClose={() => { hideChartModal()}} transparent={false}>
				<ScrollView style={[styles.modalScroll, styles[`modalScroll${theme}`]]} contentContainerStyle={{paddingBottom:20}}>
					<View style={[styles.chartModalWrapper, styles[`chartModalWrapper${theme}`]]}>
						<View stlye={[styles.chartModal, styles[`chartModal${theme}`]]}>
							<View style={[styles.chartWrapper, styles[`chartModal${theme}`]]}>
								<ScrollView horizontal={true} style={{ height:300 }}>
									{ !empty(chartDataset) && !empty(chartLabels) ? 
										<GradientChart
											data={{
												labels: chartLabels,
												datasets: [
													{
														data: chartDataset
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
							{ !empty(chartModalMessage) &&
								<View style={styles.chartModalMessageWrapper}>
									<Text style={styles.chartModalMessage}>{chartModalMessage}</Text>
								</View>
							}
							{ !empty(chartStats) &&
								chartStats.map(stat => {
									return stat;
								})
							}
							<View style={styles.chartButtonWrapper}>
								<TouchableOpacity style={[styles.chartButton, styles[`chartButton${theme}`]]} onPress={() => { hideChartModal()}}>
									<Text style={styles.text}>Close</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</ScrollView>
			</Modal>
			<LinearGradient style={[styles.card, { marginBottom:20 }]} colors={globalColors[theme].greenerGradient} useAngle={true} angle={45}>
				<TouchableOpacity onPress={() => { openChartModal()}}>
					<Text style={[styles.cardText, styles[`cardText${theme}`]]}>{holdingsValue}</Text>
				</TouchableOpacity>
			</LinearGradient>
			<ScrollView ref={holdingsRef} style={[styles.tableWrapper, styles[`tableWrapper${theme}`]]} contentContainerStyle={{ paddingTop:10, paddingBottom:10 }} nestedScrollEnabled={true} key={holdingsKey}>
				{ !empty(holdingsData) &&
					holdingsData.map(row => {
						return row;
					})
				}
			</ScrollView>
			<LinearGradient style={[styles.card, { marginTop:20 }]} colors={globalColors[theme].calmGradient} useAngle={true} angle={45}>
				<TouchableOpacity onPress={() => { setAction("create"); setModal(true)}}>
					<Text style={[styles.cardText, styles[`cardText${theme}`]]}>Add Coin</Text>
				</TouchableOpacity>
			</LinearGradient>
			<StatusBar style={theme === "Dark" ? "light" : "dark"}/>
		</ScrollView>
	);

	function hideModal() {
		setAction("create");
		setCoinID();
		setCoinSymbol();
		setCoinAmount();
		setShowCoinList(false);
		setCoinList();
		setModalMessage();
		setModal(false);
	}

	function openModal(transactionsAffectHoldings, action, id, symbol, amount, value) {
		if(transactionsAffectHoldings === "disabled") {
			setAction(action);
			setCoinID(id);
			setCoinSymbol(symbol);
			setCoinAmount(amount);
			setModal(true);
		} else if(transactionsAffectHoldings === "override") {
			openIndividualChartModal(id.toLowerCase(), amount, value);
		}
	}

	function hideChartModal() {
		setChartLabels();
		setChartDataset();
		setChartStats();
		setChartModalMessage();
		setChartModal(false);
	}

	async function openChartModal() {
		let transactionsAffectHoldings = await AsyncStorage.getItem("transactionsAffectHoldings");
		if(empty(transactionsAffectHoldings)) {
			transactionsAffectHoldings = "disabled";
		}

		if(transactionsAffectHoldings === "override") {
			try {
				setChartLabels();
				setChartDataset();
				setChartStats();

				setChartModalMessage("Loading... This might take a while. Don't touch anything.");
				setChartModal(true);

				let currency = await AsyncStorage.getItem("currency");
				if(empty(currency)) {
					currency = "usd";
				}

				let chartData = await getChartData(currency);
				let startDate = chartData.startDate;
				chartData = chartData.chartData;

				let today = formatDate(new Date()).replaceAll(" ", "");

				delete chartData[today];

				if(!(today in chartData) || empty(chartData[today]) || isNaN(chartData[today].holdingsValue)) {
					if(!empty(holdingsCache)) {
						chartData[today] = { holdingsValue:0 };

						let keys = Object.keys(holdingsCache);

						keys.map(id => {
							chartData[today][id] = parseFloat(holdingsCache[id].amount);
							chartData[today].holdingsValue += parseFloat(holdingsCache[id].value);
						});
					}
				}

				let labels = [];
				let values = [];

				let dates = Object.keys(chartData);
			
				for(let i = startDate; i < dates.length; i++) {
					let date = dates[i];

					labels.push(new Date(Date.parse(date.replaceAll("/", "-"))));

					if(chartData[date].holdingsValue < 0) {
						values.push(0);
					} else {
						values.push(chartData[date].holdingsValue);
					}
				}

				labels = parseChartLabels(labels);

				setChartLabels(labels);
				setChartDataset(values);
			
				let currentValue = chartData[today].holdingsValue;

				let value0d = values.length >= 1 ? values[values.length - 1] : "-";
				let value1d = values.length >= 2 ? values[values.length - 2] : "-";
				let value1w = values.length >= 7 ? values[values.length - 8] : "-";
				let value1m = values.length >= 30 ? values[values.length - 31] : "-";
				let value3m = values.length >= 90 ? values[values.length - 91] : "-";
				let value6m = values.length >= 180 ? values[values.length - 181] : "-";
				let value1y = values.length >= 365 ? values[values.length - 366] : "-";

				let stats = [];

				if(!isNaN(value0d) && value0d > 1) {
					value0d = separateThousands(value0d.toFixed(2));
					stats.push(
						<View style={[styles.chartModalDescriptionWrapper, styles[`chartModalDescriptionWrapper${theme}`]]} key="value0d">
							<Text style={[styles.chartModalDescription, styles[`chartModalDescription${theme}`]]}>Current ({currencies[currency]}): {value0d}</Text>
						</View>
					);
				}
				if(!isNaN(value1d) && value1d > 1) {
					let style = (currentValue - value1d) === 0 ? "" : (currentValue - value1d) > 0 ? "Positive" : "Negative";
					value1d = separateThousands((currentValue - value1d).toFixed(2));
					stats.push(
						<View style={[styles.chartModalDescriptionWrapper, styles[`chartModalDescriptionWrapper${theme}`]]} key="value1d">
							<Text style={[styles.chartModalDescription, styles[`chartModalDescription${theme}`], styles[`chartModalDescription${style + theme}`]]}>1D ({currencies[currency]}): {value1d}</Text>
						</View>
					);
				}
				if(!isNaN(value1w) && value1w > 1) {
					let style = (currentValue - value1w) === 0 ? "" : (currentValue - value1w) > 0 ? "Positive" : "Negative";
					value1w = separateThousands((currentValue - value1w).toFixed(2));
					stats.push(
						<View style={[styles.chartModalDescriptionWrapper, styles[`chartModalDescriptionWrapper${theme}`]]} key="value1w">
							<Text style={[styles.chartModalDescription, styles[`chartModalDescription${theme}`], styles[`chartModalDescription${style + theme}`]]}>1W ({currencies[currency]}): {value1w}</Text>
						</View>
					);
				}
				if(!isNaN(value1m) && value1m > 1) {
					let style = (currentValue - value1m) === 0 ? "" : (currentValue - value1m) > 0 ? "Positive" : "Negative";
					value1m = separateThousands((currentValue - value1m).toFixed(2));
					stats.push(
						<View style={[styles.chartModalDescriptionWrapper, styles[`chartModalDescriptionWrapper${theme}`]]} key="value1m">
							<Text style={[styles.chartModalDescription, styles[`chartModalDescription${theme}`], styles[`chartModalDescription${style + theme}`]]}>1M ({currencies[currency]}): {value1m}</Text>
						</View>
					);
				}
				if(!isNaN(value3m) && value3m > 1) {
					let style = (currentValue - value3m) === 0 ? "" : (currentValue - value3m) > 0 ? "Positive" : "Negative";
					value3m = separateThousands((currentValue - value3m).toFixed(2));
					stats.push(
						<View style={[styles.chartModalDescriptionWrapper, styles[`chartModalDescriptionWrapper${theme}`]]} key="value3m">
							<Text style={[styles.chartModalDescription, styles[`chartModalDescription${theme}`], styles[`chartModalDescription${style + theme}`]]}>3M ({currencies[currency]}): {value3m}</Text>
						</View>
					);
				}
				if(!isNaN(value6m) && value6m > 1) {
					let style = (currentValue - value6m) === 0 ? "" : (currentValue - value6m) > 0 ? "Positive" : "Negative";
					value6m = separateThousands((currentValue - value6m).toFixed(2));
					stats.push(
						<View style={[styles.chartModalDescriptionWrapper, styles[`chartModalDescriptionWrapper${theme}`]]} key="value6m">
							<Text style={[styles.chartModalDescription, styles[`chartModalDescription${theme}`], styles[`chartModalDescription${style + theme}`]]}>6M ({currencies[currency]}): {value6m}</Text>
						</View>
					);
				}
				if(!isNaN(value1y) && value1y > 1) {
					let style = (currentValue - value1y) === 0 ? "" : (currentValue - value1y) > 0 ? "Positive" : "Negative";
					value1y = separateThousands((currentValue - value1y).toFixed(2));
					stats.push(
						<View style={[styles.chartModalDescriptionWrapper, styles[`chartModalDescriptionWrapper${theme}`]]} key="value1y">
							<Text style={[styles.chartModalDescription, styles[`chartModalDescription${theme}`], styles[`chartModalDescription${style + theme}`]]}>1Y ({currencies[currency]}): {value1y}</Text>
						</View>
					);
				}

				setChartStats(stats);
				setChartModalMessage();
			} catch(error) {
				console.log(error);
				setChartModalMessage("Failed to process data. Please try again.");
			}
		}
	}

	async function openIndividualChartModal(coinID, amount, value) {
		try {
			setChartLabels();
			setChartDataset();
			setChartStats();

			setChartModalMessage("Loading... This might take a while. Don't touch anything.");
			setChartModal(true);

			let currency = await AsyncStorage.getItem("currency");
			if(empty(currency)) {
				currency = "usd";
			}

			let chartData = await getIndividualChartData(coinID, currency);
			let firstEvent = chartData.firstEvent;
			let startDate = chartData.startDate;
			chartData = chartData.chartData;

			let today = formatDate(new Date()).replaceAll(" ", "");

			delete chartData[today];

			if(!(today in chartData) || empty(chartData[today]) || isNaN(chartData[today].holdingsValue)) {
				chartData[today] = { holdingsValue:0 };

				chartData[today][coinID] = parseFloat(amount);
				chartData[today].holdingsValue += parseFloat(value);
			}

			let initialAmount = parseFloat(firstEvent.amount);
			let initialPrice = parseFloat(firstEvent.price);
			if(initialPrice <= 0) {
				let initialDate = moment(firstEvent.date.replaceAll(" / ", "-").replaceAll("/", "-")).format("DD-MM-YYYY");
				let coinPrice = await getCoinPrice(coinID, initialDate);
				initialPrice = coinPrice?.market_data?.current_price[currency];
			}

			let initialValue = initialAmount * initialPrice;

			let labels = [];
			let values = [initialValue];

			let dates = Object.keys(chartData);
		
			for(let i = startDate; i < dates.length; i++) {
				let date = dates[i];

				labels.push(new Date(Date.parse(date.replaceAll("/", "-"))));

				if(chartData[date]?.holdingsValue < 0) {
					values.push(0);
				} else {
					values.push(chartData[date]?.holdingsValue);
				}
			}

			labels = parseChartLabels(labels);

			setChartLabels(labels);
			setChartDataset(values);
		
			let currentValue = chartData[today]?.holdingsValue;

			let value0d = values.length >= 1 ? values[values.length - 1] : "-";
			let value1d = values.length >= 2 ? values[values.length - 2] : "-";
			let value1w = values.length >= 7 ? values[values.length - 8] : "-";
			let value1m = values.length >= 30 ? values[values.length - 31] : "-";
			let value3m = values.length >= 90 ? values[values.length - 91] : "-";
			let value6m = values.length >= 180 ? values[values.length - 181] : "-";
			let value1y = values.length >= 365 ? values[values.length - 366] : "-";
			let valueAll = values[0];

			let stats = [];

			if(!isNaN(value0d) && value0d > 1) {
				value0d = separateThousands(value0d.toFixed(2));
				stats.push(
					<View style={[styles.chartModalDescriptionWrapper, styles[`chartModalDescriptionWrapper${theme}`]]} key="value0d">
						<Text style={[styles.chartModalDescription, styles[`chartModalDescription${theme}`]]}>Current ({currencies[currency]}): {value0d}</Text>
					</View>
				);
			}
			if(!isNaN(value1d) && value1d > 1) {
				let style = (currentValue - value1d) === 0 ? "" : (currentValue - value1d) > 0 ? "Positive" : "Negative";
				value1d = separateThousands((currentValue - value1d).toFixed(2));
				stats.push(
					<View style={[styles.chartModalDescriptionWrapper, styles[`chartModalDescriptionWrapper${theme}`]]} key="value1d">
						<Text style={[styles.chartModalDescription, styles[`chartModalDescription${theme}`], styles[`chartModalDescription${style + theme}`]]}>1D ({currencies[currency]}): {value1d}</Text>
					</View>
				);
			}
			if(!isNaN(value1w) && value1w > 1) {
				let style = (currentValue - value1w) === 0 ? "" : (currentValue - value1w) > 0 ? "Positive" : "Negative";
				value1w = separateThousands((currentValue - value1w).toFixed(2));
				stats.push(
					<View style={[styles.chartModalDescriptionWrapper, styles[`chartModalDescriptionWrapper${theme}`]]} key="value1w">
						<Text style={[styles.chartModalDescription, styles[`chartModalDescription${theme}`], styles[`chartModalDescription${style + theme}`]]}>1W ({currencies[currency]}): {value1w}</Text>
					</View>
				);
			}
			if(!isNaN(value1m) && value1m > 1) {
				let style = (currentValue - value1m) === 0 ? "" : (currentValue - value1m) > 0 ? "Positive" : "Negative";
				value1m = separateThousands((currentValue - value1m).toFixed(2));
				stats.push(
					<View style={[styles.chartModalDescriptionWrapper, styles[`chartModalDescriptionWrapper${theme}`]]} key="value1m">
						<Text style={[styles.chartModalDescription, styles[`chartModalDescription${theme}`], styles[`chartModalDescription${style + theme}`]]}>1M ({currencies[currency]}): {value1m}</Text>
					</View>
				);
			}
			if(!isNaN(value3m) && value3m > 1) {
				let style = (currentValue - value3m) === 0 ? "" : (currentValue - value3m) > 0 ? "Positive" : "Negative";
				value3m = separateThousands((currentValue - value3m).toFixed(2));
				stats.push(
					<View style={[styles.chartModalDescriptionWrapper, styles[`chartModalDescriptionWrapper${theme}`]]} key="value3m">
						<Text style={[styles.chartModalDescription, styles[`chartModalDescription${theme}`], styles[`chartModalDescription${style + theme}`]]}>3M ({currencies[currency]}): {value3m}</Text>
					</View>
				);
			}
			if(!isNaN(value6m) && value6m > 1) {
				let style = (currentValue - value6m) === 0 ? "" : (currentValue - value6m) > 0 ? "Positive" : "Negative";
				value6m = separateThousands((currentValue - value6m).toFixed(2));
				stats.push(
					<View style={[styles.chartModalDescriptionWrapper, styles[`chartModalDescriptionWrapper${theme}`]]} key="value6m">
						<Text style={[styles.chartModalDescription, styles[`chartModalDescription${theme}`], styles[`chartModalDescription${style + theme}`]]}>6M ({currencies[currency]}): {value6m}</Text>
					</View>
				);
			}
			if(!isNaN(value1y) && value1y > 1) {
				let style = (currentValue - value1y) === 0 ? "" : (currentValue - value1y) > 0 ? "Positive" : "Negative";
				value1y = separateThousands((currentValue - value1y).toFixed(2));
				stats.push(
					<View style={[styles.chartModalDescriptionWrapper, styles[`chartModalDescriptionWrapper${theme}`]]} key="value1y">
						<Text style={[styles.chartModalDescription, styles[`chartModalDescription${theme}`], styles[`chartModalDescription${style + theme}`]]}>1Y ({currencies[currency]}): {value1y}</Text>
					</View>
				);
			}
			if(!isNaN(valueAll) && valueAll > 1) {
				let style = (currentValue - valueAll) === 0 ? "" : (currentValue - valueAll) > 0 ? "Positive" : "Negative";
				valueAll = separateThousands((currentValue - valueAll).toFixed(2));
				stats.push(
					<View style={[styles.chartModalDescriptionWrapper, styles[`chartModalDescriptionWrapper${theme}`]]} key="value1y">
						<Text style={[styles.chartModalDescription, styles[`chartModalDescription${theme}`], styles[`chartModalDescription${style + theme}`]]}>All ({currencies[currency]}): {valueAll}</Text>
					</View>
				);
			}

			setChartStats(stats);
			setChartModalMessage();
		} catch(error) {
			console.log(error);
			setChartModalMessage("Failed to process data. Please try again.");
		}
	}

	function parseChartLabels(labels) {
		let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		let parsed = [];

		for(let i = 0; i < labels.length; i++) {
			let date = labels[i];
			let month = date.getMonth();
			let monthName = months[month];

			let lastMonth = parsed.slice(i - 31, i);
			if(i - 31 < 0) {
				lastMonth = parsed.slice(0, i);
			}

			if(!lastMonth.includes(monthName)) {
				parsed.push(monthName);
			} else {
				parsed.push("");
			}
		}

		return parsed;
	}

	async function getChartData(currency) {
		return new Promise((resolve, reject) => {
			getActivity().then(events => {
				let coins = [];

				let chartData = {};

				let startDate = previousYear(new Date()).getTime() / 1000;

				let counter = 0;
				for(let i = 0; i < 366; i++) {
					let time = (startDate + counter) * 1000;
					let date = formatDate(new Date(time)).replaceAll(" ", "");
					chartData[date] = { holdingsValue:0 };
					counter += 86400;
				}

				let keys = Object.keys(events);

				keys.map(key => {
					let event = events[key];
					let id = event.id;
					let amount = parseFloat(event.amount);
					let eventTime = parseInt(event.time) * 1000;
					let eventDate = formatDate(new Date(eventTime)).replaceAll(" ", "");
					let previousYearTime = previousYear(new Date());
					if(eventTime > previousYearTime && event.type !== "transfer") {
						if(!coins.includes(id)) {
							coins.push(id);
						}

						if(id in chartData[eventDate]) {
							event.type === "buy" ? chartData[eventDate][id] += amount : chartData[eventDate][id] -= amount;
						} else {
							event.type === "buy" ? chartData[eventDate][id] = amount : chartData[eventDate][id] = -amount;
						}
					}
				});

				let ids = coins.join(",");
				
				getCoinMarketData(ids, currency, previousYear(new Date()), new Date()).then(data => {
					setChartSegments(4);

					let keys = Object.keys(data);

					let formattedPrices = {};

					keys.map(coinID => {
						if(!(coinID in formattedPrices)) {
							formattedPrices[coinID] = {};
						}

						let prices = data[coinID].prices;

						for(let i = 0; i < prices.length; i++) {
							let time = prices[i][0];
							let price = prices[i][1];
							let date = formatDate(new Date(time)).replaceAll(" ", "");
							formattedPrices[coinID][date] = price;
						}
					});

					let dates = Object.keys(chartData);

					startDate = null;

					for(let i = 0; i < dates.length; i++) {
						let previousDay = chartData[dates[i - 1]];
						let currentDay = chartData[dates[i]];

						if(i - 1 >= 0 && Object.keys(previousDay).length > 1) {
							Object.keys(previousDay).map(coin => {
								if(coin !== "holdingsValue") {
									if(empty(startDate)) {
										startDate = i - 1;
									}

									if(previousDay[coin] < 0) {
										chartData[dates[i - 1]][coin] = 0;
									}

									if(coin in currentDay) {
										chartData[dates[i]][coin] = chartData[dates[i]][coin] + previousDay[coin];
									} else {
										chartData[dates[i]][coin] = previousDay[coin];
									}
								}
							});
						}

						Object.keys(chartData[dates[i]]).map(coin => {
							if(coin !== "holdingsValue") {
								let value = chartData[dates[i]][coin] * formattedPrices[coin][dates[i]];
								chartData[dates[i]].holdingsValue += value;
							}
						});
					}

					resolve({ chartData:chartData, startDate:startDate });
				}).catch(error => {
					console.log(error);
					reject(error);
				});
			});
		});
	}

	async function getIndividualChartData(coinID, currency) {
		return new Promise((resolve, reject) => {
			let firstEvent = null;

			getActivity().then(events => {
				events = sortActivity(events);

				let chartData = {};

				let counter = 0;
				let startDate = previousYear(new Date()).getTime() / 1000;
				for(let i = 0; i < 366; i++) {
					let time = (startDate + counter) * 1000;
					let date = formatDate(new Date(time)).replaceAll(" ", "");
					chartData[date] = { holdingsValue:0 };
					counter += 86400;
				}

				let eventCount = 0;
				let keys = Object.keys(events);

				keys.map(key => {
					let event = events[key];
					let id = event.id;
					if(coinID === id) {
						let amount = parseFloat(event.amount);
						let eventTime = parseInt(event.time) * 1000;
						let eventDate = formatDate(new Date(eventTime)).replaceAll(" ", "");
						let previousYearTime = previousYear(new Date());
						if(eventTime > previousYearTime && event.type !== "transfer") {
							if(id in chartData[eventDate]) {
								event.type === "buy" ? chartData[eventDate][id] += amount : chartData[eventDate][id] -= amount;
							} else {
								event.type === "buy" ? chartData[eventDate][id] = amount : chartData[eventDate][id] = -amount;
							}
						}

						if(eventCount === 0) {
							firstEvent = events[key];
						}

						eventCount++;
					}
				});
				
				getCoinMarketData(coinID, currency, previousYear(new Date()), new Date()).then(data => {
					setChartSegments(4);

					let keys = Object.keys(data);

					let formattedPrices = {};

					keys.map(coinID => {
						if(!(coinID in formattedPrices)) {
							formattedPrices[coinID] = {};
						}

						let prices = data[coinID].prices;

						for(let i = 0; i < prices.length; i++) {
							let time = prices[i][0];
							let price = prices[i][1];
							let date = formatDate(new Date(time)).replaceAll(" ", "");
							formattedPrices[coinID][date] = price;
						}
					});

					let dates = Object.keys(chartData);

					startDate = null;

					for(let i = 0; i < dates.length; i++) {
						let previousDay = chartData[dates[i - 1]];
						let currentDay = chartData[dates[i]];

						if(i - 1 >= 0 && Object.keys(previousDay).length > 1) {
							Object.keys(previousDay).map(coin => {
								if(coin !== "holdingsValue") {
									if(empty(startDate)) {
										startDate = i - 1;
									}

									if(previousDay[coin] < 0) {
										chartData[dates[i - 1]][coin] = 0;
									}

									if(coin in currentDay) {
										chartData[dates[i]][coin] = chartData[dates[i]][coin] + previousDay[coin];
									} else {
										chartData[dates[i]][coin] = previousDay[coin];
									}
								}
							});
						}

						Object.keys(chartData[dates[i]]).map(coin => {
							if(coin !== "holdingsValue") {
								let value = chartData[dates[i]][coin] * formattedPrices[coin][dates[i]];
								chartData[dates[i]].holdingsValue += value;
							}
						});
					}

					resolve({ chartData:chartData, startDate:startDate, firstEvent:firstEvent });
				}).catch(error => {
					console.log(error);
					reject(error);
				});
			});
		});
	}

	function getCoinMarketData(ids, currency, from, to) {
		return new Promise(async (resolve, reject) => {
			let api = await AsyncStorage.getItem("api");
			let token = await AsyncStorage.getItem("token");

			let endpoint = api + "historical/read.php?token=" + token + "&ids=" + ids + "&currency=" + currency + "&from=" + new Date(Date.parse(from)).getTime() / 1000 + "&to=" + new Date(Date.parse(to)).getTime() / 1000;

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
				resolve(response);
			}).catch(error => {
				console.log(arguments.callee.name + " - " + error);
				reject(error);
			});
		});
	}

	function getCoinPrice(id, date) {
		return new Promise(async (resolve, reject) => {
			let api = await AsyncStorage.getItem("api");
			let token = await AsyncStorage.getItem("token");

			let endpoint = "https://api.coingecko.com/api/v3/coins/" + id + "/history?date=" + date;

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
				resolve(response);
			}).catch(error => {
				console.log(arguments.callee.name + " - " + error);
				reject(error);
			});
		});
	}

	async function createHolding(id, amount) {
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
								<View style={[styles.row, key % 2 ? {...styles.rowOdd, ...styles[`rowOdd${theme}`]} : null, styles.modalRow]}>
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

	async function processHolding(id, amount) {
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
						hideModal();
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

	async function deleteHolding(id) {
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
					hideModal();
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

	async function getHoldings() {
		console.log("Holdings - Getting Holdings - " + epoch());

		let currency = await AsyncStorage.getItem("currency");
		if(empty(currency)) {
			currency = "usd";
		}

		let transactionsAffectHoldings = await AsyncStorage.getItem("transactionsAffectHoldings");
		if(empty(transactionsAffectHoldings)) {
			transactionsAffectHoldings = "disabled";
		}

		if(transactionsAffectHoldingsState !== transactionsAffectHoldings) {
			setTransactionsAffectHoldingsState(transactionsAffectHoldings);
		}

		let highlightPriceChange = await AsyncStorage.getItem("highlightPriceChange");
		if(empty(highlightPriceChange)) {
			highlightPriceChange = "disabled";
		}

		if(highlightPriceChangeState !== highlightPriceChange) {
			setHighlightPriceChangeState(highlightPriceChange);
		}
		
		let theme = empty(await AsyncStorage.getItem("theme")) ? "Light" : await AsyncStorage.getItem("theme");

		let api = await AsyncStorage.getItem("api");
		let token = await AsyncStorage.getItem("token");

		let endpoint = api + "holdings/read.php?platform=app&token=" + token;

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
			if(Object.keys(coins).length === 0 && transactionsAffectHoldings !== "override" && transactionsAffectHoldings !== "mixed") {
				if(navigation.isFocused()) {
					setHoldingsData([<Text key="empty" style={[styles.headerText, styles[`headerText${theme}`], { marginLeft:20 }]}>No Holdings Found.</Text>]);
					setHoldingsValue("-");
				}
			} else {
				let transactionsBySymbol;

				if(transactionsAffectHoldings === "mixed") {
					transactionsBySymbol = processActivity(await getActivity());

					let ids = Object.keys(transactionsBySymbol);
					ids.map(id => {
						if(!(id in coins)) {
							coins[id] = { amount:0, symbol:transactionsBySymbol[id].symbol };
						}
					});
				} else if(transactionsAffectHoldings === "override") {
					transactionsBySymbol = processActivity(await getActivity());

					coins = {};

					let ids = Object.keys(transactionsBySymbol);
					ids.map(id => {
						if(transactionsBySymbol[id].amount > 0) {
							coins[id] = { amount:transactionsBySymbol[id].amount, symbol:transactionsBySymbol[id].symbol };
						}
					});
				}

				let holdingsObject = {};

				parseHoldings(coins).then(async holdings => {
					let data = [];

					data.push(
						<View style={styles.row} key={epoch() + "holdings-header"}>
							<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerRank]} ellipsizeMode="tail">#</Text>
							<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerCoin]} ellipsizeMode="tail">Coin</Text>
							<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerAmount]} ellipsizeMode="tail">Amount</Text>
							<Text style={[styles.headerText, styles[`headerText${theme}`], styles.headerValue]} ellipsizeMode="tail">Value</Text>
						</View>
					);

					let rank = 0;

					let mixedValue = 0;

					Object.keys(holdings).map(holding => {
						rank += 1;

						let coin = holdings[holding];

						let icon = coin.image;
						let amount = coin.amount;
						let symbol = coin.symbol;
						let change = parseFloat(coin.change);
						let value = separateThousands(abbreviateNumber(coin.value.toFixed(2), 2));

						holdingsObject[holding] = { amount:amount, value:coin.value };

						let enableModal = true;

						if(!empty(transactionsBySymbol)) {
							if(transactionsAffectHoldings === "mixed") {
								if(holding in transactionsBySymbol) {
									amount = parseFloat(amount) + transactionsBySymbol[holding].amount;
									value = (coin.price * amount).toFixed(2);
									mixedValue += parseFloat(value.replaceAll(",", ""));
									enableModal = false;
								}
							} else if(transactionsAffectHoldings === "override") {
								enableModal = false;
							}
						}

						if(amount < 0) {
							amount = 0;
						}

						if(value < 0) {
							value = 0;
						}

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

						if(value !== 0) {
							data.push(
								<TouchableOpacity onPress={() => { openModal(transactionsAffectHoldings, "update", capitalizeFirstLetter(holding), symbol.toUpperCase(), amount.toString(), coin.value)}} key={epoch() + holding}>
									<View style={[styles.row, rank % 2 ? {...styles.rowOdd, ...styles[`rowOdd${theme}`]} : null, styles[highlightRow]]}>
										<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellRank, styles[highlightText]]} ellipsizeMode="tail">{rank}</Text>
										<Image style={styles.cellImage} source={{uri:icon}}/>
										<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellSymbol, styles[highlightText]]} ellipsizeMode="tail">{symbol}</Text>
										<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellAmount, styles[highlightText]]} ellipsizeMode="tail">{separateThousands(amount)}</Text>
										<Text style={[styles.cellText, styles[`cellText${theme}`], styles.cellValue, styles[highlightText]]} ellipsizeMode="tail">{currencies[currency] + value}</Text>
									</View>
								</TouchableOpacity>
							);
						}
					});

					setHoldingsCache(holdingsObject);

					if(mixedValue > 0 && navigation.isFocused()) {
						let currency = await AsyncStorage.getItem("currency");
						if(empty(currency)) {
							currency = "usd";
						}

						let totalValue = holdingsValue;

						if(!isNaN(totalValue)) {
							totalValue += mixedValue;
						} else {
							totalValue = mixedValue;
						}

						if(screenWidth > 380) {
							setHoldingsValue(currencies[currency] + separateThousands(totalValue.toFixed(2)));
						} else {
							setHoldingsValue(currencies[currency] + abbreviateNumber(totalValue, 2));
						}
					}

					if(navigation.isFocused()) {
						setHoldingsData(data);
					}
				}).catch(e => {
					console.log(e);
				});
			}
		}).catch(error => {
			console.log(arguments.callee.name + " - " + error);
		});
	}

	function parseHoldings(coins) {
		return new Promise(async (resolve, reject) => {
			try {
				console.log("Parsing Holdings - " + epoch());

				let currency = await AsyncStorage.getItem("currency");
				if(empty(currency)) {
					currency = "usd";
				}

				let list = Object.keys(coins).join("%2C");

				let endpoint = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + currency + "&ids=" + list + "&order=market_cap_desc&per_page=250&page=1&sparkline=false";

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
					let holdingsValue = 0;

					let holdings = {};

					Object.keys(response).map(index => {
						let coin = response[index];
						let id = coin.id;
						let price = coin.current_price;
						let amount = coins[id].amount;
						let value = price * amount;
						let priceChangeDay = coin.price_change_percentage_24h;

						if(!empty(priceChangeDay)) {
							priceChangeDay = priceChangeDay.toFixed(2);
						} else {
							priceChangeDay = "-";
						}

						holdings[id] = {
							symbol:coins[id].symbol.toUpperCase(),
							amount:amount,
							value:value,
							price:price,
							change:priceChangeDay,
							image:coin.image
						};

						holdingsValue += value;
					});

					if(holdingsValue > 0 && navigation.isFocused()) {
						let currency = await AsyncStorage.getItem("currency");
						if(empty(currency)) {
							currency = "usd";
						}
						
						if(screenWidth > 380) {
							setHoldingsValue(currencies[currency] + separateThousands(holdingsValue.toFixed(2)));
						} else {
							setHoldingsValue(currencies[currency] + abbreviateNumber(holdingsValue, 2));
						}
					}

					resolve(Object.fromEntries(
						Object.entries(holdings).sort(([,a],[,b]) => b.value - a.value)
					));
				}).catch(error => {
					console.log(error);
					reject(error);
				});
			} catch(error) {
				reject(error);
			}
		});
	}

	async function getActivity() {
		console.log("Holdings - Getting Activity - " + epoch());

		return new Promise(async (resolve, reject) => {
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
				resolve(events);
			}).catch(error => {
				console.log(arguments.callee.name + " - " + error);
				reject(error);
			});
		});
	}

	function processActivity(events) {
		let txIDs = Object.keys(events);

		let sorted = {};

		txIDs.map(txID => {
			let transaction = events[txID];
			let id = transaction.id;
			let symbol = transaction.symbol;
			let type = transaction.type;
			let amount = parseFloat(transaction.amount);

			if(!(id in sorted)) {
				sorted[id] = { amount:0, symbol:symbol };
			}
			
			if(type === "sell") {
				sorted[id].amount = parseFloat(sorted[id].amount) - amount;
			} else if(type === "buy") {
				sorted[id].amount = parseFloat(sorted[id].amount) + amount;
			}
		});

		return sorted;
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

		array.map(item => {
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
		width:screenWidth - 140,
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
		maxHeight:130,
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
	modalRow: {
		height:50,
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
		width:screenWidth - 140,
	},
	inputDark: {
		backgroundColor:globalColors["Dark"].mainFirst,
		color:globalColors["Dark"].mainContrast
	},
	buttonWrapper: {
		width:screenWidth - 140,
		flexDirection:"row"
	},
	button: {
		height:40,
		width:((screenWidth - 140) / 2) - 10,
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
	chartModalWrapper: {
		width:"100%",
		height:"100%",
		flex:1,
		justifyContent:"flex-start",
		alignItems:"center",
		backgroundColor:globalColors["Light"].mainThird
	},
	chartModalWrapperDark: {
		backgroundColor:globalColors["Dark"].mainThird
	},
	chartModal: {
		width:300,
		height:300,
		alignItems:"center",
		backgroundColor:globalColors["Light"].mainFirst
	},
	chartModalDark: {
		backgroundColor:globalColors["Dark"].mainFirst
	},
	chartModalMessageWrapper: {
		alignSelf:"center",
		backgroundColor:globalColors["Light"].accentFirst,
		borderRadius:globalStyles.borderRadius,
		width:screenWidth - 40,
		alignItems:"center",
		padding:10,
		marginTop:20,
	},
	chartModalMessage: {
		color:globalColors["Light"].accentContrast,
		fontSize:16,
		fontFamily:globalStyles.fontFamily,
		lineHeight:25,
	},
	chartModalDescriptionWrapper: {
		alignSelf:"center",
		backgroundColor:globalColors["Light"].mainFirst,
		borderRadius:globalStyles.borderRadius,
		width:screenWidth - 40,
		alignItems:"center",
		padding:10,
		marginTop:20,
	},
	chartModalDescriptionWrapperDark: {
		backgroundColor:globalColors["Dark"].mainFirst,
	},
	chartModalDescription: {
		color:globalColors["Light"].mainContrast,
		fontSize:16,
		fontFamily:globalStyles.fontFamily,
		lineHeight:25,
	},
	chartModalDescriptionDark: {
		color:globalColors["Dark"].mainContrast
	},
	chartModalDescriptionPositiveLight: {
		color:"rgb(40,150,70)"
	},
	chartModalDescriptionNegativeLight: {
		color:"rgb(210,40,40)"
	},
	chartModalDescriptionPositiveDark: {
		color:"rgb(20,180,120)"
	},
	chartModalDescriptionNegativeDark: {
		color:"rgb(210,50,50)"
	},
	chartWrapper: {
		height:320,
		paddingTop:30,
		width:"100%",
		backgroundColor:globalColors["Light"].mainFirst
	},
	chartWrapperDark: {
		backgroundColor:globalColors["Dark"].mainFirst
	},
	chartButtonWrapper: {
		width:screenWidth - 40,
		marginTop:20,
		alignSelf:"center",
		flexDirection:"row",
		justifyContent:"center",
		alignItems:"center"
	},
	chartButton: {
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
	chartButtonDark: {
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
		height:screenHeight - 390,
		maxHeight:screenHeight - 390
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
	rowHighlightRowPositiveLight: {
		backgroundColor:"rgba(0,255,150,0.1)"
	},
	rowHighlightRowNegativeLight: {
		backgroundColor:"rgba(255,0,0,0.1)"
	},
	rowHighlightRowPositiveDark: {
		backgroundColor:"rgba(0,255,150,0.1)"
	},
	rowHighlightRowNegativeDark: {
		backgroundColor:"rgba(255,0,0,0.15)"
	},
	cellHighlightTextPositiveLight: {
		color:"rgb(40,150,70)"
	},
	cellHighlightTextNegativeLight: {
		color:"rgb(210,40,40)"
	},
	cellHighlightTextPositiveDark: {
		color:"rgb(20,180,120)"
	},
	cellHighlightTextNegativeDark: {
		color:"rgb(210,50,50)"
	},
	rowOdd: {
		backgroundColor:globalColors["Light"].mainSecond,
	},
	rowOddDark: {
		backgroundColor:globalColors["Dark"].mainSecond,
	},
	loadingText: {
		marginLeft:20,
		marginTop:5,
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