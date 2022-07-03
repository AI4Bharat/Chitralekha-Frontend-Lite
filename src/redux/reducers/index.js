import apiStatus from './apistatus/apistatus';
import getVideoDetails from './Video/GetVideoDetails';
import fetchTranscript from './Transcript/FetchTranscript';
import getSupportedLanguages from './Transcript/GetSupportedLanguages';
import generateTranscript from './Transcript/GenerateTranscript';
import saveTranscript from './Transcript/SaveTranscript';

const index = {
    apiStatus,
    getVideoDetails,
    fetchTranscript,
    getSupportedLanguages,
    generateTranscript,
    saveTranscript,
};

export default index;