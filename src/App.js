import React from 'react';
import "./assets/style.css";
import "./assets/colors/green.css";
import './assets/icon.css';

import Chat from "./components/chat";
import {connect} from "react-redux";
import Message from "./components/chat2";
import Message2 from "./components/chat3";

class App extends React.Component{
    render() {
        return (
            <Message2 gState={this.props.gState}/>
        );
    }

}

const mapStateToProps =(state)=>{
    return {
        gState: state
    }
};

export default connect(mapStateToProps)(App);
