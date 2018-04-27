import styles from './assets/css/main.scss';

import DropdownController from './assets/js/Dropdown-Controller';

if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
        thisArg = thisArg || window;
        for (var i = 0; i < this.length; i++) {
            callback.call(thisArg, this[i], i, this);
        }
    };
}

const nodes = document.querySelectorAll('.vk-dropdown');

const first = new DropdownController(nodes[0]);
first.init();

const second = new DropdownController(nodes[1], {isMulti: false});
second.init();

const third = new DropdownController(nodes[2], {showAvatars: false});
third.init();

const fourth = new DropdownController(nodes[3], {fetchFromServer: true});
fourth.init();