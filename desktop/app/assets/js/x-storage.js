class XStorage {
	constructor(ipcRenderer) {
		this.ipcRenderer = ipcRenderer;
	}

	getItem(key) {
		return new Promise((resolve, reject) => {
			ipcRenderer.invoke("getItem", { key:key }).then((response) => {
				resolve(response);
			}).catch(error => {
				reject(error);
			});
		});
	}

	setItem(key, value) {
		return new Promise((resolve, reject) => {
			ipcRenderer.invoke("setItem", { key:key, value:value }).then((response) => {
				resolve(response);
			}).catch(error => {
				reject(error);
			});
		});
	}

	removeItem(key) {
		return new Promise((resolve, reject) => {
			ipcRenderer.invoke("removeItem", { key:key }).then((response) => {
				resolve(response);
			}).catch(error => {
				reject(error);
			});
		});
	}

	clear() {
		ipcRenderer.invoke("clearItems");
	}
}