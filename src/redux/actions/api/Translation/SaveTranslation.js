/**
 * Save Translation API
 */
 import API from '../../../api';
 import ENDPOINTS from '../../../../config/apiendpoint';
 import constants from '../../../constants';
 
 export default class SaveTranslationAPI extends API {
     constructor(translationId, language, transcript_id, captions, timeout = 2000) {
         super('POST', timeout, false);
         this.type = constants.SAVE_TRANSLATION;
         this.translationId = translationId;
         this.transcriptId = transcript_id;
         this.language = language;
         this.captions = captions;
         this.endpoint = `${super.apiEndPointAuto()}${ENDPOINTS.translation}save`;
     }
 
     processResponse(res) {
         super.processResponse(res);
         if (res) {
             this.translation = res;
         }
     }
 
     apiEndPoint() {
         return this.endpoint;
     }
 
     getBody() {
        console.log('this.lang '+this.language)
         return {
             translation_id: this.translationId,
             transcript_id: this.transcriptId,
             target_language: this.language,
             payload: this.captions,
         }
     }
 
     getHeaders() {
         this.headers = {
             headers: {
                 'Content-Type': 'application/json',
                 ...(localStorage.getItem('chitralekha_access_token')) && {"Authorization":`Token ${localStorage.getItem('chitralekha_access_token')}`}
             },
         };
         return this.headers;
     }
 
     getPayload() {
         return this.translation;
     }
 }
 