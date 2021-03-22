import React, { useEffect } from "react";
import { Text, View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showMessage, hideMessage } from "react-native-flash-message";
import { globalColorsLight, globalColorsDark, globalStyles } from "../styles/global";
import { empty } from "../utils/utils";
import { login } from "../utils/requests";

let globalColors = globalColorsLight;

export default function Login({ navigation }) {
	// TODO: Change after development.
	// const [url, setUrl] = React.useState("http://192.168.1.67/api/");
	const [url, setUrl] = React.useState("http://192.168.1.58:8080/");
	const [password, setPassword] = React.useState("admin");
	const [secure, setSecure] = React.useState(false);

	// TODO: Remove after development.
	useEffect(() => {
		attemptLogin();
	}, []);

	return (
		<View style={styles.container}>
			<TextInput placeholder="API URL..." onChangeText={(value) => setUrl(value)} value={url} style={styles.input}></TextInput>
			<TextInput placeholder="Password..." secureTextEntry={secure} value={password} onChangeText={(value) => textChanged(value)} style={styles.input}></TextInput>
			<TouchableOpacity onPress={() => attemptLogin()}>
				<LinearGradient colors={[globalColors.accentFirst, globalColors.accentSecond]} style={styles.button} useAngle={true} angle={45}>
					<Text style={styles.text}>Login</Text>
				</LinearGradient>
			</TouchableOpacity>
		</View>
	);

	async function attemptLogin() {
		login(url, password).then(async response => {
			let token = response.token;
			await AsyncStorage.setItem("api", response.api);
			await AsyncStorage.setItem("token", token);
			navigation.navigate("Dashboard");
		}).catch(error => {
			showMessage({
				backgroundColor: globalColors.accentFirst,
				message: "Error",
				description: error,
				duration: 4000
			});
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
		backgroundColor:globalColors.mainSecond
	},
	input: {
		backgroundColor:globalColors.mainFirst,
		paddingLeft:10,
		paddingRight:10,
		width:160,
		height:40,
		marginBottom:20,
		borderRadius:globalStyles.borderRadius,
		backgroundColor:globalColors.mainFirst,
		shadowColor:globalStyles.shadowColor,
		shadowOffset:globalStyles.shadowOffset,
		shadowOpacity:globalStyles.shadowOpacity,
		shadowRadius:globalStyles.shadowRadius,
		elevation:globalStyles.shadowElevation,
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
		color:globalColors.accentContrast
	}
});