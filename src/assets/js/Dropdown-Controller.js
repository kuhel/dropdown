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
		this.activeListItemIndex = null;
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

		this._onBlur = this._onBlur.bind(this);
		this._onChange = this._onChange.bind(this);
		this._onDropdownClick = this._onDropdownClick.bind(this);
		this._onFocus = this._onFocus.bind(this);
		this._onKeyDown = this._onKeyDown.bind(this);
		this._onMouseOver = this._onMouseOver.bind(this);
		this._onOutsideClick = this._onOutsideClick.bind(this);
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
	 * Destroy
	 */
	destroy() {
		this.usersList.container.innerHTML = '';
		this.removeEventListeners();
	}

	/**
	 * Start event listeners
	 */
	initEventListeners() {
		this.btn.addEventListener('click', this._onDropdownClick);

		this.textInput.addEventListener('focus', this._onFocus);

		this.textInput.addEventListener('blur', this._onBlur);

		this.textInput.addEventListener('input', this._onChange);

		this.element.addEventListener('keydown', this._onKeyDown);

		this.usersListElement.addEventListener('mouseover', this._onMouseOver);

		document.body.addEventListener('click', this._onOutsideClick);
	}

	/**
	 * Destrou event listeners
	 */
	removeEventListeners() {
		this.btn.removeEventListener('click', this._onDropdownClick);

		this.textInput.removeEventListener('focus', this._onFocus);

		this.textInput.removeEventListener('blur', this._onBlur);

		this.textInput.removeEventListener('input', this._onChange);

		this.element.removeEventListener('keydown', this._onKeyDown);

		this.usersListElement.removeEventListener('mouseover', this._onMouseOver);

		document.body.removeEventListener('click', this._onOutsideClick);
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
		this.activeListItemIndex = 1;
		this.setActiveItem(this.usersList.container.childNodes[0]);
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
			if (!this.usersListShown()) {
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
	 * 
	 * @param {Event} e 
	 */
	_onBlur(e) {
		if (this.usersListShown() && !this.usersList.container.contains(e.relatedTarget)) {
			this.hideUserList();
		}
	}

	/**
	 * Outside click handler
	 * 
	 * @param {Event} e 
	 */
	_onOutsideClick(e) {
		e.stopPropagation();
		if (this.usersListShown() && !this.element.contains(e.target)) {
			this.hideUserList();
		}
	}

	/**
	 * Dropdown click button handler
	 * 
	 */
	_onDropdownClick() {
		if (this.usersListShown()) {
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
	 * Key press handler
	 * 
	 * @param {Event} e 
	 */
	_onKeyDown(e) {
		// 13: Enter, 38: Up, 40: down
		if (this.usersListShown()) {
			const dir = e.keyCode === 40;
			console.log('Key: ', this.activeListItemIndex);
			const items = this.usersList.container.childNodes;
			switch (e.keyCode) {
				case 27:
					this.hideUserList();
					break;
				case 40:
					if (this.activeListItemIndex < items.length) {
						this.activeListItemIndex++;
					}
					this.arrowKeyActions(dir, items[this.activeListItemIndex - 1]);
					break;
				case 38:
					if (this.activeListItemIndex > 1) {
						this.activeListItemIndex--;
					}
					this.arrowKeyActions(dir, items[this.activeListItemIndex - 1]);
					break;
				case 13:
					const item = items[this.activeListItemIndex - 1];
					if (item) {
						this._onItemSelect(item.dataset.id);
						this.hideUserList();
					}
				default:
					return;
			}
		}
	}

	/**
	 * Mouse Over handler
	 * 
	 * @param {Event} e 
	 */
	_onMouseOver(e) {
		const activeItem = e.target.closest('li');
		if (activeItem) {
			this.setActiveItem(activeItem);
		}
	}

	/**
	 * Setting active item actions
	 * 
	 * @param {any} item 
	 */
	setActiveItem(item) {
		this.activeListItemIndex = parseInt(item.getAttribute('tabindex'), 10);
		this._clearClasses();
		item.classList.add('active');
		console.log('Mouseover: ', this.activeListItemIndex);
	}

	/**
	 * Actions with DOM for up/down keys
	 * 
	 * @param {Boolean} dir Direction of keys
	 * @param {HTMLElement} item active element
	 */
	arrowKeyActions(dir, item) {
		this._clearClasses();
		item.classList.add('active');
		this.scrollContainer(item, dir);
	}

	scrollContainer(element, dir) {
		const list = this.usersListElement.childNodes[0];
		const elemRect = {
			top: element.offsetTop,
			bottom: element.offsetTop + element.offsetHeight
		};
		const listRect = {
			scrollTop: list.scrollTop,
			height: list.offsetHeight

		};
		const inTheView = {
			up: (listRect.height + elemRect.top < listRect.height + listRect.scrollTop),
			down: elemRect.bottom > listRect.height
		}

		if (dir && inTheView.down) {
			list.scrollTop = elemRect.bottom - listRect.height;
		} else if (!dir && inTheView.up) {
			list.scrollTop = elemRect.top;
		}
	}

	/**
	 * Empties classlist for all items
	 * 
	 */
	_clearClasses() {
		Array.prototype.slice.call(this.usersList.container.childNodes)
			.filter(el => el.classList.contains('active'))
			.forEach(el => el.classList.remove('active'));
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
		return new Promise(resolve => {
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
	usersListShown() {
		return this.element.classList.contains('vk-dropdown--focused');
	}
}