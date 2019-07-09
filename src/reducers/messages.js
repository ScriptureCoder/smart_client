export const messages= (state={alert: {}}, action)=>{
    switch (action.type) {
        case "alert":
            state ={
                ...state,
                alert: {
                    ...state.alert,
                    [action.payload]: state.alert[action.payload]?state.alert[action.payload] + 1:1

                }
            };
            break;
        case "alert_remove":
            state ={
                ...state,
                alert: {
                    ...state.alert,
                    [action.payload]: 0

                }
            };
            break;

        default:
            state = {
                ...state
            };
    }
    return state;
};
