import React from 'react';
import {BinaryClient} from 'binaryjs-client';




class Message extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        };
        // this.host = 'ws://localhost:4000/binary-endpoint';
        this.host = 'ws://192.168.43.27:4000/binary-endpoint';
        this.client = new BinaryClient(this.host);
        this.recording = false;
        this.speakerContext= new AudioContext();
    }

    componentDidMount(){
        window.scroll(0,0);

        this.client.on('stream', (stream)=> {
            this.nextTime = 0;
            let init = false;
            let audioCache = [];

            console.log('>>> Receiving Audio Stream');

            stream.on('data', (data)=> {
                const array = new Float32Array(data);
                const buffer = this.speakerContext.createBuffer(1, 2048, 44100);
                buffer.copyToChannel(array, 0);

                audioCache.push(buffer);
                // make sure we put at least 5 chunks in the buffer before starting
                if ((init === true) || ((init === false) && (audioCache.length > 1))) {
                    init = true;
                    this.playCache(audioCache);
                }
            });

            stream.on('end', function () {
                console.log('||| End of Audio Stream');
            });

        });

        window.addEventListener('beforeunload',(event)=>{
            this.client.close();
        })

    }

    componentWillUnmount() {
    }


    playCache = (cache)=> {
        while (cache.length) {
            const buffer = cache.shift();
            const source    = this.speakerContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.speakerContext.destination);
            if (this.nextTime === 0) {
                this.nextTime = this.speakerContext.currentTime + 0.05;
            }
            source.start(this.nextTime);
            this.nextTime+=source.buffer.duration;
        }
    };


    recorderProcess =  (e)=> {
        const left = e.inputBuffer.getChannelData(0);
        if (this.recording === true) {
            // const chunk = convertFloat32ToInt16(left);
            // const chunk = left;
            // console.dir(chunk);
            this.stream.write(left);
        }

    };

    startRecording = ()=> {

        alert("yes");
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
            this.stream = this.client.createStream({data: 'audio'});

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
                <button className="button" onClick={this.startRecording}>Start</button>
                <button className="button" onClick={this.stopRecording}>stop</button>
            </div>
        );
    }
}

export default Message;
