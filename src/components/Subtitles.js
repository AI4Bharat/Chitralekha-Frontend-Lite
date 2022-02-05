import styled from 'styled-components';
import languages from '../libs/languages';
import React, { useState, useCallback, useEffect } from 'react';
import { Table } from 'react-virtualized';
import unescape from 'lodash/unescape';
import debounce from 'lodash/debounce';
import { ReactTransliterate } from 'react-transliterate';
import { t, Translate } from 'react-i18nify';
import englishKeywordsTranslate from '../libs/englishKeywordsTranslate';
import googleTranslate from '../libs/googleTranslate';

const Style = styled.div`
    position: relative;
    box-shadow: 0px 5px 25px 5px rgb(0 0 0 / 80%);
    background-color: rgb(0 0 0 / 100%);

    .translate {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
        // padding: 10px;
        border-bottom: 1px solid rgb(255 255 255 / 20%);
        height: 80px;

        .heading {
            h4 {
                margin: 0;
            }
        }

        .options {
            display: flex;
        }

        select {
            width: 65%;
            outline: none;
            // padding: 8px 5px;
            height: 35px;
            border-radius: 3px;
        }

        .btn {
            opacity: 0.85;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 35px;
            width: 33%;
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
            height: 350px !important;
        }

        .ReactVirtualized__Grid__innerScrollContainer {
            overflow: visible !important;
        }

        .ReactVirtualized__Table__row {
            overflow: visible !important;
            height: 100% !important;

            .item {
                height: 100%;
                padding: 5px;

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
}) {
    const [height, setHeight] = useState(100);
    const [translate, setTranslate] = useState('en');

    const resize = useCallback(() => {
        setHeight(document.body.clientHeight - 170);
    }, [setHeight]);

    useEffect(() => {
        // const lang = languages['en'].filter((item) => item.key === language);

        // console.log(lang);

        resize();
        if (!resize.init) {
            resize.init = true;
            const debounceResize = debounce(resize, 500);
            window.addEventListener('resize', debounceResize);
        }
    }, [resize]);

    const onTranslate = useCallback(() => {
        setLoading(t('TRANSLATING'));

        if (translate === 'en-k') {
            return englishKeywordsTranslate(formatSub(subtitleEnglish), translate)
                .then((res) => {
                    setLoading('');
                    setSubtitle(formatSub(res));
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

        return googleTranslate(formatSub(subtitle), translate)
            .then((res) => {
                setLoading('');
                setSubtitle(formatSub(res));
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
    }, [subtitle, setLoading, formatSub, setSubtitle, translate, notify, subtitleEnglish]);

    return (
        subtitle && (
            <Style className="subtitles">
                {isPrimary && (
                    <div className="translate">
                        <div className="heading">
                            <h4> Primary Subtitles</h4>
                        </div>
                        <div className="options">
                            <select
                                value={translate}
                                onChange={(event) => {
                                    setTranslate(event.target.value);
                                    localStorage.setItem('lang', event.target.value);
                                }}
                            >
                                {(languages[language] || languages.en).map((item) => (
                                    <option key={item.key} value={item.key}>
                                        {item.name}
                                    </option>
                                ))}
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
                    headerHeight={20}
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
                                        lang={
                                            localStorage.getItem('lang') === 'en-k'
                                                ? 'en'
                                                : localStorage.getItem('lang')
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
