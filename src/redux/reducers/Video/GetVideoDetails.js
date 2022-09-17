import constants from "../../constants";

let initialState = {
    data:{}
}
const reducer = (state=initialState,action)=>{
    switch(action.type){
        case constants.GET_VIDEO_DETAILS:
            localStorage.setItem("videoName", action.payload.video.name);
            return {
                ...state,
                data:action.payload
            } 

        default:
            return {
                ...state
            }
    }

};

export default reducer;
