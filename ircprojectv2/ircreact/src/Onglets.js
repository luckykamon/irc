import React from "react";
import {ButtonToolbar} from 'react-bootstrap';
import './App.css';


class Onglets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {apiResponse: ""};
    }
    render() {
        return (
                <div className="ReactOnglet">
                    <ButtonToolbar id="ongletToolBar">
                    </ButtonToolbar>
                </div>
        );
    }
}
export default Onglets;
