/**
 * Login API
 */
 import API from "../../../api";
 import ENDPOINTS from "../../../../config/apiendpoint";
 import constants from "../../../constants";
 
 export default class GetVideoDetailsAPI extends API {
   constructor(videoUrl, timeout = 2000) {
     super("GET", timeout, false);
     this.type = constants.GET_VIDEO_DETAILS
     this.videoUrl = videoUrl;
     this.endpoint = `${super.apiEndPointAuto()}${ENDPOINTS.video}?video_url=${videoUrl}&create_youtube_transcript=True`;
   }
 
   processResponse(res) {
     super.processResponse(res);
     if (res) {
         this.video = res;
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
     return this.video
   }
 }
 