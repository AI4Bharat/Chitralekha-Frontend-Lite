export default async function ai4BharatTranslate(subtitle = [], lang) {
    console.log('ai4bharat translate clicked');
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
