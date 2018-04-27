import { convertToTranslit, switchKeyboard, trimString } from './utils';
import DICT from './Dictionary';

export default class Trie {
    constructor (data) {
        this.data = data;
        this.tree = {};
        this.getUserIds = this.getUserIds.bind(this);
        this.getUsers = this.getUsers.bind(this);
    }

    createNodes(user, queryString, options = { 
        translit: false, 
        switched: false
    }) {
        let _tree = this.tree;
        let _string = queryString.toLowerCase();

        if (options.translit && DICT.ABC.RU.indexOf(_string.charAt(0)) > -1) {
            _string = convertToTranslit(_string);
        }


        for(let charIndex = 0; charIndex < _string.length; charIndex ++) {
            let char = _string.charAt(charIndex);

            if (options.switched) {
                char = switchKeyboard(char);
            }

            _tree = this.setIds(char, charIndex, _string, _tree, user.id);
        }
    }

    init() {
        this.data.forEach((user) => {
            user.name.split(' ').forEach(string => {
                this.useCases(user, string);
            })
        });
    }

    getNodeids(node) {
        const ids = [];
        const currentNode = [node];

        while (currentNode.length) {
            const childNode = currentNode.shift();

            if (childNode.ids) {
                childNode.ids.forEach(item => ids.indexOf(item) < 0 ? ids.push(item) : null);
            }

            Object.keys(childNode).forEach(item => item !== 'ids' ? currentNode.push(childNode[item]) : null);
        }

        return ids;
    }

    getUserIds(query) {
        const wordArray = trimString(query).split(' ');
        
        if (wordArray.length === 2) {
            const name = this.getUsers(wordArray[0]);
            const surname = this.getUsers(wordArray[1]);
            return name.filter(item => surname.indexOf(item) >= 0);
        }
        return this.getUsers(wordArray[0]);
    }

    getUsers(query) {
        let _tree = this.tree;
        const userIds = [];

        query.split('').forEach((item, i) => {
            if (_tree[item]) {
                _tree = _tree[item];
                if (i === query.length - 1) {
                    userIds.push.apply(userIds, this.getNodeids(_tree).filter(id => userIds.indexOf(id) < 0));
                }
            }
        });

        return userIds;
    }

    useCases(user, string) {
        this.createNodes(user, string);
        this.createNodes(user, user.domain);
        this.createNodes(user, string, {switched: true});
        this.createNodes(user, string, {translit: true});
        this.createNodes(user, string, {switched: true, translit: true});
    }

    setIds(char, charIndex, string, tree, id) {
        if (charIndex === string.length - 1) {
            if(!tree[char]) {
                tree[char] = {
                    ids: []
                };
            } else if (!tree[char].ids) {
                tree[char].ids = [];
            }
            if (tree[char].ids.indexOf(id) < 0) {
                tree[char].ids.push(id);
            }
        } else if (!tree[char]) {
            tree[char] = {};
        }
        return tree[char];
    }
}
