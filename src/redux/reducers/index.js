import apiStatus from './apistatus/apistatus';
import getVideoDetails from './Video/GetVideoDetails';
import fetchTranscript from './Transcript/FetchTranscript';
import getTranscriptLanguages from './Transcript/GetTranscriptLanguages';
import generateTranscript from './Transcript/GenerateTranscript';
import saveTranscript from './Transcript/SaveTranscript';
import generateTranslation from './Translation/GenerateTranslation';
import getTranslationLanguages from './Translation/GetTranslationLanguages';
import saveTranslation from './Translation/SaveTranslation';
import fetchTranslation from './Translation/FetchTranslation';

const index = {
    apiStatus,
    getVideoDetails,
    fetchTranscript,
    getTranscriptLanguages,
    generateTranscript,
    saveTranscript,
    generateTranslation,
    getTranslationLanguages,
    saveTranslation,
    fetchTranslation,
};

export default index;