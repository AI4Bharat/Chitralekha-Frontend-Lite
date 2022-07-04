import 'core-js';
import 'normalize.css';
import './libs/contextmenu.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { isMobile } from './utils';
import { setLocale, setTranslations } from 'react-i18nify';
import i18n from './i18n';
import App from './App';
import Mobile from './Mobile';
import GlobalStyle from './GlobalStyle';
import {Provider} from 'react-redux';
import store from './redux/store/store';

setTranslations(i18n);
const language = navigator.language.toLowerCase();
const defaultLang = i18n[language] ? language : 'en';
setLocale(defaultLang);

// Add comment for triggering push - 2
ReactDOM.render(
    <React.Fragment>
        <Provider store={store}>
            <GlobalStyle />
            {isMobile ? <Mobile /> : <App defaultLang={defaultLang} />}
        </Provider>
    </React.Fragment>,
    document.getElementById('root'),
);
