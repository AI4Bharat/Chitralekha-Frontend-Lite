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
import { ai4BharatBatchTranslate } from '../libs/ai4BharatTranslate';
// import { ai4BharatASRTranslate } from '../libs/ai4BharatTranslate';
// import { sub2vtt, url2sub, vtt2url } from '../libs/readSub';
import GetTranslationLanguagesAPI from "../redux/actions/api/Translation/GetTranslationLanguages"
import APITransport from "../redux/actions/apitransport/apitransport"
import { useDispatch, useSelector } from 'react-redux';

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

function useStickyState(defaultValue, key) {
    const [value, setValue] = React.useState(() => {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null
        ? JSON.parse(stickyValue)
        : defaultValue;
    });
    React.useEffect(() => {
      window.localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);
    return [value, setValue];
  }


  

// const CalendarView = () => {
//     const [mode, setMode] = useStickyState('day', 'calendar-view');

//     return (
//       <>
//         <select 
//         onChange={(ev) => {
//             setMode(ev.target.value);
//             console.log(ev.target.value);
            
//         }}
//         value={mode}
//         >
//           <option value="day">Day</option>
//           <option value="week">Week</option>
//           <option value="month">Month</option>
//         </select>
//         {/* Calendar stuff here */}
//       </>
//     )
//   }




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
    isTranslateClicked=false,
    setIsTranslateClicked,
}) {
    const dispatch = useDispatch();
    const [height, setHeight] = useState(100);
    const [translate, setTranslate] = useState(null);

    const [languageAvailable, setLanguageAvailable] = useState([]);
    const languageChoices = useSelector(state => state.getTranslationLanguages.data);

    const fetchTranslationLanguages = () => {
        const langObj = new GetTranslationLanguagesAPI();
        dispatch(APITransport(langObj));
    }

    //console.log('isTranslateClicked '+isTranslateClicked);
    useEffect(() => {
        if (localStorage.getItem('langTranslate')) {
            setTranslate(localStorage.getItem('langTranslate')); //changes in both
        } else {
            localStorage.setItem('langTranslate', 'en') //added 
            //setTranslate('en');
            setTranslate(localStorage.getItem('langTranslate'));
        }
        fetchTranslationLanguages();
    }, []);

    useEffect(() => {
        if (translationApi === "AI4Bharat") {
            if (languageChoices && Object.keys(languageChoices).length > 0) {
                let langArray = [];
                for (const key in languageChoices) {
                    langArray.push({ name: `${key}`, key: `${languageChoices[key]}` });
                }
                setLanguageAvailable(langArray);
                localStorage.setItem('langTranslate', langArray[0].key);
                setTranslate(langArray[0].key);
            }
        } else {
            setLanguageAvailable(languages);
            localStorage.setItem('langTranslate', languages['en'][1].key); //changes
            setTranslate(languages['en'][1].key);
        }
    }, [languageChoices, translationApi]);

    // useEffect(() => {
    //     if (translationApi === 'AI4Bharat') {
    //         fetch(`${process.env.REACT_APP_NMT_URL}/supported_languages`)
    //             .then((resp) => {
    //                 return resp.json();
    //             })
    //             .then((resp) => {
    //                 let langArray = [];
    //                 // langArray.push({ name: 'English', key: 'en' });
    //                 for (const key in resp) {
    //                     langArray.push({ name: `${key}`, key: `${resp[key]}` });
    //                 }
    //                 setLanguageAvailable(langArray);
    //                 //localStorage.setItem('langTranslate', langArray[0].key); //changes necessary?
    //                 // for(const item in langArray) {
    //                 //     console.log('langArray key '+ langArray[item].key);
    //                 // }
    //                 // console.log('translate lang array[0] '+langArray[0].key);
    //                // setTranslate(langArray[0].key); //test changing to localStorage.getItem('lang')
    //                // setTranslate(localStorage.getItem('langTranslate')); changes commented out
    //             })
    //             .catch((err) => {
    //                 console.log(err);
    //             });
    //     } else {
    //         setLanguageAvailable(languages);
    //         localStorage.setItem('langTranslate', languages['en'][1].key); //changes
    //         setTranslate(languages['en'][1].key);
    //     }
    // }, [translationApi]);
    const handleBlur = (data, index) => {
        //console.log(e.target.value);
        if (isPrimary) {
            return;
        }
        //console.log(translationApi);
        //here is what you want to comment out if you don't want translate to be triggered on editing subtitles
        if (translationApi === 'AI4Bharat') {
            // return; //changes to both below
         //   ai4BharatBatchTranslate([{ text: data.text }], 'hi', localStorage.getItem('langTranslate')).then((resp) => {
            ai4BharatBatchTranslate([{ text: data.text }], localStorage.getItem('langTranscribe'), localStorage.getItem('langTranslate')).then((resp) => {
                updateSubOriginal(data, resp[0], index);
            });
        } else {
            googleTranslate([{ text: data.text }], localStorage.getItem('langTranslate')).then((resp) => {
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

    const [modeTranslate, setModeTranslate] = useStickyState('en', 'translated-view'); //for sticky option in dropdown

    const onTranslate = useCallback(() => {
        setIsTranslateClicked(true);
        
        console.log('when translate button clicked '+isTranslateClicked);
        console.log('Translation API '+translationApi); // either AI4Bharat or Google Translate
        setLoading(t('TRANSLATING'));
        if (clearedSubs) {
            // if (translate === 'en-k') {
            //     return googleTranslate(formatSub(JSON.parse(window.localStorage.getItem('subsBeforeClear'))), 'en')
            //         .then((res) => {
            //             englishKeywordsTranslate(formatSub(res), translate)
            //                 .then((res) => {
            //                     setLoading('');
            //                     setSubtitle(formatSub(res));
            //                     localStorage.setItem('langTranslate', 'en');
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
                console.log("here1", "translate");
                return ai4BharatBatchTranslate(
                    formatSub(JSON.parse(window.localStorage.getItem('subsBeforeClear'))),
                    'en',
                    translate,
                )
                    .then((res) => {
                        console.log("here2", "translate");
                        setLoading('');
                        console.log(res, "translate")
                        setSubtitle(formatSub(res));
                        localStorage.setItem('langTranslate', translate);
                        console.log('langTranslate '+localStorage.getItem('langTranslate'));
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
                    console.log('Format Sub');
                    //console.log(formatSub(JSON.parse(window.localStorage.getItem('subsBeforeClear'))));
                    setSubtitle(formatSub(res));
                    localStorage.setItem('langTranslate', translate);
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
        //                     localStorage.setItem('langTranslate', 'en');
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
           // console.log("localstorage get item");
            console.log("langTranslate translation api"+localStorage.getItem('langTranslate'));
            // return ai4BharatBatchTranslate(formatSub(subtitleEnglish), 'hi', translate)
            //     .then((res) => {
            //         setLoading('');
            //         setSubtitle(formatSub(res));
            //         localStorage.setItem('langTranslate', translate);
            //         notify({
            //             message: t('TRANSLAT_SUCCESS'),
            //             level: 'success',
            //         });
            //     })
            //     .catch((err) => {
            //         setLoading('');
            //         notify({
            //             message: err.message,
            //             level: 'error',
            //         });
            //     });
            // return ai4BharatASRTranslate(sub2vtt(formatSub(subtitleEnglish)), 'hi', translate)
            //     .then((res) => {
            //         console.log(res);
            //         const suburl = vtt2url(res);
            //         url2sub(suburl).then((urlsub) => {
            //             setSubtitle(formatSub(urlsub));
            //             localStorage.setItem('langTranslate', translate);
            //             setLoading('');
            //             notify({
            //                 message: t('TRANSLAT_SUCCESS'),
            //                 level: 'success',
            //             });
            //         });
            //     })
            //     .catch((err) => {
            //         setLoading('');
            //         notify({
            //             message: err.message,
            //             level: 'error',
            //         });
            //     });
        }

        // console.log('google api');
        return googleTranslate(formatSub(subtitleEnglish), translate)
            .then((res) => {
                setLoading('');
                setSubtitle(formatSub(res));
                localStorage.setItem('langTranslate', translate);
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
                {console.log('when translate button clicked '+isTranslateClicked)}
                 {/* <CalendarView />  */}
                {isPrimary && translate && languageAvailable && (
                    <div className="translate">
                        {/* <div className="heading">
                            <h4>Translation</h4>
                        </div> */}
                        
                         {/* <TestSticky />  */}
                        
                        <div className="options">

                            <select
                            
                               // value="kn"
                                value={modeTranslate} //new - comment out if don't want sticky options
                                onChange={(event) => {
                                    setTranslate(event.target.value);
                                    setModeTranslate(event.target.value); //new
                                   // localStorage.setItem('lang', event.target.value); //maybe remove later
                                    localStorage.setItem('langTranslate', event.target.value); 
                                    // console.log('in select');
                                   //  console.log('in onChange translate lang ' +localStorage.getItem('lang'));
                                     console.log('in onChange translate langTranslate ' +localStorage.getItem('langTranslate'));
                                    // console.log(event.target.value);
                                }}
                            >
                                {(languageAvailable[language] || languageAvailable.en || languageAvailable).map(
                                    (item) =>
                                        //item.key !== 'en' && 
                                        ( 
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
                        {/* <span>Language : {languages['en'].filter((item) => item.key === language)[0].name}</span> */}
                    </div>
                )}
               
               {(!isPrimary || isTranslateClicked ) && (
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
                        // {
                        //     console.log(unescape(props.rowData.text))
                        // }
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
                                {console.log('langTranslate '+localStorage.getItem('langTranslate'))}
                               {/* {console.log('before react transliterate '+localStorage.getItem('lang'))} */}
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
                                            // console.log(event);
                                            // console.log("here in on change text");
                                            // console.log(props.rowData.text);
                                            updateSub(props.rowData, {
                                                text: event,
                                            });
                                           
                                        }}
                                        onBlur={() => handleBlur(props.rowData, props.index)}
                                        enabled={
                                            // isPrimary
                                            //     ? !localStorage.getItem('lang') ||
                                            //         localStorage.getItem('lang') === 'en' ||
                                            //         localStorage.getItem('lang') === 'en-k'
                                            //         ? false
                                            //         : true
                                            //     : true
                                            true
                                        }
                                        lang={
                                            // isPrimary
                                            //     ? localStorage.getItem('lang') === 'en-k'
                                            //         ? 'en'
                                            //         : localStorage.getItem('lang')
                                            //     : 'hi'
                                            isPrimary
                                            ? localStorage.getItem('langTranslate')
                                            : localStorage.getItem('langTranscribe')
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
                )}
            </Style>
        )
    );
}
