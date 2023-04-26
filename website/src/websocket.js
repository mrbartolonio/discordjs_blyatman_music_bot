export default function createWebSocketClient() {
  const socket = new WebSocket('ws://localhost:3000')
  console.log(socket)
  socket.addEventListener('open', (event) => {
    console.log('WebSocket connected')
  })
  socket.addEventListener('message', (event) => {
    console.log('Websocket message received:', event.data)
  })
  return socket
}
