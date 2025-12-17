import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;
  private connected = false;

  constructor() {
    console.log('🔌 Inicializando Socket.io...');
    console.log('📍 Conectando a: http://localhost:4000');
    
    this.socket = io('http://localhost:4000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],  // ✅ Agregar fallback a polling
      forceNew: true                         // ✅ Forzar nueva conexión
    });

    // Eventos de conexión
    this.socket.on('connect', () => {
      console.log('✅ Conectado a Socket.io:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Desconectado de Socket.io');
      this.connected = false;
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('❌ Error de conexión Socket.io:', error);
      console.error('📍 Detalles:', {
        message: error.message,
        type: error.type,
        data: error.data
      });
    });

    this.socket.on('error', (error: any) => {
      console.error('⚠️ Error en Socket.io:', error);
    });

    // ✅ Logs de debug de transporte
    console.log('🔄 Transporte Socket.io:', this.socket.io.engine.transport.name);
  }

  joinRoom(roomId: string, user: any) {
    if (!roomId || !user) {
      console.error('❌ roomId o user vacíos');
      return;
    }

    console.log('🚪 Intentando unirse a sala:', roomId);
    console.log('   Usuario:', user.name || user.email);
    console.log('   Socket conectado:', this.connected);
    console.log('   Socket ID:', this.socket.id);

    if (!this.connected) {
      console.warn('⚠️ No conectado a Socket.io - esperando conexión...');
      // Esperar un poco e intentar de todas formas
      setTimeout(() => {
        if (this.connected) {
          this.socket.emit('joinRoom', roomId, user);
          console.log('✅ Emitido joinRoom después de esperar');
        } else {
          console.error('❌ Socket sigue sin conectar después de 2s');
        }
      }, 2000);
      return;
    }
    
    this.socket.emit('joinRoom', roomId, user);
    console.log('✅ Emitido joinRoom instantáneamente');
  }

  leaveRoom(roomId: string, user: any) {
    if (!this.connected) return;
    console.log('👋 Saliendo de sala:', roomId);
    this.socket.emit('leaveRoom', roomId, user);
  }

  sendMessage(roomId: string, message: any) {
    if (!roomId || !message) {
      console.error('❌ roomId o message vacíos');
      return;
    }

    console.log('📤 Intentando enviar mensaje');
    console.log('   Sala:', roomId);
    console.log('   Texto:', message.text);
    console.log('   Socket conectado:', this.connected);
    
    if (!this.connected) {
      console.warn('⚠️ No conectado, intentando de todas formas (socket.io intentará reintentar)');
      // Intentar de todas formas - socket.io lo encoleará
    }
    
    this.socket.emit('chatMessage', roomId, message);
    console.log('✅ Mensaje emitido');
  }

  sendTimerUpdate(roomId: string, timerState: any) {
    if (!this.connected) return;
    this.socket.emit('timerUpdate', roomId, timerState);
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getSocketId(): string {
    return this.socket.id || '';
  }
}