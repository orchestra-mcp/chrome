/**
 * Sync Protocol Handler
 * Handles message protocol between Chrome extension and desktop app
 */

export interface SyncMessage {
  type: string;
  payload?: any;
  timestamp: number;
  id: string;
}

export interface SidebarUpdate {
  entries: SidebarEntry[];
}

export interface SidebarEntry {
  id: string;
  label: string;
  icon?: string;
  action: string;
  badge?: number;
}

export interface SettingsSync {
  theme: string;
  [key: string]: any;
}

export interface ThemeChange {
  theme: string;
  variant?: string;
}

export class SyncProtocol {
  private messageHandlers: Map<string, (payload: any) => void> = new Map();

  /**
   * Register handler for message type
   */
  on(type: string, handler: (payload: any) => void): void {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Unregister handler for message type
   */
  off(type: string): void {
    this.messageHandlers.delete(type);
  }

  /**
   * Handle incoming message from desktop
   */
  handleMessage(message: SyncMessage): void {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message.payload);
    } else {
      console.warn('[SyncProtocol] No handler for message type:', message.type);
    }
  }

  /**
   * Create message to send to desktop
   */
  createMessage(type: string, payload?: any): SyncMessage {
    return {
      type,
      payload,
      timestamp: Date.now(),
      id: this.generateId(),
    };
  }

  /**
   * Create ping message
   */
  createPing(): SyncMessage {
    return this.createMessage('ping');
  }

  /**
   * Create pong response
   */
  createPong(): SyncMessage {
    return this.createMessage('pong');
  }

  /**
   * Validate message structure
   */
  isValidMessage(data: any): data is SyncMessage {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.type === 'string' &&
      typeof data.timestamp === 'number' &&
      typeof data.id === 'string'
    );
  }

  /**
   * Generate unique message ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
