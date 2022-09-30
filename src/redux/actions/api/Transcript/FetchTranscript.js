/**
 * Fetch Transcript API
 */
 import API from "../../../api";
 import ENDPOINTS from "../../../../config/apiendpoint";
 import constants from "../../../constants";
 
 export default class FetchTranscriptAPI extends API {
   constructor(videoId, language, transcriptType, latest = false, timeout = 2000) {
     super("GET", timeout, false);
     this.type = constants.FETCH_TRANSCRIPT;
     this.endpoint = `${super.apiEndPointAuto()}${ENDPOINTS.transcript}?video_id=${videoId}&language=${language}&transcript_type=${transcriptType}load_latest_transcript=${latest}`;
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
 