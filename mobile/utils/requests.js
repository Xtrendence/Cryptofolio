import { empty } from "../utils/utils";

function login(url, password) {
	return new Promise((resolve, reject) => {
		let isFulfilled = false;

		if(empty(url) || empty(password)) {
			isFulfilled = true;
			reject("Both fields must be filled out.");
		} else {
			setTimeout(() => {
				if(!isFulfilled) {
					isFulfilled = true;
					reject("Login failed. Make sure the API URL is valid.");
				}
			}, 5000);

			let endpoint = url + "account/login.php?platform=app";

			let body = { password:password };

			fetch(endpoint, {
				body: JSON.stringify(body),
				method: "POST",
				headers: {
					Accept: "application/json", "Content-Type": "application/json"
				}
			})
			.then((json) => {
				return json.json();
			})
			.then(async (response) => {
				if("error" in response) {
					isFulfilled = true;
					reject(response.error);
				} else {
					if(response.valid) {
						isFulfilled = true;
						resolve({ token:response.token, api:url });
					}
				}
			}).catch(error => {
				isFulfilled = true;
				reject("Login failed. Make sure the API URL is valid.");
				console.log(error);
			});
		}
	});
}

export { login };