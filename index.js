const PubNub = require('pubnub');
const net = require('net');

const sockets = new Set;
const channels = {
    channels: ['pubnub-sensor-network']
};

const pubnub = new PubNub({
    subscribeKey : 'sub-c-5f1b7c8e-fbee-11e3-aa40-02ee2ddab7fe'
});

pubnub.addListener({
    status: statusEvent => {
        if (statusEvent.category === "PNConnectedCategory")
            console.log('connected to pubnub');
    },
    message: msg => {
        const w = `${JSON.stringify(msg.message)}\n`;
        sockets.forEach(s => s.write(w));
        console.log(w);
    },
    presence: presenceEvent => {
        // handle presence
    }
});

const server = net.createServer(s => {
    console.log('client connected');

    if (!sockets.size) pubnub.subscribe(channels);

    sockets.add(s);

    s.on('end', () => {
        sockets.delete(s);

        if (!sockets.size) pubnub.unsubscribe(channels);

        console.log('client disconnected');
    });
    s.on('error', err => {
        sockets.delete(s);

        if (!sockets.size) pubnub.unsubscribe(channels);

        console.log(err);
    });
});

server.listen(process.argv[2] || 1337, () => console.log(`listening ${process.argv[2] || 1337}`));
