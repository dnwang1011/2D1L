"use strict";
/**
 * Types related to Concepts (entities, themes, values, etc.).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerceptionType = exports.RelationshipType = exports.ConceptType = void 0;
/**
 * Controlled vocabulary for concept types based on the ontology
 */
var ConceptType;
(function (ConceptType) {
    // Self Domain
    ConceptType["VALUE"] = "value";
    ConceptType["PERSONAL_TRAIT"] = "personal_trait";
    ConceptType["SKILL"] = "skill";
    ConceptType["EMOTION"] = "emotion";
    ConceptType["INTEREST"] = "interest";
    ConceptType["STRUGGLE"] = "struggle";
    // Life Events Domain
    ConceptType["LIFE_EVENT_THEME"] = "life_event_theme";
    ConceptType["ACHIEVEMENT"] = "achievement";
    ConceptType["DECISION_POINT"] = "decision_point";
    ConceptType["MILESTONE"] = "milestone";
    // Relationships Domain
    ConceptType["PERSON"] = "person";
    ConceptType["ORGANIZATION"] = "organization";
    ConceptType["GROUP"] = "group";
    ConceptType["RELATIONSHIP_DYNAMIC"] = "relationship_dynamic";
    // Future Orientation Domain
    ConceptType["GOAL"] = "goal";
    ConceptType["ASPIRATION"] = "aspiration";
    ConceptType["PLAN"] = "plan";
    ConceptType["CONCERN"] = "concern";
    // General
    ConceptType["LOCATION"] = "location";
    ConceptType["TIME_PERIOD"] = "time_period";
    ConceptType["ACTIVITY"] = "activity";
    ConceptType["ARTWORK"] = "artwork";
    ConceptType["TOPIC"] = "topic";
    ConceptType["ABSTRACT_IDEA"] = "abstract_idea";
})(ConceptType || (exports.ConceptType = ConceptType = {}));
/**
 * Relationship types between concepts
 */
var RelationshipType;
(function (RelationshipType) {
    // Hierarchical
    RelationshipType["IS_A_TYPE_OF"] = "is_a_type_of";
    RelationshipType["IS_PART_OF"] = "is_part_of";
    RelationshipType["IS_INSTANCE_OF"] = "is_instance_of";
    // Causal
    RelationshipType["CAUSES"] = "causes";
    RelationshipType["INFLUENCES"] = "influences";
    RelationshipType["ENABLES"] = "enables";
    RelationshipType["PREVENTS"] = "prevents";
    RelationshipType["CONTRIBUTES_TO"] = "contributes_to";
    // Temporal
    RelationshipType["PRECEDES"] = "precedes";
    RelationshipType["FOLLOWS"] = "follows";
    RelationshipType["CO_OCCURS_WITH"] = "co_occurs_with";
    // Association
    RelationshipType["IS_SIMILAR_TO"] = "is_similar_to";
    RelationshipType["IS_OPPOSITE_OF"] = "is_opposite_of";
    RelationshipType["IS_ANALOGOUS_TO"] = "is_analogous_to";
    // Domain-specific
    RelationshipType["INSPIRES"] = "inspires";
    RelationshipType["SUPPORTS_VALUE"] = "supports_value";
    RelationshipType["EXEMPLIFIES_TRAIT"] = "exemplifies_trait";
    RelationshipType["IS_MILESTONE_FOR"] = "is_milestone_for";
    // Metaphorical
    RelationshipType["IS_METAPHOR_FOR"] = "is_metaphor_for";
    RelationshipType["REPRESENTS_SYMBOLICALLY"] = "represents_symbolically";
})(RelationshipType || (exports.RelationshipType = RelationshipType = {}));
/**
 * User perception types for concepts
 */
var PerceptionType;
(function (PerceptionType) {
    PerceptionType["HOLDS_VALUE"] = "holds_value";
    PerceptionType["HAS_INTEREST"] = "has_interest";
    PerceptionType["POSSESSES_TRAIT"] = "possesses_trait";
    PerceptionType["PURSUES_GOAL"] = "pursues_goal";
    PerceptionType["EXPERIENCES_EMOTION"] = "experiences_emotion";
    PerceptionType["STRUGGLES_WITH"] = "struggles_with";
})(PerceptionType || (exports.PerceptionType = PerceptionType = {}));
//# sourceMappingURL=concept.types.js.map