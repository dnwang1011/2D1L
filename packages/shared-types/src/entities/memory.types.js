"use strict";
/**
 * Types related to Memory Units and Raw Content.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERawContentType = exports.EMemoryProcessingStatus = exports.EMemorySourceType = void 0;
/**
 * Enum for origin types of memory units.
 */
var EMemorySourceType;
(function (EMemorySourceType) {
    EMemorySourceType["JOURNAL_ENTRY"] = "journal_entry";
    EMemorySourceType["CHAT_CONVERSATION"] = "chat_conversation";
    EMemorySourceType["IMPORTED_DOCUMENT"] = "imported_document";
    EMemorySourceType["FLEETING_THOUGHT"] = "fleeting_thought";
    EMemorySourceType["EMAIL"] = "email";
    EMemorySourceType["AUDIO_NOTE"] = "audio_note";
    EMemorySourceType["WEB_CLIP"] = "web_clip";
    EMemorySourceType["USER_REFLECTION"] = "user_reflection";
    EMemorySourceType["OTHER"] = "other";
})(EMemorySourceType || (exports.EMemorySourceType = EMemorySourceType = {}));
/**
 * Enum for processing status values for memory units.
 */
var EMemoryProcessingStatus;
(function (EMemoryProcessingStatus) {
    EMemoryProcessingStatus["PENDING_UPLOAD"] = "pending_upload";
    EMemoryProcessingStatus["UPLOADED"] = "uploaded";
    EMemoryProcessingStatus["PENDING_PROCESSING"] = "pending_processing";
    EMemoryProcessingStatus["TIER1_PROCESSING"] = "tier1_processing";
    EMemoryProcessingStatus["TIER1_COMPLETE"] = "tier1_complete";
    EMemoryProcessingStatus["TIER2_PROCESSING"] = "tier2_processing";
    EMemoryProcessingStatus["TIER2_COMPLETE"] = "tier2_complete";
    EMemoryProcessingStatus["TIER3_PROCESSING"] = "tier3_processing";
    EMemoryProcessingStatus["TIER3_COMPLETE"] = "tier3_complete";
    EMemoryProcessingStatus["PROCESSING_ERROR"] = "processing_error";
    EMemoryProcessingStatus["ARCHIVED"] = "archived";
})(EMemoryProcessingStatus || (exports.EMemoryProcessingStatus = EMemoryProcessingStatus = {}));
/**
 * Enum for raw content types.
 */
var ERawContentType;
(function (ERawContentType) {
    ERawContentType["JOURNAL_TEXT"] = "journal_text";
    ERawContentType["CHAT_MESSAGE_TEXT"] = "chat_message_text";
    ERawContentType["DOCUMENT_TEXT"] = "document_text";
    ERawContentType["EMAIL_BODY_TEXT"] = "email_body_text";
    ERawContentType["AUDIO_TRANSCRIPT"] = "audio_transcript";
    ERawContentType["WEB_PAGE_CONTENT"] = "web_page_content";
    ERawContentType["IMAGE_TEXT_OCR"] = "image_text_ocr";
    ERawContentType["USER_NOTE"] = "user_note";
    ERawContentType["OTHER_TEXT"] = "other_text";
})(ERawContentType || (exports.ERawContentType = ERawContentType = {}));
//# sourceMappingURL=memory.types.js.map