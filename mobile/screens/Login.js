import React, { useEffect } from "react";
import { Text, View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showMessage, hideMessage } from "react-native-flash-message";
import getStyle from "../styles/login";
import { empty } from "../utils/utils";
import { login } from "../utils/requests";

export default function Login({ setActive, colors }) {
	const [styles, setStyles] = React.useState(getStyle(colors));
	
	// TODO: Change after development.
	// const [url, setUrl] = React.useState("http://192.168.1.67/api/");
	const [url, setUrl] = React.useState("http://192.168.1.58:8080/");
	const [password, setPassword] = React.useState("admin");
	const [secure, setSecure] = React.useState(false);

	// TODO: Remove after development.
	useEffect(() => {
		setStyles(getStyle(colors));
		//attemptLogin();
	}, [colors]);

	return (
		<View style={styles.container}>
			<TextInput placeholder="API URL..." onChangeText={(value) => setUrl(value)} value={url} style={styles.input}></TextInput>
			<TextInput placeholder="Password..." secureTextEntry={secure} value={password} onChangeText={(value) => textChanged(value)} style={styles.input}></TextInput>
			<TouchableOpacity onPress={() => attemptLogin()}>
				<LinearGradient colors={[colors.accentFirst, colors.accentSecond]} style={styles.button} useAngle={true} angle={45}>
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
			setActive("Dashboard");
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