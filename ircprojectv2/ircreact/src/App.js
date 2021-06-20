import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";


function App() {
    const [response, setResponse] = useState("");

    useEffect(() => {
        const ENDPOINT = "localhost:4000";
        var connectionOptions =  {
            "force new connection" : true,
            "reconnectionAttempts": "Infinity", //avoid having user reconnect manually in order to prevent dead clients after a server restart
            "timeout" : 10000,                  //before connect_error and connect_timeout are emitted.
            "transports" : ["websocket"]
        };

        const socket = socketIOClient(ENDPOINT, connectionOptions);
        socket.on("FromAPI", data => {
            setResponse(data);
        });
    }, []);

    return (
        <p>
            It's <time dateTime={response}>{response}</time>
        </p>
    );
}

export default App;
