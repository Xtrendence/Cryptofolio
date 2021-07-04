export function rgbToHex(rgb) {
	let numbers = rgb.split("(")[1].split(")")[0].split(",");
	let hexArray = numbers.map((number) => {
		number = parseInt(number).toString(16);
		return (number.length === 1) ? "0" + number : number;
	});
	return "#" + hexArray.join("");
}

export function empty(value) {
	if (typeof value === "object" && value !== null && Object.keys(value).length === 0) {
		return true;
	}
	if (value === null || typeof value === "undefined" || value.toString().trim() === "") {
		return true;
	}
	return false;
}

export function validJSON(json) {
	try {
		let object = JSON.parse(json);
		if(object && typeof object === "object") {
			return true;
		}
	}
	catch(e) { }
	return false;
}

export function separateThousands(number) {
	let parts = number.toString().split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return parts.join(".");
}

export function abbreviateNumber(num, digits) {
	let si = [
		{ value: 1, symbol: "" },
		{ value: 1E3, symbol: "k" },
		{ value: 1E6, symbol: "M" },
		{ value: 1E9, symbol: "B" },
		{ value: 1E12, symbol: "T" },
		{ value: 1E15, symbol: "P" },
		{ value: 1E18, symbol: "E" }
	];
	let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
	let i;
	for(i = si.length - 1; i > 0; i--) {
		if(num >= si[i].value) {
			break;
		}
	}
	return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

export function epoch() {
	var date = new Date();
	var time = Math.round(date.getTime() / 1000);
	return time;
}

export function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

export function wait(timeout) {
	return new Promise(resolve => setTimeout(resolve, timeout));
}

export const currencies = {
	usd: "$",
	gbp: "£",
	eur: "€",
	chf: "",
	aud: "$",
	jpy: "¥",
	cad: "$"
};

export function previousYear(date) {
	let day = date.getDate();
	let month = date.getMonth() + 1;
	let year = date.getFullYear() - 1;
	return new Date(Date.parse(year + "-" + month + "-" + day));
}

export function previousMonth(date) {
	return new Date(date.getTime() - 2592000 * 1000);
}

export function previousWeek(date) {
	return new Date(date.getTime() - (60 * 60 * 24 * 6 * 1000));
}

export function formatHour(date) {
	let hours = ("00" + date.getHours()).slice(-2);
	let minutes = ("00" + date.getMinutes()).slice(-2);
	return hours + ":" + minutes;
}

export function formatDate(date) {
	let day = date.getDate();
	let month = date.getMonth() + 1;
	let year = date.getFullYear();
	return year + " / " + month + " / " + day;
}

export function formatDateHuman(date) {
	let day = date.getDate();
	let month = date.getMonth() + 1;
	let year = date.getFullYear();
	return day + " / " + month + " / " + year;
}

export function replaceAll(str1, str2, ignore) {
	return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}