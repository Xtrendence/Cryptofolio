import { StyleSheet, Dimensions } from "react-native";
import { globalColors, globalStyles } from "../styles/global";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;

export default styles = StyleSheet.create({
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
	cameraText: {
		textAlign:"center",
		width:screenWidth - 100,
		lineHeight:30,
		fontSize:18,
		fontFamily:globalStyles.fontFamily,
		color:"rgb(255,255,255)",
		marginBottom:20
	}
});