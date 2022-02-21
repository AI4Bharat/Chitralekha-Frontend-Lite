// import { sleep } from '../utils';

// function translate(query = '', lang) {
//     if (!query.trim()) return Promise.resolve('');
//     const url = new URL('https://translate.googleapis.com/translate_a/single');
//     url.searchParams.append('client', 'gtx');
//     url.searchParams.append('sl', 'auto');
//     url.searchParams.append('dt', 't');
//     url.searchParams.append('tl', lang);
//     url.searchParams.append('q', query);

//     return new Promise((resolve, reject) => {
//         fetch(url.href)
//             .then((data) => data.json())
//             .then((data) => {
//                 if (data) {
//                     resolve(data[0].map((item) => item[0].trim()).join('\n'));
//                 } else {
//                     resolve('');
//                 }
//             })
//             .catch((err) => {
//                 reject(err);
//             });
//     });
// }

// export default async function googleTranslate(subtitle = [], lang) {
//     return new Promise((resolve, reject) => {
//         const result = [];
//         (function loop() {
//             const item = subtitle.shift();
//             if (item) {
//                 translate(item.text, lang)
//                     .then((text) => {
//                         item.text = text;
//                         result.push(item);
//                         sleep(100).then(loop);
//                     })
//                     .catch((err) => {
//                         reject(err);
//                     });
//             } else {
//                 resolve(result);
//             }
//         })();
//     });
// }

export default async function googleTranslate(subtitle = [], lang) {
    return new Promise((resolve, reject) => {
        const result = [];
        const entireArray = [];
        (function loop() {
            const item = subtitle.shift();
            if (item) {
                result.push(item.text);
                entireArray.push(item);
                loop();
            } else {
                const body = {
                    text_lines: result,
                    source_language: 'en',
                    target_language: lang,
                };
                fetch('http://13.90.168.58:8080/batch_translate', {
                    method: 'POST',
                    body: JSON.stringify(body),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                    .then((resp) => {
                        return resp.json();
                    })
                    .then((resp) => {
                        console.log(resp);
                        for (let i = 0; i < resp.text_lines.length; i++) {
                            entireArray[i].text = resp.text_lines[i];
                        }
                        resolve(entireArray);
                    })
                    .catch((err) => {
                        console.log(err);
                        reject(err);
                    });
            }
        })();
    });
}
