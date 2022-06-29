export async function ai4BharatBatchTranslate(subtitle = [], from_lang, to_lang) {
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
                    source_language: from_lang,
                    target_language: to_lang,
                };
                fetch(`${process.env.REACT_APP_NMT_URL}/batch_translate`, {
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
                      //  console.log(resp);
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

export async function ai4BharatASRTranslate(webvtt, from_lang, to_lang) {
    console.log('ai4bharat vtt_translate clicked');

    return new Promise((resolve, reject) => {
        const body = {
            webvtt: webvtt,
            source_language: from_lang,
            target_language: to_lang,
        };
        fetch(`${process.env.REACT_APP_NMT_URL}/translate_vtt`, {
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
              //  console.log(resp);
                resolve(resp.text);
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });
    });
}
