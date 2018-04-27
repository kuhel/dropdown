/**
 * Selected items class
 *
 * @export
 * @class SelectedItems
 */
export default class SelectedItems {
	/**
	 * Creates an instance of SelectedItems.
	 * @param {HTMLElement} container dropdown container
	 * @param {Function} itemClickCallback user button click callback
	 * @param {Function} addCallBack add button click callback
	 * @param {Function} getUser get user info
	 * @param {any} config config actually
	 */
	constructor(
		container,
		itemClickCallback = () => null,
		addCallBack = () => null,
		getUser = () => null,
		config
	) {
		this._data = [];
		this.clickCb = itemClickCallback;
		this.addCb = addCallBack;
		this.getUser = getUser;
		this.config = {
			...config
		};
		this.container = container.querySelector(
			'.' + this.config.classNames.selectContainerClass
		);
	}

	/**
	 * Data getter
	 */
	get data() {
		return this._data;
	}

	/**
	 * Data Setter
	 */
	set data(data) {
		this._data = [...data];
	}

	/**
	 * Renders selected items input
	 */
	render() {
		if (this._data.length) {
			this.container.querySelector(
				'.' + this.config.classNames.selectContainerClass
			);
			this.container.addEventListener('click', e => this._onClick(e));
			this._data.forEach((item, i) => {
				const node = this._createPersonBtn(item);
				this.container.appendChild(node);
			});
			if (this.config.isMulti) {
				this.container.appendChild(this._createAddBtn());
			}
		}
	}

	/**
	 * Add button click handler
	 *
	 * @param {Event} e event
	 */
	_clickAddHandler(e) {
		this.addCb();
	}

	/**
	 * User button click handler
	 *
	 * @param {Event} e event
	 */
	_clickHandler(e) {
		const target = e.target.closest('button');
		console.dir(target.dataset.id);
		this.clickCb(target.dataset.id);
	}

	/**
	 * Creates element for user button
	 *
	 * @param {String} userId
	 * @returns {HTMLElement}
	 */
	_createPersonBtn(userId) {
		const el = document.createElement('button');
		const user = this.getUser(userId);
		el.classList.add('input-btn', 'input-btn--person');
		el.setAttribute('type', 'button');
		el.setAttribute('data-id', user.id);
		el.innerHTML = user.name;
		return el;
	}

	/**
	 * Creates element for add button
	 *
	 * @returns {HTMLElement}
	 */
	_createAddBtn() {
		const el = document.createElement('button');
		el.classList.add('input-btn', 'input-btn--add');
		el.setAttribute('type', 'button');
		el.innerHTML = 'Добавить';
		return el;
	}

	/**
	 * Click resolve
	 *
	 * @param {Event} e Event
	 */
	_onClick(e) {
		e.stopPropagation();
		const target = e.target;
		if (target.classList.contains('input-btn--person')) {
			this._clickHandler(e);
		} else if (target.classList.contains('input-btn--add')) {
			this._clickAddHandler(e);
		}
	}
}
