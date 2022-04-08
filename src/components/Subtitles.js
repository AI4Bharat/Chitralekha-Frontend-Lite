import styled from 'styled-components';
import languages from '../libs/languages';
import React, { useState, useCallback, useEffect } from 'react';
import { Table } from 'react-virtualized';
import unescape from 'lodash/unescape';
import debounce from 'lodash/debounce';
import { ReactTransliterate } from 'react-transliterate';
import { t, Translate } from 'react-i18nify';
// import englishKeywordsTranslate from '../libs/englishKeywordsTranslate';
import googleTranslate from '../libs/googleTranslate';
import { ai4BharatBatchTranslate, ai4BharatASRTranslate } from '../libs/ai4BharatTranslate';
import { sub2vtt, url2sub, vtt2url } from '../libs/readSub';

const Style = styled.div`
    position: relative;
    box-shadow: 0px 5px 25px 5px rgb(0 0 0 / 80%);
    background-color: rgb(0 0 0 / 100%);

    .translate {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
        border-bottom: 1px solid rgb(255 255 255 / 20%);
        height: 80px;

        .heading {
            h4 {
                margin: 0;
            }
        }

        .options {
            display: flex;
            width: 80%;
        }

        select {
            width: 65%;
            outline: none;
            height: 35px;
            border-radius: 3px;
        }

        .btn {
            opacity: 0.85;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 35px;
            width: 50%;
            border-radius: 3px;
            color: #fff;
            cursor: pointer;
            font-size: 13px;
            background-color: #673ab7;
            transition: all 0.2s ease 0s;

            &:hover {
                opacity: 1;
            }
        }
    }

    .reference {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
        height: 80px;
        border-bottom: 1px solid rgb(255 255 255 / 20%);

        h4 {
            margin-bottom: 0;
            margin-top: 0;
        }
    }

    .ReactVirtualized__Table {
        .ReactVirtualized__Table__Grid {
            outline: none;
        }

        .ReactVirtualized__Grid__innerScrollContainer {
            overflow: visible !important;
        }

        .ReactVirtualized__Table__row {
            overflow: visible !important;
            .item {
                height: 100%;
                padding: 10px;

                ul {
                    position: absolute !important;
                    bottom: 200px !important;
                    left: 0 !important;
                    z-index: 9999 !important;
                    height: 170px !important;
                    width: 100% !important;
                    transform: translate(0px, 0px) !important;
                    display: block !important;

                    li {
                        color: #000 !important;
                        border-bottom: 1px solid #999;
                    }
                }

                .textarea {
                    border: none;
                    width: 100%;
                    height: 100%;
                    color: #fff;
                    font-size: 12px;
                    padding: 10px;
                    text-align: center;
                    background-color: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.2s ease;
                    resize: none;
                    outline: none;

                    word-wrap: break-word;

                    &.highlight {
                        background-color: rgb(0 87 158);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                    }

                    &.illegal {
                        background-color: rgb(123 29 0);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                    }
                }
            }
        }
    }
`;

