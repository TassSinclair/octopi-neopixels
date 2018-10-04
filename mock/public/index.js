const socket = new WebSocket('ws://localhost:3001');
const neopixels = document.querySelector('#neopixels');
const jobActiveCheckbox = document.querySelector('#jobActiveCheckbox');
const jobProgressSlider = document.querySelector('#jobProgressSlider');

(function initNeopixels() {
    let i = 0;
    const createNeopixel = () => {
        const node = document.createElement('span');
        node.className = 'neopixel';
        node.innerHTML = '&#x25CF;'
        return node;
    }
    while (i < 8) {
        neopixels.appendChild(createNeopixel());
        ++i;
    }
})();

const updateNeopixels = (data) =>
    [].slice.call(document.querySelectorAll('.neopixel'))
        .forEach((node, index) => node.style.color = data[index]);

socket.addEventListener('message', function ({ data }) {
    const decoded = JSON.parse(data);
    switch (decoded.event) {
        case 'update': {
            updateNeopixels(decoded.data);
            break;
        }
    }
});

jobProgressSlider.addEventListener('change', (e) => {
    const jobProgress = e.target.value;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/job', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        'progress': {
            'completion': jobProgress
        }
    }));
})

jobActiveCheckbox.addEventListener('change', (e) => {
    const active = e.target.checked;
    var xhr = new XMLHttpRequest();
    if (active) {
        xhr.open('POST', '/api/job', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            'progress': {
                'completion': 0
            }
        }));
    } else {
        xhr.open('POST', '/api/job', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({}));
    }
});