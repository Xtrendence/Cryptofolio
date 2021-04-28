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

export function separateThousands(number) {
	var num_parts = number.toString().split(".");
	num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return num_parts.join(".");
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
	eur: "€"
};
