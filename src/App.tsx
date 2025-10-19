import { type ChangeEvent, type JSX, useState } from "react";
import "./styles/framework.css";
import { Sanctus } from "./sanctus/Sanctus";
import { Log } from "./components/Log";

function App() {
    const combatLogReader = new Sanctus();
    const [ logContent, setLogContent ] = useState<JSX.Element|null>(null);

    const combatLogFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target) return;

        // Get the combat files
        if (event.target.files) {
            const files: FileList = event.target.files;
            const combatLog: File = files[0];

            await combatLogReader.processLog(combatLog);
            setLogContent((<Log combatLogReader={ combatLogReader } />));
            console.log(combatLogReader);
        }
    }

    return (
        <>
            <div className="contentContainer" data-theme="dark">
                <div className="content">
                    <h1 className="fontTrebuchet">Noslrac Logs</h1>
                    <h2 className="fontTrebuchet">Select a file</h2>
                    <input type="file" onChange={combatLogFileUpload} />
                    <div>{ logContent }</div>
                </div>
            </div>

            <div className="basicFooter" data-size="large" data-theme="dark">
                <div className="banner">
                    <h1>Noslrac Logs</h1>
                </div>
            </div>
        </>
    );
}

export default App;