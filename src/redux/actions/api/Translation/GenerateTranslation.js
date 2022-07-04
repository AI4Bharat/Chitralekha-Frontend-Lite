/**
 * Generate Translation API
 */
 import API from "../../../api";
 import ENDPOINTS from "../../../../config/apiendpoint";
 import constants from "../../../constants";
 
 export default class GenerateTranslationAPI extends API {
   constructor(transcriptId, language, timeout = 2000) {
     super("GET", timeout, false);
     this.type = constants.GENERATE_TRANSLATION;
     this.endpoint = `${super.apiEndPointAuto()}${ENDPOINTS.translation}generate?transcript_id=${transcriptId}&target_lang=${language}`;
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
 
   getBody() {}
 
   getHeaders() {
     this.headers = {
       headers: {
         "Content-Type": "application/json",
         "Authorization":`Token ${localStorage.getItem('chitralekha_access_token')}`
       },
     };
     return this.headers;
   }
 
   getPayload() {
     return this.translation
   }
 }
 