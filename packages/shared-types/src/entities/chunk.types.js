"use strict";
/**
 * Types related to Chunks.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChunkRole = void 0;
/**
 * Role types for chunks
 */
var ChunkRole;
(function (ChunkRole) {
    ChunkRole["USER_UTTERANCE"] = "user_utterance";
    ChunkRole["DOT_UTTERANCE"] = "dot_utterance";
    ChunkRole["SYSTEM_MESSAGE"] = "system_message";
    ChunkRole["IDENTIFIED_QUESTION"] = "identified_question";
    ChunkRole["KEY_INSIGHT"] = "key_insight";
    ChunkRole["PARAGRAPH"] = "paragraph";
    ChunkRole["HEADING"] = "heading";
    ChunkRole["LIST_ITEM"] = "list_item";
    ChunkRole["CODE_BLOCK"] = "code_block";
    ChunkRole["QUOTE"] = "quote";
})(ChunkRole || (exports.ChunkRole = ChunkRole = {}));
//# sourceMappingURL=chunk.types.js.map