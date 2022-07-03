/**
 * Get Translation Languages API
 */
 import API from "../../../api";
 import ENDPOINTS from "../../../../config/apiendpoint";
 import constants from "../../../constants";
 
 export default class GetTranslationLanguagesAPI extends API {
   constructor(timeout = 2000) {
     super("GET", timeout, false);
     this.type = constants.GET_TRANSLATION_LANGAUGES;
     this.endpoint = `${super.apiEndPointAuto()}${ENDPOINTS.translation}generate/supported_languages/`;
   }
 
   processResponse(res) {
     super.processResponse(res);
     if (res) {
         this.languages = res;
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
     return this.languages
   }
 }
 