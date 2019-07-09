export const usersReducer = (state = {users:{}, auth:null}, action) => {
    switch (action.type) {
        case "auth":
            state = {
                ...state,
                auth: action.payload
            };
            break;
        case "users":
            state = {
                ...state,
                users: action.payload
            };
            break;
        case "offline":
            state = {
                ...state,
                users: {
                    ...state.users,
                    [action.payload]:{
                        ...state.users[action.payload],
                        online: false
                    }
                }
            };
            break;
        case 'in_message':
            state = {
                ...state,
                users:{
                    ...state.users,
                    [action.payload.from] : {
                        ...state.users[action.payload.from],
                        queue: [
                            ...state.users[action.payload.from].queue,
                            action.payload
                        ]
                    }
                }
            };
            break;
        case 'message':
            state = {
                ...state,
                users:{
                    ...state.users,
                    [action.payload.from] : {
                        ...state.users[action.payload.from],
                        messages: [
                            ...state.users[action.payload.from].messages,
                            ...state.users[action.payload.from].queue.map(data=>({...data,delivered:2}))
                        ],
                        queue: []
                    }
                }
            };
            break;
        case 'queue':
            state = {
                ...state,
                users:{
                    ...state.users,
                    [action.payload.to] : {
                        ...state.users[action.payload.to],
                        queue: [
                            ...state.users[action.payload.to].queue,
                            action.payload
                        ],
                        pending: []
                    }
                }
            };
            break;
        case 'out_message':
            state = {
                ...state,
                users:{
                    ...state.users,
                    [action.payload.to] : {
                        ...state.users[action.payload.to],
                        pending: [
                            ...state.users[action.payload.to].pending,
                            action.payload
                        ]
                    }
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
