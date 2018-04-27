import DICT from './Dictionary';

export const convertToTranslit = (string) => {
    let result = string;
    DICT.TRANSLIT.forEach((pair) => {
        const pairArray = pair.split(';');
        result = result.replace(new RegExp(pairArray[0], 'g'), pairArray[1]);
    });

    return result;
}

export const trimString = (string) => {
    return string.slice(-1) === ' ' ? string.slice(0, -1) : string;
}

export const switchKeyboard = (char) => {
    const index = {
        ru: DICT.KEYBOARD.RU.indexOf(char),
        eng: DICT.KEYBOARD.ENG.indexOf(char)
    };

    if (index.ru >= 0) {
        return DICT.KEYBOARD.ENG[index.ru];
    } else if (index.eng >= 0) {
        return DICT.KEYBOARD.RU[index.eng];
    }
}