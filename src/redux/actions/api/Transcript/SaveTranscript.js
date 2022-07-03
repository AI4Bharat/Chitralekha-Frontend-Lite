/**
 * Save Transcript API
 */
import API from '../../../api';
import ENDPOINTS from '../../../../config/apiendpoint';
import constants from '../../../constants';

export default class SaveTranscriptAPI extends API {
    constructor(transcriptId, language, payload, timeout = 2000) {
        super('POST', timeout, false);
        this.type = constants.SAVE_TRANSCRIPT;
        this.transcriptId = transcriptId;
        this.language = language;
        this.payload = payload;
        this.endpoint = `${super.apiEndPointAuto()}${ENDPOINTS.transcript}save/`;
    }

    processResponse(res) {
        super.processResponse(res);
        if (res) {
            this.transcript = res;
        }
    }

    apiEndPoint() {
        return this.endpoint;
    }

    getBody() {
        return {
            transcript_id: this.transcriptId,
            language: this.language,
            payload: this.payload,
        }
    }

    getHeaders() {
        this.headers = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${localStorage.getItem('chitralekha_access_token')}`,
            },
        };
        return this.headers;
    }

    getPayload() {
        return this.transcript;
    }
}
