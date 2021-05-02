import React, { useEffect } from "react";
import { Text, View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FlashMessage, { showMessage, hideMessage } from "react-native-flash-message";
import { StatusBar } from "expo-status-bar";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";
import { globalColors, globalStyles } from "../styles/global";
import { empty } from "../utils/utils";
import { login, verifySession } from "../utils/requests";
import { ThemeContext } from "../utils/theme";

export default function Login({ navigation, route }) {
	const { theme } = React.useContext(ThemeContext);

	const [url, setUrl] = React.useState();
	const [password, setPassword] = React.useState();
	const [secure, setSecure] = React.useState(false);
	const [showCamera, setShowCamera] = React.useState(false);

	useEffect(() => {
		checkSession();

		navigation.addListener("focus", () => {
			checkSession();
			setShowCamera(false);
		});
	}, []);

	return (
		<View style={[styles.container, styles[`container${theme}`]]}>
			{ !showCamera && 
				<View style={styles.formWrapper}>
					<TextInput placeholder="API URL..." onChangeText={(value) => setUrl(value)} value={url} style={[styles.input, styles[`input${theme}`]]} placeholderTextColor={globalColors[theme].mainContrastLight} autoCapitalize="none" spellCheck={false}></TextInput>
					<TextInput placeholder="Password..." secureTextEntry={secure} value={password} onChangeText={(value) => textChanged(value)} style={[styles.input, styles[`input${theme}`]]} placeholderTextColor={globalColors[theme].mainContrastLight} autoCapitalize="none"></TextInput>
					<TouchableOpacity onPress={() => attemptLogin()}>
						<LinearGradient colors={[globalColors[theme].accentFirst, globalColors[theme].accentSecond]} style={[styles.button, { width:100 }]} useAngle={true} angle={45}>
							<Text style={styles.text}>Login</Text>
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
			await AsyncStorage.setItem("token", token);
			await AsyncStorage.setItem("api", api);
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

	async function attemptLogin(token) {
		if(empty(token)) {
			login(url, password).then(async response => {
				let token = response.token;
				await AsyncStorage.setItem("api", response.api);
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
	formWrapper: {
		justifyContent:"center",
		flexDirection:"column",
		alignItems:"center"
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
		backgroundColor:globalColors["Dark"].mainFirst,
		color:globalColors["Dark"].mainContrast
	},
	button: {
		height:40,
		width:"auto",
		paddingLeft:10,
		paddingRight:10,
		alignItems:"center",
		justifyContent:"center",
		borderRadius:globalStyles.borderRadius,
		borderRadius:globalStyles.borderRadius,
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
	},
	text: {
		lineHeight:38,
		fontFamily:globalStyles.fontFamily,
		fontSize:18,
		paddingBottom:2,
		color:globalColors["Light"].accentContrast
	},
	cameraWrapper: {
		position:"absolute",
		backgroundColor:"rgb(10,10,10)",
		width:"100%",
		height:"100%",
		zIndex:4
	},
});