export default function Subtitles({
    currentIndex,
    subtitle,
    setSubtitleOriginal,
    checkSub,
    player,
    updateSub,
    language,
    setLoading,
    subtitleEnglish,
    formatSub,
    setSubtitle,
    notify,
    isPrimary,
    clearedSubs,
    setClearedSubs,
    configuration,
    updateSubOriginal = null,
    translationApi,
}) {
    const [height, setHeight] = useState(100);
    const [translate, setTranslate] = useState(null);

    const [languageAvailable, setLanguageAvailable] = useState(languages);

    useEffect(() => {
        if (localStorage.getItem('lang')) {
            setTranslate(localStorage.getItem('lang'));
        } else {
            setTranslate('en');
        }
    }, []);
    useEffect(() => {
        if (translationApi === 'AI4Bharat') {
            fetch(`${process.env.REACT_APP_NMT_URL}/supported_languages`)
                .then((resp) => {
                    return resp.json();
                })
                .then((resp) => {
                    let langArray = [];
                    langArray.push({ name: 'English', key: 'en' });
                    for (const key in resp) {
                        langArray.push({ name: `${key}`, key: `${resp[key]}` });
                    }
                    setLanguageAvailable(langArray);
                    localStorage.setItem('lang', langArray[0].key);
                    setTranslate(langArray[0].key);
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            setLanguageAvailable(languages);
            localStorage.setItem('lang', languages['en'][1].key);
            setTranslate(languages['en'][1].key);
        }
    }, [translationApi]);
    const handleBlur = (data, index) => {
        //console.log(e.target.value);
        if (isPrimary) {
            return;
        }
        console.log(translationApi);
        if (translationApi === 'AI4Bharat') {
            return;
            // ai4BharatBatchTranslate([{ text: data.text }], 'hi', localStorage.getItem('lang')).then((resp) => {
            //     updateSubOriginal(data, resp[0], index);
            // });
        } else {
            googleTranslate([{ text: data.text }], localStorage.getItem('lang')).then((resp) => {
                updateSubOriginal(data, resp[0], index);
            });
        }
    };

    const resize = useCallback(() => {
        setHeight(document.body.clientHeight - 240);
    }, [setHeight]);

    useEffect(() => {
        resize();
        if (!resize.init) {
            resize.init = true;
            const debounceResize = debounce(resize, 500);
            window.addEventListener('resize', debounceResize);
        }
    }, [resize]);

    const onTranslate = useCallback(() => {
        console.log(translationApi);
        setLoading(t('TRANSLATING'));

        if (clearedSubs) {
            // if (translate === 'en-k') {
            //     return googleTranslate(formatSub(JSON.parse(window.localStorage.getItem('subsBeforeClear'))), 'en')
            //         .then((res) => {
            //             englishKeywordsTranslate(formatSub(res), translate)
            //                 .then((res) => {
            //                     setLoading('');
            //                     setSubtitle(formatSub(res));
            //                     localStorage.setItem('currentLang', 'en');
            //                     notify({
            //                         message: t('TRANSLAT_SUCCESS'),
            //                         level: 'success',
            //                     });
            //                 })
            //                 .catch((err) => {
            //                     setLoading('');
            //                     notify({
            //                         message: err.message,
            //                         level: 'error',
            //                     });
            //                 });
            //         })
            //         .catch((err) => {
            //             setLoading('');
            //             notify({
            //                 message: err.message,
            //                 level: 'error',
            //             });
            //         });
            // }

            if (translationApi === 'AI4Bharat') {
                return ai4BharatBatchTranslate(
                    formatSub(JSON.parse(window.localStorage.getItem('subsBeforeClear'))),
                    'en',
                    translate,
                )
                    .then((res) => {
                        setLoading('');
                        setSubtitle(formatSub(res));
                        localStorage.setItem('currentLang', translate);
                        notify({
                            message: t('TRANSLAT_SUCCESS'),
                            level: 'success',
                        });
                    })
                    .catch((err) => {
                        setLoading('');
                        notify({
                            message: err.message,
                            level: 'error',
                        });
                    });
            }

            return googleTranslate(formatSub(JSON.parse(window.localStorage.getItem('subsBeforeClear'))), translate)
                .then((res) => {
                    setLoading('');
                    setSubtitle(formatSub(res));
                    localStorage.setItem('currentLang', translate);
                    notify({
                        message: t('TRANSLAT_SUCCESS'),
                        level: 'success',
                    });
                })
                .catch((err) => {
                    setLoading('');
                    notify({
                        message: err.message,
                        level: 'error',
                    });
                });
        }

        // if (translate === 'en-k') {
        //     return googleTranslate(formatSub(subtitle), 'en')
        //         .then((res) => {
        //             englishKeywordsTranslate(formatSub(res), translate)
        //                 .then((res) => {
        //                     setLoading('');
        //                     setSubtitle(formatSub(res));
        //                     localStorage.setItem('currentLang', 'en');
        //                     notify({
        //                         message: t('TRANSLAT_SUCCESS'),
        //                         level: 'success',
        //                     });
        //                 })
        //                 .catch((err) => {
        //                     setLoading('');
        //                     notify({
        //                         message: err.message,
        //                         level: 'error',
        //                     });
        //                 });
        //         })
        //         .catch((err) => {
        //             setLoading('');
        //             notify({
        //                 message: err.message,
        //                 level: 'error',
        //             });
        //         });
        // }
        if (translationApi === 'AI4Bharat') {
            // console.log('ai4bharat api');
            return ai4BharatASRTranslate(sub2vtt(formatSub(subtitleEnglish)), 'hi', translate)
                .then((res) => {
                    console.log(res);
                    const suburl = vtt2url(res);
                    url2sub(suburl).then((urlsub) => {
                        setSubtitle(formatSub(urlsub));
                        localStorage.setItem('currentLang', translate);
                        setLoading('');
                        notify({
                            message: t('TRANSLAT_SUCCESS'),
                            level: 'success',
                        });
                    });
                })
                .catch((err) => {
                    setLoading('');
                    notify({
                        message: err.message,
                        level: 'error',
                    });
                });
        }

        // console.log('google api');
        return googleTranslate(formatSub(subtitleEnglish), translate)
            .then((res) => {
                setLoading('');
                setSubtitle(formatSub(res));
                localStorage.setItem('currentLang', translate);
                notify({
                    message: t('TRANSLAT_SUCCESS'),
                    level: 'success',
                });
            })
            .catch((err) => {
                setLoading('');
                notify({
                    message: err.message,
                    level: 'error',
                });
            });
    }, [setLoading, subtitleEnglish, formatSub, setSubtitle, translate, notify, clearedSubs, translationApi]);

    return (
        subtitle && (
            <Style className="subtitles">
                {isPrimary && translate && languageAvailable && (
                    <div className="translate">
                        <div className="heading">
                            <h4>Translation</h4>
                        </div>
                        <div className="options">
                            <select
                                value={translate}
                                onChange={(event) => {
                                    setTranslate(event.target.value);
                                    localStorage.setItem('lang', event.target.value);
                                }}
                            >
                                {(languageAvailable[language] || languageAvailable.en || languageAvailable).map(
                                    (item) =>
                                        item.key !== 'en' && (
                                            <option key={item.key} value={item.key}>
                                                {item.name}
                                            </option>
                                        ),
                                )}
                            </select>
                            <div className="btn" onClick={onTranslate}>
                                <Translate value="TRANSLATE" />
                            </div>
                        </div>
                    </div>
                )}

                {!isPrimary && (
                    <div className="reference">
                        <h4>Reference Subtitles</h4>
                        <span>Language : {languages['en'].filter((item) => item.key === language)[0].name}</span>
                    </div>
                )}

                <Table
                    headerHeight={40}
                    width={250}
                    height={height}
                    rowHeight={80}
                    scrollToIndex={currentIndex}
                    rowCount={subtitle.length}
                    rowGetter={({ index }) => subtitle[index]}
                    headerRowRenderer={() => null}
                    rowRenderer={(props) => {
                        return (
                            <div
                                key={props.key}
                                className={props.className}
                                style={props.style}
                                onClick={() => {
                                    if (player) {
                                        player.pause();
                                        if (player.duration >= props.rowData.startTime) {
                                            player.currentTime = props.rowData.startTime + 0.001;
                                        }
                                    }
                                }}
                            >
                                <div className="item">
                                    <ReactTransliterate
                                        className={[
                                            'textarea',
                                            currentIndex === props.index ? 'highlight' : '',
                                            checkSub(props.rowData) ? 'illegal' : '',
                                        ]
                                            .join(' ')
                                            .trim()}
                                        value={unescape(props.rowData.text)}
                                        spellCheck={false}
                                        onChangeText={(event) => {
                                            updateSub(props.rowData, {
                                                text: event,
                                            });
                                        }}
                                        onBlur={() => handleBlur(props.rowData, props.index)}
                                        enabled={
                                            isPrimary
                                                ? !localStorage.getItem('lang') ||
                                                    localStorage.getItem('lang') === 'en' ||
                                                    localStorage.getItem('lang') === 'en-k'
                                                    ? false
                                                    : true
                                                : false
                                        }
                                        lang={
                                            isPrimary
                                                ? localStorage.getItem('lang') === 'en-k'
                                                    ? 'en'
                                                    : localStorage.getItem('lang')
                                                : 'en'
                                        }
                                        maxOptions={5}
                                        renderComponent={(props) => <textarea {...props} />}
                                    />
                                    {/* <textarea
                                    maxLength={200}
                                    spellCheck={false}
                                    className={[
                                        'textarea',
                                        currentIndex === props.index ? 'highlight' : '',
                                        checkSub(props.rowData) ? 'illegal' : '',
                                    ]
                                        .join(' ')
                                        .trim()}
                                    value={unescape(props.rowData.text)}
                                    onChange={(event) => {
                                        updateSub(props.rowData, {
                                            text: event.target.value,
                                        });
                                    }}
                                /> */}
                                </div>
                            </div>
                        );
                    }}
                ></Table>
            </Style>
        )
    );
}
