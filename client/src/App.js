import React from "react"; 
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"; 
import Join from "./components/Join/Join";
import Chat from "./components/Chat/Chat"; 
import "./main.css";
import { positions, Provider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";

const options = {
    timeout: 5000,
    position: positions.MIDDLE
};

const App = () => { 
    return ( 
        <Provider template={AlertTemplate} {...options}>
            <Router> 
                <Switch>
                    <Route path="/" exact component={Join} />
                    <Route path="/join" exact component={Join} />
                    <Route path="/chat" exact component={Chat} />
                    {/* Add a fallback route */}
                    <Route path="*">
                        <h1>404 Not Found</h1>
                    </Route>
                </Switch>
            </Router>
        </Provider>
    ); 
}

export default App; 

/* User enters data in "/", that data is passed to "/chat" using query-strings */
