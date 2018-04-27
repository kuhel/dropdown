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
		this.config = {
			...config
		};
	}

	/**
	 * Renders users list
	 *
	 * @param {Array} data array of user ids
	 * @returns {HTMLElement}
	 */
	render(data) {
		const doc = document.createDocumentFragment();
		const container = document.createElement('ul');
		container.classList.add(this.config.classNames.usersListContainerClass);
		container.addEventListener('click', e => {
			this._clickHandler(e);
		});
		if (data.length) {
			data.forEach((item, i) => {
				const node = this._createPersonNode(item, i);
				container.appendChild(node);
			});
		} else {
			container.appendChild(this._createNotFoundNode());
		}
		doc.appendChild(container);
		return doc;
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
		this.clickCb(target.dataset.id);
	}

	/**
	 * Creates element for person data
	 *
	 * @param {Object} userId Data about user with keys "id", "name" ,"pic", "domain"
	 * @param {Number} num number of person in data array
	 * @returns {HTMLElement}
	 */
	_createPersonNode(userId, num) {
		const el = document.createElement('li');
		const user = this.getUserById(userId);
		el.classList.add(
			this.config.classNames.userItemContainerClass,
			'clearfix'
		);
		el.setAttribute('tabindex', num + 1);
		el.setAttribute('data-id', user.id);
		el.innerHTML = this._renderPerson(user);

		if (this.config.showAvatars) {
			el
				.querySelector(
					'.' + this.config.classNames.userImageContainerClass
				)
				.appendChild(this._renderPersonImage(user.pic));
		}
		return el;
	}

	/**
	 * Renders item for no results
	 *
	 * @returns {HTMLElement}
	 */
	_createNotFoundNode() {
		const el = document.createElement('li');
		el.classList.add(
			this.config.classNames.userItemContainerClass,
			'clearfix'
		);
		el.setAttribute('tabindex', 1);
		el.innerHTML = this._renderNotFound();
		return el;
	}

	/**
	 * Just markup for no results
	 *
	 * @returns {String}
	 * @memberof UsersList
	 */
	_renderNotFound() {
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
	_renderPerson(user) {
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
	_renderPersonImage(pic) {
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
