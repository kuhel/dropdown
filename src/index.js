import styles from './assets/css/main.scss';

import DropdownController from './assets/js/Dropdown-Controller';

(function() {
	if (typeof Element.prototype.matches !== 'function') {
		Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.webkitMatchesSelector || function matches(selector) {
			var element = this;
			var elements = (element.document || element.ownerDocument).querySelectorAll(selector);
			var index = 0;

			while (elements[index] && elements[index] !== element) {
				++index;
			}

			return Boolean(elements[index]);
		};
	}

	if (typeof Element.prototype.closest !== 'function') {
		Element.prototype.closest = function closest(selector) {
			var element = this;

			while (element && element.nodeType === 1) {
				if (element.matches(selector)) {
					return element;
				}

				element = element.parentNode;
			}

			return null;
		};
	}
	if (window.NodeList && !NodeList.prototype.forEach) {
		NodeList.prototype.forEach = function(callback, thisArg) {
			thisArg = thisArg || window;
			for (var i = 0; i < this.length; i++) {
				callback.call(thisArg, this[i], i, this);
			}
		};
	}
})();

const nodes = document.querySelectorAll('.vk-dropdown');

const first = new DropdownController(nodes[0]);
first.init();

const second = new DropdownController(nodes[1], { isMulti: false });
second.init();

const third = new DropdownController(nodes[2], { showAvatars: false });
third.init();

const fourth = new DropdownController(nodes[3], { fetchFromServer: true });
fourth.init();
