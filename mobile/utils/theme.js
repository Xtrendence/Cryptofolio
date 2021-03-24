import changeNavigationBarColor from "react-native-navigation-bar-color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useState } from "react";
import { rgbToHex } from "./utils";
import { globalColors } from "../styles/global";

changeNavigationBarColor(rgbToHex(globalColors["Light"].mainThird), true);

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
	const [theme, setTheme] = useState("Light");

	useEffect(() => {
		AsyncStorage.getItem("theme").then(result => {
			if(result === "Dark") {
				setTheme("Dark");
				changeNavigationBarColor(rgbToHex(globalColors["Dark"].mainThird), false);
			} else {
				setTheme("Light");
				changeNavigationBarColor(rgbToHex(globalColors["Light"].mainThird), true);
			}
		}).catch(error => {
			setTheme("Light");
			changeNavigationBarColor(rgbToHex(globalColors["Light"].mainThird), true);
			AsyncStorage.setItem("theme", "Light");
			console.log(error);
		});
	}, []);

	async function toggleTheme() {
		if(theme === "Dark") {
			setTheme("Light");
			changeNavigationBarColor(rgbToHex(globalColors["Light"].mainThird), true);
			await AsyncStorage.setItem("theme", "Light");
		} else {
			setTheme("Dark");
			changeNavigationBarColor(rgbToHex(globalColors["Dark"].mainThird), false);
			await AsyncStorage.setItem("theme", "Dark");
		}
	}

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}