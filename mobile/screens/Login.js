import React, { useEffect } from "react";
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Dimensions } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FlashMessage, { showMessage, hideMessage } from "react-native-flash-message";
import { StatusBar } from "expo-status-bar";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";
import NoAPI from "../utils/api";
import { globalColors, globalStyles } from "../styles/global";
import { empty } from "../utils/utils";
import { login, verifySession } from "../utils/requests";
import { ThemeContext } from "../utils/theme";
import styles from "../styles/Login";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

export default function Login({ navigation, route }) {
	const { theme } = React.useContext(ThemeContext);

	const [url, setUrl] = React.useState();
	const [username, setUsername] = React.useState();
	const [password, setPassword] = React.useState();
	const [showCamera, setShowCamera] = React.useState(false);

	useEffect(() => {
		checkSession();

		navigation.addListener("focus", () => {
			checkSession();
			setShowCamera(false);
		});
		
		navigation.addListener("blur", () => {
			setShowCamera(false);
		});
	}, []);

	return (
		<View style={[styles.container, styles[`container${theme}`]]}>
			{ !showCamera && 
				<View style={styles.formWrapper}>
					<TextInput placeholder="API URL..." onChangeText={(value) => setUrl(value)} value={url} style={[styles.input, styles[`input${theme}`]]} placeholderTextColor={globalColors[theme].mainContrastLight} autoCapitalize="none" spellCheck={false}></TextInput>
					<TextInput placeholder="Username..." onChangeText={(value) => setUsername(value)} value={username} style={[styles.input, styles[`input${theme}`]]} placeholderTextColor={globalColors[theme].mainContrastLight} autoCapitalize="none" spellCheck={false}></TextInput>
					<TextInput placeholder="Password..." secureTextEntry={!empty(password)} value={password} onChangeText={(value) => setPassword(value)} style={[styles.input, styles[`input${theme}`]]} placeholderTextColor={globalColors[theme].mainContrastLight} autoCapitalize="none"></TextInput>
					<TouchableOpacity onPress={() => attemptLogin()}>
						<LinearGradient colors={[globalColors[theme].accentFirst, globalColors[theme].accentSecond]} style={[styles.button, { width:100 }]} useAngle={true} angle={45}>
							<Text style={styles.text}>Login</Text>
						</LinearGradient>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => loginNoAPI()}>
						<LinearGradient colors={globalColors[theme].purpleGradient} style={[styles.button, { marginTop:20, width:150 }]} useAngle={true} angle={45}>
							<Text style={styles.text}>No-API Mode</Text>
						</LinearGradient>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => setShowCamera(true)}>
						<LinearGradient colors={globalColors[theme].atlasGradient} style={[styles.button, { marginTop:20, width:150 }]} useAngle={true} angle={45}>
							<Text style={styles.text}>Scan QR Code</Text>
						</LinearGradient>
					</TouchableOpacity>
				</View>
			}
			{ showCamera &&
				<View style={styles.cameraWrapper}>
					<QRCodeScanner 
						reactivate={true}
						onRead={(e) => processCode(e.data)} 
						flashMode={RNCamera.Constants.FlashMode.off} 
						topContent={
							<View style={styles.cameraTextWrapper}>
								<Text style={styles.cameraText}>You can only use a QR code once before having to generate a new one.</Text>
							</View>
						}
						bottomContent={
							<TouchableOpacity onPress={() => setShowCamera(false)}>
								<LinearGradient colors={globalColors[theme].atlasGradient} style={[styles.button, styles.cameraButton, { marginTop:20 }]} useAngle={true} angle={45}>
									<Text style={styles.text}>Close Camera</Text>
								</LinearGradient>
							</TouchableOpacity>
						}
					/>
				</View>
			}
			<FlashMessage position="top" hideStatusBar={true} floating={true}/>
			<StatusBar style={theme === "Dark" ? "light" : "dark"}/>
		</View>
	);

	async function processCode(data) {
		if(data.includes("!")) {
			let parts = data.split("!");

			let token = parts[0];
			let api = parts[1];
			let username = parts[2];

			await AsyncStorage.setItem("token", token);
			await AsyncStorage.setItem("api", api);
			await AsyncStorage.setItem("username", username);
			
			checkSession();
		} else {
			showMessage({
				backgroundColor: globalColors[theme].accentFirst,
				message: "Error",
				description: "Invalid QR data.",
				duration: 4000
			});
		}
	}

	async function loginNoAPI() {
		await AsyncStorage.setItem("NoAPIMode", "enabled");

		let validPages = ["Dashboard", "Market", "Holdings", "Settings"];
		let page = await AsyncStorage.getItem("defaultPage");
		if(empty(page) || !validPages.includes(page)) {
			navigation.navigate("Dashboard");
		} else {
			navigation.navigate(page);
		}
	}

	async function attemptLogin(token) {
		if(empty(token)) {
			login(url, username, password).then(async response => {
				let token = response.token;

				await AsyncStorage.removeItem("NoAPIMode");

				await AsyncStorage.setItem("api", response.api);
				await AsyncStorage.setItem("username", response.username);
				await AsyncStorage.setItem("token", token);

				setPassword();

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
					await AsyncStorage.removeItem("NoAPIMode");

					await AsyncStorage.setItem("username", response.username);

					setUsername();
					setPassword();

					let validPages = ["Dashboard", "Market", "Holdings", "Activity", "Settings"];
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
}