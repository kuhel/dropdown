import UsersList from './Users-List';
import SelectedItems from './Selected-Items';
import DataModel from './Data-Model';
import Trie from './Trie';
import data from './data';

/**
 * Controller for VK Dropdown
 * @param {HTMLElement} element target to create dropdown
 * @param {Object} config config of dropdown
 *
 * @export
 * @class DropdownController
 */
export default class DropdownController {
	constructor(element, config = {}) {
		this.element = element;
		this.usersListElement = this.element.querySelector('.user-list');
		this.btn = this.element.querySelector('.btn-dropdown');
		this.textInput = this.element.querySelector('.vk-dropdown-text-input');
		this.usersList = null;
		this.selectedItems = null;
		this.dataModel = null;
		this.trie = null;
		this.defaultConfig = {
			classNames: {
				selectedItemsContainerClass: 'vk-dropdown-selected-persons',
				usersListContainerClass: 'user-list__content',
				userItemContainerClass: 'user-list__item',
				userImageContainerClass: 'user-item__image-container',
				selectContainerClass: 'vk-dropdown-selected-persons'
			},
			isMulti: true,
			showAvatars: true,
			fetchFromServer: false
		};
		this.config = {
			...this.defaultConfig,
			...config
		};

		this.onBlur = this.onBlur.bind(this);
	}

	/**
	 * Init all necessary classes, renders, start event listeners
	 */
	init() {
		this.dataModel = new DataModel(data);
		this.trie = new Trie(this.dataModel.initialData);
		this.dataModel.data = [...this.dataModel.initialData]
			.splice(0, 12)
			.map(item => item.id);
		this.dataModel.state.list = [...this.dataModel.data].sort();
		this.usersList = new UsersList(
			this.dataModel.data,
			id => this._onItemSelect(id),
			id => this.dataModel.getUserById(id),
			this.config
		);
		this.selectedItems = new SelectedItems(
			this.element,
			id => this._removeSelectedItem(id),
			() => this.showUserList(),
			id => this.dataModel.getUserById(id),
			this.config
		);
		this.renderUsersList();
		this.renderSelectedItems();
		this.trie.init();
		this.initEventListeners();
	}

	/**
	 * Start event listeners
	 */
	initEventListeners() {
		this.btn.addEventListener('click', () => {
			this._onDropdownClick();
		});

		this.textInput.addEventListener('focus', e => {
			this._onFocus(e);
		});

		this.textInput.addEventListener('blur', this.onBlur);

		this.textInput.addEventListener('input', e => {
			this._onChange(e);
		});


		document.body.addEventListener('click', e => {
			e.stopPropagation();
			if (this._usersListShown() && !this.element.contains(e.target)) {
				this.hideUserList();
			}
		});
	}

	/**
	 * Render input of selected users
	 */
	renderSelectedItems() {
		this.selectedItems.container.innerHTML = '';
		this.selectedItems.data = this.dataModel.state.selected;
		this.selectedItems.render();
	}

	/**
	 * Render dropdown with users list
	 */
	renderUsersList() {
		this.usersListElement.innerHTML = '';
		this.usersListElement.appendChild(
			this.usersList.render(this.dataModel.state.list)
		);
	}

	showSpinner() {
		this.usersListElement.innerHTML = '';
		this.usersListElement.appendChild(
			this.usersList.render(null, 'loading')
		);
	}

	/**
	 * Make users list visible
	 */
	showUserList() {
		this.textInput.style.display = 'block';
		this.element.classList.add('vk-dropdown--focused');
		if (this.textInput !== document.activeElement) {
			this.textInput.focus();
		}
	}

	/**
	 * Hides users list
	 */
	hideUserList() {
		if (this.dataModel.state.selected.length) {
			this.textInput.style.display = 'none';
		}
		this.element.classList.remove('vk-dropdown--focused');
		if (this.textInput === document.activeElement) {
			this.textInput.blur();
		}
	}

