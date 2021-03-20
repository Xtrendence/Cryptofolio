import React from "react";
import { StyleSheet } from "react-native";

const globalColorsLight = {
	mainFirst:"rgb(255,255,255)",
	mainSecond:"rgb(245,245,245)",
	mainThird:"rgb(235,235,235)",
	mainFourth:"rgb(225,225,225)",
	mainFifth:"rgb(215,215,215)",
	mainContrast:"rgb(50,50,50)",
	mainContrastLight:"rgb(100,100,100)",
	accentFirst:"rgb(93,79,156)",
	accentSecond:"rgb(80,125,182)",
	accentThird:"rgb(69,168,199)",
	accentFourth:"rgb(61,212,219)",
};

const globalColorsDark = {
	mainFirst:"rgb(20,20,20)",
	mainSecond:"rgb(30,30,30)",
	mainThird:"rgb(40,40,40)",
	mainFourth:"rgb(50,50,50)",
	mainFifth:"rgb(60,60,60)",
	mainContrast:"rgb(255,255,255)",
	mainContrastLight:"rgb(245,245,245)",
	accentFirst:"rgb(93,79,156)",
	accentSecond:"rgb(80,125,182)",
	accentThird:"rgb(69,168,199)",
	accentFourth:"rgb(61,212,219)",
};

const globalStyles = {
	shadowColor:"rgb(0,0,0)",
	shadowOffset: {
		width:0,
		height:2,
	},
	shadowOpacity:0.25,
	shadowRadius:3.84,
	shadowElevation:5,
	borderRadius:10,
	fontFamily:"Roboto",
};

export { globalColorsLight, globalColorsDark, globalStyles };