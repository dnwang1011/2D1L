/**
 * API types for Conversation (Chat) interactions
 */
import type { TConversation, TConversationMessage } from '../entities';
import type { TPaginationInput } from './common.types';
/**
 * Request payload for sending a message
 */
export interface TSendMessageRequest {
    conversation_id?: string | null;
    message_text?: string | null;
    media_attachments?: {
        type: string;
        url: string;
    }[];
}
/**
 * Response payload after sending a message (contains the assistant's reply)
 */
export interface TSendMessageResponse {
    user_message: TConversationMessage;
    assistant_message: TConversationMessage;
    conversation_id: string;
}
/**
 * Request payload for retrieving conversation history
 */
export interface TGetConversationHistoryRequest extends TPaginationInput {
    conversation_id: string;
}
/**
 * Response payload containing conversation history
 */
export interface TGetConversationHistoryResponse {
    conversation: TConversation;
    messages: TConversationMessage[];
}
/**
 * Request payload for listing conversations
 */
export interface TListConversationsRequest extends TPaginationInput {
    status?: 'active' | 'archived';
}
/**
 * Response payload containing a list of conversations
 */
export interface TListConversationsResponse {
    conversations: TConversation[];
}
//# sourceMappingURL=chat.api.types.d.ts.map