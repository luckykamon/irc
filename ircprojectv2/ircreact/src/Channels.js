import React from "react";

class Channels extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <div className="ReactChannels" id="ReactChannels">
                <h5><strong>Liste des channels : </strong></h5>
                <div id="listChannel">

                </div>
            </div>
        );
    }
}

export default Channels;
