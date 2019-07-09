import React from 'react';
import socketIOClient from "socket.io-client";
import ss from "socket.io-stream";
class Message2 extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        };
        this.socket = socketIOClient("ws://localhost:5000");
        this.recording = false;
        this.speakerContext= new AudioContext();
    }

    componentDidMount(){
        window.scroll(0,0);
        this.nextTime = 0;
        ss(this.socket).on('audio-stream', (stream, data)=> {
            let parts = [];
            console.log("DATA -->> ");
            stream.on('data', (chunk) => {
                // console.log(chunk);
                parts.push(chunk);

            });
            stream.on('end', function () {
                var audio = document.getElementById('audio');
                audio.src = (window.URL || window.webkitURL).createObjectURL(new Blob(parts));
                audio.play();
            });

            // this.playCache(parts);

        });


        window.addEventListener('beforeunload',(event)=>{
            this.socket.close();
        })

    }

    componentWillUnmount() {
    }


    playCache = (cache)=> {
        var audio = document.getElementById('audio');
        audio.src = (window.URL || window.webkitURL).createObjectURL(new Blob(cache));
        audio.play();
        /*while (cache.length) {
            const buffer = cache.shift();
            const source    = this.speakerContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.speakerContext.destination);
            if (this.nextTime === 0) {
                this.nextTime = this.speakerContext.currentTime + 0.05;
            }
            source.start(this.nextTime);
            this.nextTime+=source.buffer.duration;
        }*/
    };


    recorderProcess =  (e)=> {
        const left = e.inputBuffer.getChannelData(0);
        if (this.recording === true) {
            // const chunk = convertFloat32ToInt16(left);
            // const chunk = left;
            // console.dir(chunk);
            this.stream(left);
        }

    };

    startRecording = ()=> {

        navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then( (stream)=> {
            const context = new AudioContext();
            const audioInput = context.createMediaStreamSource(stream);
            const bufferSize = 2048;
            // create a javascript node
            this.recorder = context.createScriptProcessor(bufferSize, 1, 1);
            // specify the processing function
            this.recorder.onaudioprocess = this.recorderProcess;
            // connect stream to our recorder
            audioInput.connect(this.recorder);
            // connect our recorder to the previous destination
            this.recorder.connect(context.destination);
        }).then(()=>{
            this.socket.emit('stream', { my: 'data' });

            this.stream = ss(this.socket).emit('inaudio', ss.createStream(), { name: "te" });

        });

        if (this.recording === false) {
            console.log('>>> Start Recording');

            //open binary stream
            this.recording = true;
        }

    };

    stopRecording = ()=> {

        if (this.recording === true) {
            console.log('||| Stop Recording');

            this.recording = false;

            //close binary stream
            this.stream.end();
        }
    };




    render() {
        return (
            <div>
                <audio id="audio" controls>
                    <source src="" type="audio/mpeg"/>
                    Your browser does not support the audio element.

                </audio>
                <button className="button" onClick={this.startRecording}>Start</button>
                <button className="button" onClick={this.stopRecording}>stop</button>
            </div>
        );
    }
}

export default Message2;
