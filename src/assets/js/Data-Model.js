export default class DataModel {
	constructor(initialData) {
		this.initialData = initialData;
		this.innerData = [];
		this.state = {
			list: [],
			selected: []
		};
	}

	get data() {
		return [...this.innerData];
	}

	set data(newData) {
		this.innerData = [...newData];
	}

	getUserById(id) {
		return this.initialData.filter(item => item.id === id)[0];
	}

	compareDataState(users, selected) {
		return users.filter(item => selected.indexOf(item) < 0);;
	}
}
