/**
 * Fetch Translation API
 */
 import API from "../../../api";
 import ENDPOINTS from "../../../../config/apiendpoint";
 import constants from "../../../constants";
 
 export default class FetchTranslationAPI extends API {
   constructor(transcriptId, language, latest, timeout = 2000) {
     super("GET", timeout, false);
     this.type = constants.FETCH_TRANSLATION;
     this.endpoint = `${super.apiEndPointAuto()}${ENDPOINTS.translation}?transcript_id=${transcriptId}&target_lang=${language}${latest ? "&get_latest=true" : ""}`;
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
         ...(localStorage.getItem('chitralekha_access_token')) && {"Authorization":`Token ${localStorage.getItem('chitralekha_access_token')}`}
       },
     };
     return this.headers;
   }
 
   getPayload() {
     return this.translation
   }
 }
 