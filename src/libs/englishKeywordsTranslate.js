import { sleep } from '../utils';

function translate(query = '', lang) {
    if (!query.trim()) return Promise.resolve('');
    const url = new URL(`${process.env.REACT_APP_NMT_URL}/lemmatize_sentence`);
    url.searchParams.append('sentence', query);
    url.searchParams.append('lang', 'en');

    return new Promise((resolve, reject) => {
        fetch(url.href)
            .then((data) => data.json())
            .then((data) => {
                if (data) {
                    resolve(data);
                } else {
                    resolve('');
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
}

export default async function englishKeywordsTranslate(subtitle = [], lang) {
    return new Promise((resolve, reject) => {
        const result = [];
        (function loop() {
            const item = subtitle.shift();
            if (item) {
                translate(item.text, lang)
                    .then((text) => {
                        item.text = text;
                        result.push(item);
                        sleep(100).then(loop);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            } else {
                resolve(result);
            }
        })();
    });
}
