/**
 * Class for rendering users list in dropdown
 *
 * @export
 * @class UsersList
 */
export default class UsersList {
	/**
	 * Creates an instance of UsersList
	 *
	 * @param {Array} data array of user ids
	 * @param {Function} itemClickCallback click event callback
	 * @param {Function} getUser user info getter
	 * @param {Object} config config actually
	 */
	constructor(
		data = [],
		itemClickCallback = () => null,
		getUser = () => {},
		config
	) {
		this.clickCb = itemClickCallback;
		this.getUserById = getUser;
		this.IMAGE_LOAD_TIMEOUT = 4000;
		this.container = null;
		this.config = {
			...config
		};
	}

	/**
	 * Renders users list
	 *
	 * @param {Array} data array of user ids
	 * @param {String} content string with markup
	 * @returns {HTMLElement}
	 */
	render(data, content = null) {
		const doc = document.createDocumentFragment();
		this.container = document.createElement('ul');
		this.container.classList.add(this.config.classNames.usersListContainerClass);
		this.container.addEventListener('click', e => {
			this._clickHandler(e);
		});
		if (content !== null) {
			this.container.appendChild(this.createLoadingNode());
		} else {
			this.renderData(data);
		}
		doc.appendChild(this.container);
		return doc;
	}

	/**
	 * Renderes data to li
	 * 
	 * @param {Array} data user data
	 */
	renderData(data) {
		if (data.length) {
			data.forEach((item, i) => {
				const node = this.createPersonNode(item, i);
				this.container.appendChild(node);
			});
		} else {
			this.container.appendChild(this.createNotFoundNode());
		}
	}

	/**
	 * Click handler
	 *
	 * @param {Event} event event
	 * @memberof UsersList
	 */
	_clickHandler(event) {
		const target = event.target.closest(
			'.' + this.config.classNames.userItemContainerClass
		);
		if (target.dataset.hasOwnProperty(id)) {
			this.clickCb(target.dataset.id);
		}
	}

	/**
	 * Creates generic element
	 *
	 * @returns {HTMLElement}
	 */
	createItemNode() {
		const el = document.createElement('li');
		el.classList.add(
			this.config.classNames.userItemContainerClass,
			'clearfix'
		);
		return el;
	}

	/**
	 * Creates element for person data
	 *
	 * @param {Object} userId Data about user with keys "id", "name" ,"pic", "domain"
	 * @param {Number} num number of person in data array
	 * @returns {HTMLElement}
	 */
	createPersonNode(userId, num) {
		const el = this.createItemNode();
		const user = this.getUserById(userId);
		el.setAttribute('tabindex', num + 1);
		el.setAttribute('data-id', user.id);
		el.innerHTML = this.renderPerson(user);

		if (this.config.showAvatars) {
			el
				.querySelector(
					'.' + this.config.classNames.userImageContainerClass
				)
				.appendChild(this.renderPersonImage(user.pic));
		}
		return el;
	}

	/**
	 * Renders item for no results
	 *
	 * @returns {HTMLElement}
	 */
	createNotFoundNode() {
		const el = this.createItemNode();
		el.setAttribute('tabindex', 1);
		el.innerHTML = this.renderNotFound();
		return el;
	}

	/**
	 * Renders item for loading
	 *
	 * @returns {HTMLElement}
	 */
	createLoadingNode() {
		const el = this.createItemNode();
		el.setAttribute('tabindex', 1);
		el.innerHTML = this.renderLoading();
		return el;
	}

	/**
	 * Markup for loading
	 *
	 * @returns {String}
	 * @memberof UsersList
	 */
	renderLoading() {
		return `
			<div class="spinner">
				<span></span>
				<span></span>
				<span></span>
			</div>`;
	}

	/**
	 * Just markup for no results
	 *
	 * @returns {String}
	 * @memberof UsersList
	 */
	renderNotFound() {
		return `
			<div class="user-item user-item--not-found">
				<span class="user-item__info">Пользователь с таким именем не найден</span>
			</div>`;
	}

	/**
	 * Renders markup of single VK user
	 *
	 * @param {Object} user Data about user with keys "id", "name" ,"pic", "domain"
	 * @returns {String} Markup of element
	 */
	renderPerson(user) {
		return `
			<div class="user-item">
				${
					this.config.showAvatars
						? '<div class="user-item__image-container"></div>'
						: ''
				}
				<div class="user-item__info">
					<span class="user-item__name">${user.name}</span>
				</div>
			</div>`;
	}

	/**
	 * Creates Image Element with image source loading handling
	 *
	 * @param {String} pic Image URL
	 * @returns {HTMLImageElement}
	 */
	renderPersonImage(pic) {
		const img = new Image();
		let loadErrorTimeout;

		img.addEventListener('load', () => clearTimeout(loadErrorTimeout));
		img.addEventListener('error', () =>
			img.classList.add('picture-load-failure')
		);

		img.src = pic;

		loadErrorTimeout = setTimeout(() => {
			img.src = '';
			img.classList.add('picture-load-failure');
		}, this.IMAGE_LOAD_TIMEOUT);
		return img;
	}
}