let chatSocket = null;
// let gameSocket = null;

function initializeSockets() {
	console.log('TEST INIT SOCKS IN WSM');
    chatSocket = new WebSocket('wss://localhost:4430/wss/chat/');
    // gameSocket = new WebSocket('wss://localhost:4430/wss/game/');

    // Chat socket setup
    chatSocket.onopen = () => {
        console.log('Chat WebSocket Connected');
    };

    chatSocket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        console.log('Chat message received:', data);
    };

	// // Game socket setup
	// GameSocket.onopen = () => {
	// 	console.log('Game WebSocket Connected');
	// };

	// GameSocket.onmessage = (e) => {
	// 	const data = JSON.parse(e.data);
	// 	console.log('Game message received:', data);
	// };
    // Game socket setup (similar to Game)
}
