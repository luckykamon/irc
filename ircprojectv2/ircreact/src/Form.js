import React from "react";
import './App.css';


class Form extends React.Component {
    render() {
        return (
            <div>
                <br/>
                <button className="btn btn-primary" id="buttonSendMessage">Send Message
                </button>
                <span id="spanSendMessage"><input list="commandes"  autoComplete="on" placeholder="Envoyer un message" id="inputSendMessage" type="text"/></span>
                <datalist id="commandes">
                    <option value="/help "/>
                    <option value="/nick "/>
                    <option value="/list "/>
                    <option value="/create "/>
                    <option value="/delete "/>
                    <option value="/join "/>
                    <option value="/quit "/>
                    <option value="/users "/>
                    <option value="/msg "/>
                </datalist>
            </div>
        );
    }
}
export default Form;
