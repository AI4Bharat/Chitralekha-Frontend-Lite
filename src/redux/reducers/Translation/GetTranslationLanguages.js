import constants from "../../constants";

let initialState = {
    data:{}
}
const reducer = (state=initialState,action)=>{
    switch(action.type){
        case constants.GET_TRANSLATION_LANGAUGES:
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
