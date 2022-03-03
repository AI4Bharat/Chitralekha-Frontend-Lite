// ff450a7f531a4e9ab43bd2dd87cdbfcc

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
import { url2sub, vtt2url } from '../libs/readSub';
// import { url2sub, vtt2url } from '../libs/readSub';

const Style = styled.div`
    position: relative;
    box-shadow: 0px 5px 25px 5px rgb(0 0 0 / 80%);
    background-color: rgb(0 0 0 / 100%);

    .transcribe {
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
            width: 100%;
            align-items: center;
            justify-content: center;

            span {
                font-size: 18px;
            }
        }

        .btn {
            opacity: 0.85;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 35px;
            width: 60%;
            border-radius: 3px;
            color: #fff;
            cursor: pointer;
            font-size: 13px;
            background-color: #673ab7;
            transition: all 0.2s ease 0s;
            margin-right: 10px;

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

export default function SameLanguageSubtitles({
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
    updateSubOriginal = null,
    clearSubs,
    setSubtitleEnglish,
}) {
    const [height, setHeight] = useState(100);
    // const [translate, setTranslate] = useState(null);

    const handleBlur = (data, index) => {
        //console.log(e.target.value);
        if (isPrimary) {
            return;
        }
        googleTranslate([{ text: data.text }], localStorage.getItem('lang')).then((resp) => {
            updateSubOriginal(data, resp[0], index);
        });
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

    const onTranscribe = useCallback(() => {
        console.log(localStorage.getItem('audioSrc'));

        setLoading(t('TRANSCRIBING'));
        const audio = localStorage.getItem('audioSrc');

        const data = {
            audio_url: audio,
            vad_level: 2,
            chunk_size: 10,
            language: 'en',
        };

        return fetch(`${process.env.REACT_APP_ASR_URL}/transcribe_audio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
            .then((resp) => resp.json())
            .then((resp) => {
                console.log(resp.output);
                player.currentTime = 0;
                clearSubs();
                const suburl = vtt2url(resp.output);
                url2sub(suburl).then((urlsub) => {
                    setSubtitle(formatSub(urlsub));
                    setSubtitleEnglish(formatSub(urlsub));
                    localStorage.setItem('subtitle', JSON.stringify(urlsub));
                    localStorage.setItem('subtitleEnglish', JSON.stringify(urlsub));
                });
            })
            .then(() => setLoading(''))
            .catch((err) => {
                console.log(err);
                setLoading('');
                notify({
                    message: err.message,
                    level: 'error',
                });
            });
    }, [setLoading, formatSub, setSubtitle, notify, clearSubs, player, setSubtitleEnglish]);

    // useEffect(() => {
    //     if (localStorage.getItem('lang')) {
    //         setTranslate(localStorage.getItem('lang'));
    //     } else {
    //         setTranslate('en');
    //     }
    // }, []);

    return (
        subtitle && (
            <Style className="subtitles">
                {isPrimary && (
                    <div className="transcribe">
                        <div className="heading">
                            <h4>Transcription</h4>
                        </div>
                        <div className="options">
                            <div className="btn" onClick={onTranscribe}>
                                <Translate value="TRANSCRIBE" />
                            </div>
                            <span className="language"> : en</span>
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
                                        enabled={false}
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
