/**
 * Fetch Transcript API
 */
 import API from "../../../api";
 import ENDPOINTS from "../../../../config/apiendpoint";
 import constants from "../../../constants";
 
 export default class FetchTranscriptAPI extends API {
   constructor(videoId, language, transcriptType, latest, timeout = 2000) {
     super("GET", timeout, false);
     this.type = constants.FETCH_TRANSCRIPT;
     this.endpoint = `${super.apiEndPointAuto()}${ENDPOINTS.transcript}?video_id=${videoId}&language=${language}&transcript_type=${transcriptType}${latest ? "&load_latest_transcript=true" : ""}`;
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
         ...(localStorage.getItem('chitralekha_access_token')) && {"Authorization":`${localStorage.getItem('chitralekha_access_token')}`}
       },
     };
     return this.headers;
   }
 
   getPayload() {
     return this.transcript
   }
 }
 