	/**
	 * Sets state of users list to @DataModel
	 *
	 * @param {Array} [filteredData=[]] Array of user ids
	 */
	_setUserListData(filteredData = []) {
		this.dataModel.state.list = [...filteredData].splice(0, 12).sort();
	}

	/**
	 * Input focus change event handler
	 *
	 * @param {Event} e Change event
	 */
	_onFocus(e) {
		if (this.element.contains(e.target)) {
			if (!this._usersListShown()) {
				this.showUserList();
			}
		}
	}

	/**
	 * Input value change event handler
	 *
	 * @param {Event} e Change event
	 */
	_onChange(e) {
		const value = e.target.value;
		if (value.length > 0) {
			if (this.config.fetchFromServer) {
				this.showSpinner(true);
				this.fetchData(value)
					.then(res => {
						this._setUserListData(
							this.dataModel.compareDataState(
								res,
								this.dataModel.state.selected
							)
						);
						this.renderUsersList();
						return res;
					})
					.catch(err => console.dir(err));
				this.showSpinner(false);	
			} else {
				this.sortData(value.toLowerCase());
				this.renderUsersList();
			}
		} else {
			this._setUserListData(
				this.dataModel.compareDataState(
					this.dataModel.data,
					this.dataModel.state.selected
				)
			);
			this.renderUsersList();
		}
	}

	/**
	 * Blur event handler
	 * @param {Event} e 
	 */
	onBlur(e) {
		if (this._usersListShown() && !this.usersList.container.contains(e.relatedTarget)) {
			this.hideUserList();
		}
	}

	/**
	 * Dropdown click button handler
	 */
	_onDropdownClick() {
		if (this._usersListShown()) {
			this.hideUserList();
		} else {
			this.showUserList();
		}
	}

	/**
	 * Handler for users list item click
	 *
	 * @param {String} id user id
	 */
	_onItemSelect(id) {
		const isIdFromUiData = this.dataModel.data.some(item => {
			if (item === id) {
				if (this.config.isMulti) {
					this.dataModel.state.selected.push(item);
				} else {
					if (this.dataModel.state.selected.length) {
						this.dataModel.state.list.push(
							this.dataModel.state.selected[0]
						);
						this.dataModel.state.list.sort();
					}
					this.dataModel.state.selected.splice(0, 1, item);
				}
				return true;
			}
		});
		if (!isIdFromUiData) {
			this.dataModel.state.selected.push(id);
		}
		this._setUserListData(
			this.dataModel.compareDataState(
				this.dataModel.data,
				this.dataModel.state.selected
			)
		);
		this.textInput.value = '';
		this.renderUsersList();
		this.renderSelectedItems();
	}

	/**
	 * Remove selected item from the list
	 *
	 * @param {String} id user id
	 */
	_removeSelectedItem(id) {
		const index = this.dataModel.state.selected.indexOf(id);
		if (index >= 0) {
			this.dataModel.state.list.push(
				this.dataModel.state.selected.splice(index, 1)[0]
			);
			this.dataModel.state.list.sort();
			this.renderUsersList();
			this.renderSelectedItems();
		}
		if (!this.dataModel.state.selected.length) {
			this.textInput.style.display = 'block';
		}
	}

	/**
	 * Mock for server request
	 *
	 * @param {any} value string to search
	 * @returns {Promise}
	 */
	fetchData(value) {
		return new Promise((resolve, reject) => {
			setTimeout(
				() => resolve(this.trie.getUserIds(value)),
				Math.random() * 500
			);
		});
	}

	/**
	 * Sort data withut server side
	 *
	 * @param {any} value string to search
	 */
	sortData(value) {
		this._setUserListData(
			this.dataModel.compareDataState(
				this.trie.getUserIds(value),
				this.dataModel.state.selected
			)
		);
	}

	/**
	 * Checks if dropdown is shown at this moment
	 *
	 * @returns {Boolean}
	 */
	_usersListShown() {
		return this.element.classList.contains('vk-dropdown--focused');
	}
}