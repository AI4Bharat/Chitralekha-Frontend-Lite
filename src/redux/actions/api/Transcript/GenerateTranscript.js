/**
 * Generate Transcript API
 */
 import API from "../../../api";
 import ENDPOINTS from "../../../../config/apiendpoint";
 import constants from "../../../constants";
 
 export default class GenerateTranscriptAPI extends API {
   constructor(videoId, language, timeout = 2000) {
     super("GET", timeout, false);
     this.type = constants.GENERATE_TRANSCRIPT;
     this.endpoint = `${super.apiEndPointAuto()}${ENDPOINTS.transcript}generate/?video_id=${videoId}&language=${language}`;
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
     return this.transcript
   }
 }
 