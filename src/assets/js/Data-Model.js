export default class DataModel {
    constructor(initialData) {
        this.initialData = initialData;
        this._data = [];
        this.state = {
            list: [],
            selected: []
        }
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
        const res = users.filter(item => selected.indexOf(item) < 0);
        console.log('res: ', res);
        console.log('users: ', users);
        console.log('selected: ', selected);
        return res;
        // return users.filter(item => selected.indexOf(item) < 0);
    }
}