export default class DataModel {
	constructor(initialData) {
		this.initialData = initialData;
		this._data = [];
		this.state = {
			list: [],
			selected: []
		};
	}

	get data() {
		return [...this._data];
	}

	set data(newData) {
		this._data = [...newData];
	}

	getUserById(id) {
		return this.initialData.filter(item => item.id === id)[0];
	}

	compareDataState(users, selected) {
		return users.filter(item => selected.indexOf(item) < 0);;
	}
}
