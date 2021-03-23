import React from "react";
import { Text, View } from "react-native";
import getStyle from "../styles/topbar";

export default function TopBar(props) {
	const [colors, setColors] = React.useState(props.colors);
	const [styles, setStyles] = React.useState(getStyle(colors));

	return (
		<View style={styles.bar}>
			<Text style={styles.header}>{props.title}</Text>
		</View>
	);
}