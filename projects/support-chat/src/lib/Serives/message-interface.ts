
export interface SocketMessage {
    _id: string;
    sender: {
      _id: string;
      name: string;
      email: string;
      domain: string;
      userRole: {
        _id: string;
        role: string;
      };
    };
    receiver: {
      _id: string;
      name: string;
      email: string;
      domain: string;
      userRole: {
        _id: string;
        role: string;
      };
    };
    attachments: any[]; // You might want to replace 'any[]' with a more specific type for attachments
    message: string;
    messageId: string;
    type: string;
    timestamp: string;
    read: boolean;
    forward: boolean;
    delivered: boolean;
    seen: boolean;
    deliveredToSender: boolean;
    sentAt: string;
    deletedForMe: boolean;
    deletedForAll: boolean;
    replyTo: any; // You might want to replace 'any' with a more specific type for replyTo
    createdAt: string;
    updatedAt: string;
  }
  
  // Assuming messageId is unique across messages, you can create an interface for your storage
  export interface MessageStorage {
    [messageId: string]: SocketMessage;
  }
  