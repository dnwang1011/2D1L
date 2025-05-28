"use strict";
/**
 * Types related to the Ontology.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EOntologyTermStatus = exports.EOntologyTermScope = void 0;
/**
 * Enum for common ontology term scopes.
 */
var EOntologyTermScope;
(function (EOntologyTermScope) {
    EOntologyTermScope["CONCEPT_TYPE"] = "Concept.type";
    EOntologyTermScope["RELATIONSHIP_LABEL"] = "Relationship.label";
    EOntologyTermScope["PERCEPTION_TYPE"] = "Perception.type";
    EOntologyTermScope["ANNOTATION_TYPE"] = "Annotation.type";
    EOntologyTermScope["MEDIA_TYPE"] = "Media.type";
    // Add other scopes as ontology evolves
})(EOntologyTermScope || (exports.EOntologyTermScope = EOntologyTermScope = {}));
/**
 * Enum for common ontology term statuses.
 */
var EOntologyTermStatus;
(function (EOntologyTermStatus) {
    EOntologyTermStatus["ACTIVE"] = "active";
    EOntologyTermStatus["DEPRECATED"] = "deprecated";
    EOntologyTermStatus["CANDIDATE"] = "candidate";
    EOntologyTermStatus["REJECTED"] = "rejected";
    EOntologyTermStatus["UNDER_REVIEW"] = "under_review";
})(EOntologyTermStatus || (exports.EOntologyTermStatus = EOntologyTermStatus = {}));
//# sourceMappingURL=misc.types.js.map