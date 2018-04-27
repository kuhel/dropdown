export default class SelectedItems {
    constructor(container, itemClickCallback = () => null, addCallBack = () => null, getUser = () => null, config) {
        this._data = [];
        this.clickCb = itemClickCallback;
        this.addCb = addCallBack;
        this.getUser = getUser;
        this.config = {
            classNames: {
                containerClass: 'vk-dropdown-selected-persons'
            },
            isMulti: config.isMulti
        };
        this.container =  container.querySelector('.' + this.config.classNames.containerClass);;
    }

    get data() {
        return this._data;
    }

    set data(data) {
        this._data = [...data];
    } 

    render() {
        if (this._data.length) {
            this.container.querySelector('.' + this.config.classNames.containerClass);
            this.container.addEventListener('click', (e) => this._onClick(e));
            this._data.forEach((item, i) => {
                const node = this._createPersonBtn(item);
                this.container.appendChild(node);
            });
            if (this.config.isMulti) {
                this.container.appendChild(this._createAddBtn());
            }
        }
    }

    _clickAddHandler(e) {
        this.addCb();
    }

    _clickHandler(item) {
        const target = item.target.closest('button');
        console.dir(target.dataset.id);
        this.clickCb(target.dataset.id);
    }

    _createPersonBtn(userId) {
        const el = document.createElement('button');
        const user = this.getUser(userId);
        el.classList.add('input-btn', 'input-btn--person');
        el.setAttribute('type', 'button');
        el.setAttribute('data-id', user.id);
        el.innerHTML = user.name;
        return el;
    }

    _createAddBtn() {
        const el = document.createElement('button');
        el.classList.add('input-btn', 'input-btn--add');
        el.setAttribute('type', 'button');
        el.innerHTML = 'Добавить';
        return el;
    }

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
