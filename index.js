const chatFrame = document.getElementById('chat-messages')
const input = document.getElementById('message-input')

const firebaseConfig = {
    apiKey: "AIzaSyAdvIxi1jKQ8QiUZKtCrE5zPKWm8wo9_LE",
    authDomain: "js2-gritsquare.firebaseapp.com",
    projectId: "js2-gritsquare",
    storageBucket: "js2-gritsquare.firebasestorage.app",
    messagingSenderId: "663899223722",
    appId: "1:663899223722:web:af35e2f99e4090fc4802d3"
}

let messagesCollection = null

function normalizeMessage(message) {
    if (!message) return { text: '', author: 'Anonymous', timestamp: new Date().toISOString() }

    let timestamp = message.timestamp || message.Timestamp || new Date().toISOString()
    if (timestamp && typeof timestamp.toDate === 'function') {
        timestamp = timestamp.toDate().toISOString()
    }

    return {
        text: message.text || message.Title || '',
        author: message.author || 'Anonymous',
        timestamp,
    }
}

function renderMessage(message) {
    const normalized = normalizeMessage(message)

    const wrapper = document.createElement('div')
    wrapper.className = 'message'

    const topFrame = document.createElement('div')
    topFrame.className = 'message-top'

    const username = document.createElement('h2')
    username.textContent = normalized.author

    const timestamp = document.createElement('span')
    timestamp.className = 'timestamp'
    timestamp.textContent = `• ${normalized.timestamp}`

    topFrame.appendChild(username)
    topFrame.appendChild(timestamp)

    const messageFrame = document.createElement('div')
    messageFrame.className = 'message-body'
    messageFrame.textContent = normalized.text

    wrapper.appendChild(topFrame)
    wrapper.appendChild(messageFrame)
    chatFrame.appendChild(wrapper)
    chatFrame.scrollTop = chatFrame.scrollHeight
}

function sendMessage(text) {
    const trimmed = text.trim()
    if (!trimmed) return

    const newMessage = {
        text: trimmed,
        author: 'Anonymous',
        timestamp: new Date().toISOString(),
    }

    if (messagesCollection) {
        messagesCollection.add(newMessage).catch((err) => {
            console.error(err)
            renderMessage(newMessage)
        })
    } else {
        renderMessage(newMessage)
    }
}

try {
    firebase.initializeApp(firebaseConfig)
    const db = firebase.firestore()
    messagesCollection = db.collection('messages')
} catch (error) {
    console.error(error)
}

messagesCollection
    .orderBy('timestamp', 'asc')
    .limit(100)
    .onSnapshot((snapshot) => {
        chatFrame.innerHTML = ''
        snapshot.forEach((doc) => {
            renderMessage(doc.data())
        })
    }, (error) => {
        console.error(error)
    })

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault()
        const value = input.value.trim()
        if (!value) return
        sendMessage(value)
        input.value = ''
    }
})