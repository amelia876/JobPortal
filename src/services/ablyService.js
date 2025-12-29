// services/ablyService.js
import * as Ably from 'ably';

class AblyService {
  constructor() {
    this.ably = null;
    this.channel = null;
  }

  initialize(userId) {
    if (!userId) return;
    
    // Get API key from environment
    const apiKey = import.meta.env.VITE_ABLY_API_KEY;
    
    if (!apiKey) {
      console.error('❌ VITE_ABLY_API_KEY is not set in environment variables');
      console.log('Current env:', import.meta.env);
      return;
    }

    // Use the API key from environment
    this.ably = new Ably.Realtime({
      key: apiKey,
      clientId: userId,
      echoMessages: false // Don't echo our own messages
    });

    this.ably.connection.on('connected', () => {
      console.log('✅ Connected to Ably');
    });

    this.ably.connection.on('failed', (error) => {
      console.error('❌ Failed to connect to Ably:', error);
    });
  }

  joinConversation(conversationId, onMessage, onTyping) {
    if (!this.ably) return;
    
    // Leave previous channel if exists
    if (this.channel) {
      this.channel.unsubscribe();
    }
    
    // Join new conversation channel
    this.channel = this.ably.channels.get(`conversation:${conversationId}`);
    
    // Subscribe to messages
    this.channel.subscribe('message', (message) => {
      onMessage && onMessage(message.data);
    });
    
    // Subscribe to typing indicators
    this.channel.subscribe('typing', (data) => {
      onTyping && onTyping(data.data);
    });
    
    // Subscribe to file uploads
    this.channel.subscribe('file', (data) => {
      onMessage && onMessage(data.data);
    });
  }

  sendMessage(conversationId, message) {
    if (!this.channel) return;
    
    this.channel.publish('message', message);
  }

  sendTypingIndicator(conversationId, userId, isTyping) {
    if (!this.channel) return;
    
    this.channel.publish('typing', {
      userId,
      isTyping,
      timestamp: Date.now()
    });
  }

  sendFile(conversationId, fileData) {
    if (!this.channel) return;
    
    this.channel.publish('file', fileData);
  }

  disconnect() {
    if (this.channel) {
      this.channel.unsubscribe();
    }
    if (this.ably) {
      this.ably.close();
    }
  }
}

export default new AblyService();