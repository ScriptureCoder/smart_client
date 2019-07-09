import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers } from "redux";
import { Provider } from "react-redux";
import App from "./App";
import * as serviceWorker from './serviceWorker';
import {usersReducer} from "./reducers/users";
import {messages} from "./reducers/messages";

//store
export const store = createStore(combineReducers({usersReducer, messages}));
store.subscribe(()=>{
    console.log("update", store.getState());
});

ReactDOM.render(<Provider store={store}><App /></Provider>, document.getElementById('root'));
serviceWorker.unregister();
