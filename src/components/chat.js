import React from 'react';
import socketIOClient from "socket.io-client"
import {connect} from "react-redux";
import moment from "moment";
class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: undefined,
            message: "",
            typing:false,
            timeout:0
        };
        this.socket = socketIOClient("localhost:5000");
        // this.socket = socketIOClient("ws://192.168.43.27:4000");
    }

    componentDidMount(){
        window.scroll(0,0);
        this.socket.emit("login", new Date());

        this.socket.on("user", (data)=>{

            this.socket.on(data, (data,fn)=>{

                switch (data.type) {
                    case "read":
                        this.props.message(data);
                        break;
                    case "chat":
                        if (data.from !== this.state.active){
                            this.props.alert(data.from);
                            new Audio("/beep.mp3").play();
                        }
                        this.props.in_message(data);
                        this.props.message(data);
                        this.setState({typing:false});

                        break;
                    case "typing":
                        if (data.from === this.state.active){
                            this.setState({typing:true});
                            setTimeout(
                                ()=>{
                                    this.setState({typing:false});
                                }
                                , 5000);

                        }
                        break;
                    default:
                        this.props.message(data);
                }



            });

            this.props.auth(data);
            // this.setState({user: data});
        });



        this.socket.on("onlineUsers",(data)=>{
            // console.log(data);
            this.props.users(data);
            // this.setState({users: data})
        });

        this.socket.on("offline",(data)=>{
            this.props.offline(data);
        });


        this.socket.on("reconnecting", (data)=>{
            console.log("Reconnecting")
        });

        this.socket.on("connect", (data)=>{
            console.log("Connect")
        })
    }

    onChange=(e)=>{
        this.setState({[e.target.name]:e.target.value});
        if (this.state.timeout === 0){
            this.setState({timeout: 1});
            this.socket.emit("typing",{type: 'typing',from: this.props.gState.usersReducer.auth, to: this.state.active });
            setTimeout(()=>{
                this.setState({timeout: 0});
            },5000);


        }
    };

    formHandler=(e)=>{
        e.preventDefault();
        this.setState({message:""});
        const data = { type:"chat", to: this.state.active, message: this.state.message, from: this.props.gState.usersReducer.auth, delivered: 0, time: new Date()};
        this.props.out_message(data);
        this.socket.emit("message",data,(info)=>{
            this.props.queue({...data, delivered:1});
        })
    };

    componentWillUnmount() {
        this.socket.emit("left",this.state.user)
    }

    active=(e)=>{
        this.setState({active: e.target.id});
        this.props.removeAlert(e.target.id);

        setTimeout(()=>{
            this.read()
        },1000);
    };

    read=()=>{
        this.socket.emit("read", {type: "read", from: this.props.gState.usersReducer.auth, to: this.state.active});
    };

    login=(e)=>{
        e.preventDefault();
        this.socket.emit("login", {username:this.state.username, password: this.state.password});
    };


    render() {
        const {state, props} = this;
        const {gState} = props;
        const {users, auth} = gState.usersReducer;

        if(!auth){
            return (
                <div>
                    <div className="container" style={{maxWidth:500}}>
                        <div id="test1" className="dashboard-box">

                            <div className="headline">
                                <h3><i className="icon-material-outline-lock"/> Login</h3>
                            </div>

                            <form onSubmit={this.login}>
                                <div className="content with-padding">
                                    <div className="submit-field">
                                        <h5>Username</h5>
                                        <input type="text" onChange={this.onChange} name="username" className="with-border"/>
                                    </div>
                                    <div className="submit-field">
                                        <h5>Password</h5>
                                        <input type="password" onChange={this.onChange} name="password" className="with-border"/>
                                    </div>
                                    <div align="right">
                                        <button className="button">Login</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            );
        }else {
            return(
                <div>
                    <div className="dashboard-container">
                        <div className="dashboard-content-container" data-simplebar>
                            <div className="dashboard-content-inner">
                                <div className="messages-container margin-top-0">

                                    <div className="messages-container-inner">

                                        <div className="messages-inbox">
                                            <ul className="messages-headline">
                                                <li>
                                                    <a>
                                                        <div className="">
                                                            <div className="message-by-headline">
                                                                <h5>{users[auth]?users[auth].username:""}</h5>
                                                            </div>
                                                        </div>
                                                    </a>
                                                    <div className="clearfix"/>
                                                </li>
                                            </ul>
                                            <ul>
                                                {Object.keys(users).map((data)=>(
                                                    data !== auth?
                                                        <li id={data} className={state.active === data?"active-message":""}>
                                                            <a onClick={this.active} id={data}>
                                                                <div id={data} className="message-avatar"><i id={data} className={users[data].online?"status-icon status-online":"status-icon status-offline"}/><img id={data} src="images/user-avatar-small-03.jpg" alt=""/></div>

                                                                <div id={data} className="message-by">
                                                                    <div id={data} className="message-by-headline">
                                                                        <h5 id={data}>{users[data].username}</h5>
                                                                        {/*<span><i className="icon-line-awesome-envelope"/></span>*/}
                                                                    </div>
                                                                    {gState.messages.alert[data] || gState.messages.alert[data] > 0?
                                                                        <p id={data}> <i className="icon-line-awesome-envelope"/> {gState.messages.alert[data]}</p>
                                                                        :""}
                                                                </div>
                                                            </a>
                                                            <hr/>

                                                        </li>:""
                                                ))}

                                            </ul>
                                        </div>

                                        {state.active?
                                            <div className="message-content mbg">

                                                <div className="messages-headline">
                                                    <h4 className="message-avatar"><img src="images/user-avatar-small-01.jpg" alt=""/> {users[state.active].username}</h4>
                                                    <a href="#" className="message-action"><i className="icon-feather-phone-outgoing"/></a>
                                                    {/*<a href="#" className="message-action"><i className="icon-feather-trash-2"/> Delete Conversation</a>*/}
                                                </div>

                                                <div className="message-content-inner" style={{height: "72vh"}}>

                                                    {/*<div className="message-time-sign">
                                                    <span>28 June, 2018</span>
                                                </div>*/}

                                                    {users[state.active].messages.concat(users[state.active].queue, users[state.active].pending).map(data=>(
                                                        <div className={data.from === auth?"message-bubble me":"message-bubble"}>
                                                            <div className="message-bubble-inner">
                                                                {/*<div className="message-avatar">
                                                            <img src="images/user-avatar-small-01.jpg" alt=""/>
                                                        </div>*/}
                                                                {
                                                                    data.from === auth?
                                                                        <div style={{whiteSpace:"pre-line"}} className="message-text in">
                                                                            <p>{data.message}
                                                                                <h6 align="right">
                                                                                    {moment(data.time).format('h:mm a')} &nbsp;
                                                                                    <i style={{color:data.delivered === 2?"#4fc3f7":"#92a58c"}}
                                                                                       className={data.delivered === 0?"la la-clock-o":"la la-check"}/>
                                                                                </h6>

                                                                            </p></div>:
                                                                        <div style={{whiteSpace:"pre-line"}} className="message-text">
                                                                            <p>{data.message}</p>
                                                                            <h6 align="right">{moment(data.time).format('h:mm a')}</h6>
                                                                        </div>

                                                                }
                                                            </div>
                                                            <div className="clearfix"/>
                                                        </div>
                                                    ))}

                                                    {state.typing?
                                                    <div className="message-bubble">
                                                        <div className="message-bubble-inner">
                                                            <div className="message-text">
                                                                <div className="typing-indicator">
                                                                    <span></span>
                                                                    <span></span>
                                                                    <span></span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="clearfix"></div>
                                                    </div>:""}
                                                </div>

                                                <div className="message-reply">
                                                    <button onClick={this.formHandler}><i style={{fontSize:30}} className="la la-smile-o"/></button>
                                                    <textarea placeholder="Type a message" onFocus={this.read} className="block" name="message" value={state.message}  onChange={this.onChange}/>
                                                    {state.message.length > 0?
                                                        <button onClick={this.formHandler}><i style={{fontSize:30}} className="la la-send"/></button>:
                                                        <button onClick={this.formHandler}><i style={{fontSize:30}} className="la la-microphone"/></button>

                                                    }
                                                </div>

                                            </div>
                                            :
                                            <div className="message-content">

                                                <div className="messages-headline">
                                                    {/*<h4>Hello {users[auth]?users[auth].username:""}</h4>*/}
                                                </div>

                                            </div>
                                        }

                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )
        }

    }
}


const mapDispatchToProps =(dispatch)=>{
    return  {
        auth: (data)=>{
            dispatch({
                type: "auth",
                payload: data
            })
        },

        users: (data)=>{
            dispatch({
                type: "users",
                payload: data
            })
        },

        in_message: (data)=>{
            dispatch({
                type: "in_message",
                payload: data
            })
        },

        queue: (data)=>{
            dispatch({
                type: "queue",
                payload: data
            })
        },

        message: (data)=>{
            dispatch({
                type: "message",
                payload: data
            })
        },

        out_message: (data)=>{
            dispatch({
                type: "out_message",
                payload: data
            })
        },

        offline: (data)=>{
            dispatch({
                type: "offline",
                payload: data
            })
        },

        alert: (data)=>{
            dispatch({
                type: "alert",
                payload: data
            })
        },

        removeAlert: (data)=>{
            dispatch({
                type: "alert_remove",
                payload: data
            })
        }
    }
};

export default connect(null, mapDispatchToProps)(Chat);
