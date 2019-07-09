import React from 'react';

class Wrapper extends React.Component {
    render() {
        const {state, props} = this;
        const {gState} = props;
        const {users, auth} = gState.usersReducer;

        return (
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
                                                        <a onClick={this.props.active} id={data}>
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

                                    {this.props.children}

                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Wrapper;
