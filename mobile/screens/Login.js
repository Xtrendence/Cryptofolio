import React, { useEffect } from "react";
import { Text, View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FlashMessage, { showMessage, hideMessage } from "react-native-flash-message";
import { StatusBar } from "expo-status-bar";
import { globalColors, globalStyles } from "../styles/global";
import { empty } from "../utils/utils";
import { login, verifySession } from "../utils/requests";
import { ThemeContext } from "../utils/theme";

export default function Login({ navigation, route }) {
	const { theme } = React.useContext(ThemeContext);

	const [url, setUrl] = React.useState();
	const [password, setPassword] = React.useState();
	const [secure, setSecure] = React.useState(false);

	useEffect(() => {
		checkSession();

		navigation.addListener("focus", () => {
			checkSession();
		});
	}, []);

	return (
		<View style={[styles.container, styles[`container${theme}`]]}>
			<TextInput placeholder="API URL..." onChangeText={(value) => setUrl(value)} value={url} style={[styles.input, styles[`input${theme}`]]}></TextInput>
			<TextInput placeholder="Password..." secureTextEntry={secure} value={password} onChangeText={(value) => textChanged(value)} style={[styles.input, styles[`input${theme}`]]}></TextInput>
			<TouchableOpacity onPress={() => attemptLogin()}>
				<LinearGradient colors={[globalColors[theme].accentFirst, globalColors[theme].accentSecond]} style={styles.button} useAngle={true} angle={45}>
					<Text style={styles.text}>Login</Text>
				</LinearGradient>
			</TouchableOpacity>
			<FlashMessage position="top" hideStatusBar={true} floating={true}/>
			<StatusBar style={theme === "Dark" ? "light" : "dark"}/>
		</View>
	);

	async function attemptLogin(token) {
		if(empty(token)) {
			login(url, password).then(async response => {
				let token = response.token;
				await AsyncStorage.setItem("api", response.api);
				await AsyncStorage.setItem("token", token);

				let validPages = ["Dashboard", "Market", "Holdings", "Settings"];
				let page = await AsyncStorage.getItem("defaultPage");
				if(empty(page) || !validPages.includes(page)) {
					navigation.navigate("Dashboard");
				} else {
					navigation.navigate(page);
				}
			}).catch(error => {
				showMessage({
					backgroundColor: globalColors[theme].accentFirst,
					message: "Error",
					description: error,
					duration: 4000
				});
			});
		} else {
			verifySession(token).then(async response => {
				if(response.valid) {
					let validPages = ["Dashboard", "Market", "Holdings", "Settings"];
					let page = await AsyncStorage.getItem("defaultPage");
					if(empty(page) || !validPages.includes(page)) {
						navigation.navigate("Dashboard");
					} else {
						navigation.navigate(page);
					}
				}
			}).catch(error => {
				showMessage({
					backgroundColor: globalColors[theme].accentFirst,
					message: "Error",
					description: error,
					duration: 4000
				});
			});
		}
	}

	function checkSession() {
		AsyncStorage.getItem("api").then(result => {
			setUrl(result);

			AsyncStorage.getItem("token").then(result => {
				if(!empty(result)) {
					attemptLogin(result);
				}
			}).catch(error => {
				console.log(error)
			});
		}).catch(error => {
			console.log(error);
		});
	}

	function textChanged(password) {
		setPassword(password);

		if(!empty(password)) {
			setSecure(true);
		} else {
			setSecure(false);
		}
	}
}

const styles = StyleSheet.create({
	container: {
		flex:1,
		alignItems:"center",
		justifyContent:"center",
		backgroundColor:globalColors["Light"].mainSecond
	},
	containerDark: {
		backgroundColor:globalColors["Dark"].mainSecond
	},
	input: {
		backgroundColor:globalColors["Light"].mainFirst,
		color:globalColors["Light"].mainContrast,
		paddingLeft:10,
		paddingRight:10,
		width:160,
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
		backgroundColor:globalColors["Dark"].mainFirst,
		color:globalColors["Dark"].mainContrast
	},
	button: {
		height:40,
		width:100,
		alignItems:"center",
		justifyContent:"center",
		borderRadius:globalStyles.borderRadius
	},
	text: {
		lineHeight:38,
		fontFamily:globalStyles.fontFamily,
		fontSize:18,
		paddingBottom:2,
		color:globalColors["Light"].accentContrast
	}
});