import React, {useState, useEffect} from 'react'

const App = (props) => {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])

  useEffect(() => {
    props.wsClient.onopen = () => {
      console.log('Client Connected')
    }

    props.wsClient.onmessage = (event) => {
      console.log(event)
      setMessages([...messages, event.data])
    }
    /*    return () => {
      console.log('czyszczenie xd')
      props.wsClient.close()
    } */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleMessageChange = (event) => {
    setMessage(event.target.value)
  }
  const handleSumbit = (event) => {
    event.preventDefault()
    props.wsClient.send(message)
    setMessage('')
  }
  return (
    <div>
      <form onSubmit={handleSumbit}>
        <input type="text" value={message} onChange={handleMessageChange} />
        <button type="submit">Wyślij</button>
      </form>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
