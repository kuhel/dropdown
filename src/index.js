/* eslint-disable */
import styles from './assets/css/main.scss';
import polyfills from './assets/js/polyfills';
import DropdownController from './assets/js/Dropdown-Controller';
import data from './assets/js/data';

const nodes = document.querySelectorAll('.vk-dropdown');

const first = new DropdownController(nodes[0]);
first.init();

const second = new DropdownController(nodes[1], {
	isMulti: false
});
second.init();

const third = new DropdownController(nodes[2], {
	showAvatars: false
});
third.init();

const fourth = new DropdownController(nodes[3], {
	fetchFromServer: true
});
fourth.init();

document.getElementById('users').innerHTML = data.map(user => `<li class="user"><strong>${user.name}</strong> — ${user.domain}</li>`).join('\n');