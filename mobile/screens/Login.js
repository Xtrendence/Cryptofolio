import React from "react";
import { Text, View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { globalColorsLight, globalColorsDark, globalStyles } from "../styles/global";

let globalColors = globalColorsLight;

export default function Login() {
	const [url, setUrl] = React.useState();
	const [password, setPassword] = React.useState();
	const [secure, setSecure] = React.useState(false);

	return (
		<View style={styles.container}>
			<TextInput placeholder="API URL..." onChangeText={(value) => setUrl(value)} value={url} style={styles.input}></TextInput>
			<TextInput placeholder="Password..." secureTextEntry={secure} onChangeText={(value) => textChanged(value)} style={styles.input}></TextInput>
			<TouchableOpacity onPress={() => login()}>
				<LinearGradient colors={[globalColors.accentFirst, globalColors.accentSecond]} style={styles.button} useAngle={true} angle={45}>
					<Text style={styles.text}>Login</Text>
				</LinearGradient>
			</TouchableOpacity>
		</View>
	);

	function textChanged(password) {
		setPassword(password);

		if(!empty(password)) {
			setSecure(true);
		} else {
			setSecure(false);
		}
	}

	function login() {
		
	}
}

const styles = StyleSheet.create({
	container: {
		flex:1,
		alignItems:"center",
		justifyContent:"center"
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

function empty(value) {
	if (typeof value === "object" && value !== null && Object.keys(value).length === 0) {
		return true;
	}
	if (value === null || typeof value === "undefined" || value.toString().trim() === "") {
		return true;
	}
	return false;
}