import React, {useState, useEffect} from 'react'

const Dashboard = () => {
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000')

    ws.onopen = () => {
      console.log('WebSocket connection open')
    }

    ws.onmessage = (event) => {
      console.log(`Received message: ${event.data}`)
    }

    setSocket(ws)

    return () => {
      ws.close()
    }
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()
    const message = event.target.messsage
    socket.send(message)
    console.log(`Sent message ${message}`)
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" name="message" />
        <button type submit>
          Wyślij
        </button>
      </form>
    </div>
  )
}
