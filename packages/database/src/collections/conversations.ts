/**
 * Conversations collection operations
 */

import { getFirestore, FieldValue } from '../config/firebase-admin';
import type {
  Conversation,
  ConversationDocument,
  Message,
  MessageDocument,
  ConversationSummary,
  ConversationSummaryDocument,
  CreateConversationInput,
} from '@amu/shared';
import { generateId } from '@amu/shared';

const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_SUBCOLLECTION = 'messages';
const SUMMARIES_COLLECTION = 'conversation_summaries';

// ============================================
// Conversation Operations
// ============================================

/**
 * Get a conversation by ID
 */
export async function getConversationById(conversationId: string): Promise<Conversation | null> {
  const db = getFirestore();
  const doc = await db.collection(CONVERSATIONS_COLLECTION).doc(conversationId).get();

  if (!doc.exists) {
    return null;
  }

  return documentToConversation(doc.data() as ConversationDocument);
}

/**
 * Get conversations for a user
 */
export async function getConversationsByUserId(userId: string): Promise<Conversation[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection(CONVERSATIONS_COLLECTION)
    .where('conversation_user_id', '==', userId)
    .orderBy('conversation_last_message_date', 'desc')
    .get();

  return snapshot.docs.map((doc) => documentToConversation(doc.data() as ConversationDocument));
}

/**
 * Get active conversation for an enrolment
 */
export async function getActiveConversationForEnrolment(
  enrolmentId: string
): Promise<Conversation | null> {
  const db = getFirestore();
  const snapshot = await db
    .collection(CONVERSATIONS_COLLECTION)
    .where('conversation_enrolment_id', '==', enrolmentId)
    .where('conversation_status', '==', 'active')
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return documentToConversation(snapshot.docs[0]?.data() as ConversationDocument);
}

/**
 * Create a new conversation
 */
export async function createConversation(input: CreateConversationInput): Promise<Conversation> {
  const db = getFirestore();
  const conversationId = generateId('conv');
  const now = new Date().toISOString();

  const conversationDoc: ConversationDocument = {
    conversation_id: conversationId,
    conversation_user_id: input.conversation_user_id,
    conversation_enrolment_id: input.conversation_enrolment_id,
    conversation_type: input.conversation_type,
    conversation_status: 'active',
    conversation_started_date: now,
    conversation_last_message_date: now,
    conversation_module_id: input.conversation_module_id,
    conversation_competency_id: input.conversation_competency_id,
    conversation_message_count: 0,
    conversation_total_tokens_used: 0,
    conversation_summary_count: 0,
  };

  await db.collection(CONVERSATIONS_COLLECTION).doc(conversationId).set(conversationDoc);

  return documentToConversation(conversationDoc);
}

/**
 * Update conversation stats after a message
 */
export async function updateConversationStats(
  conversationId: string,
  tokensUsed: number
): Promise<void> {
  const db = getFirestore();
  await db.collection(CONVERSATIONS_COLLECTION).doc(conversationId).update({
    conversation_message_count: FieldValue.increment(1),
    conversation_total_tokens_used: FieldValue.increment(tokensUsed),
    conversation_last_message_date: new Date().toISOString(),
  });
}

/**
 * Update conversation summary reference
 */
export async function updateConversationSummary(
  conversationId: string,
  summaryId: string
): Promise<void> {
  const db = getFirestore();
  await db.collection(CONVERSATIONS_COLLECTION).doc(conversationId).update({
    conversation_latest_summary_id: summaryId,
    conversation_summary_count: FieldValue.increment(1),
  });
}

// ============================================
// Message Operations
// ============================================

/**
 * Get messages for a conversation
 */
export async function getMessagesByConversationId(
  conversationId: string,
  limit?: number
): Promise<Message[]> {
  const db = getFirestore();
  let query = db
    .collection(CONVERSATIONS_COLLECTION)
    .doc(conversationId)
    .collection(MESSAGES_SUBCOLLECTION)
    .orderBy('message_timestamp', 'asc');

  if (limit) {
    query = query.limitToLast(limit);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => documentToMessage(doc.data() as MessageDocument));
}

/**
 * Get recent messages for context building
 */
export async function getRecentMessages(
  conversationId: string,
  count: number
): Promise<Message[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection(CONVERSATIONS_COLLECTION)
    .doc(conversationId)
    .collection(MESSAGES_SUBCOLLECTION)
    .orderBy('message_timestamp', 'desc')
    .limit(count)
    .get();

  // Return in chronological order
  return snapshot.docs
    .map((doc) => documentToMessage(doc.data() as MessageDocument))
    .reverse();
}

/**
 * Add a message to a conversation
 */
export async function addMessage(
  conversationId: string,
  role: Message['message_role'],
  content: string,
  tokens?: { input?: number; output?: number },
  assessment?: Message['message_competency_assessment']
): Promise<Message> {
  const db = getFirestore();
  const messageId = generateId('msg');
  const now = new Date().toISOString();

  const messageDoc: MessageDocument = {
    message_id: messageId,
    message_role: role,
    message_content: content,
    message_timestamp: now,
    message_input_tokens: tokens?.input,
    message_output_tokens: tokens?.output,
    message_competency_assessment: assessment,
  };

  await db
    .collection(CONVERSATIONS_COLLECTION)
    .doc(conversationId)
    .collection(MESSAGES_SUBCOLLECTION)
    .doc(messageId)
    .set(messageDoc);

  // Update conversation stats
  const totalTokens = (tokens?.input || 0) + (tokens?.output || 0);
  await updateConversationStats(conversationId, totalTokens);

  return documentToMessage(messageDoc);
}

// ============================================
// Summary Operations
// ============================================

/**
 * Get summaries for a conversation
 */
export async function getSummariesByConversationId(
  conversationId: string
): Promise<ConversationSummary[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection(SUMMARIES_COLLECTION)
    .where('summary_conversation_id', '==', conversationId)
    .orderBy('summary_session_number', 'asc')
    .get();

  return snapshot.docs.map((doc) => documentToSummary(doc.data() as ConversationSummaryDocument));
}

/**
 * Get recent summaries for context
 */
export async function getRecentSummaries(
  conversationId: string,
  count: number
): Promise<ConversationSummary[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection(SUMMARIES_COLLECTION)
    .where('summary_conversation_id', '==', conversationId)
    .orderBy('summary_session_number', 'desc')
    .limit(count)
    .get();

  // Return in chronological order
  return snapshot.docs
    .map((doc) => documentToSummary(doc.data() as ConversationSummaryDocument))
    .reverse();
}

/**
 * Create a conversation summary
 */
export async function createSummary(
  conversationId: string,
  sessionNumber: number,
  startMessageId: string,
  endMessageId: string,
  messageCount: number,
  summaryContent: {
    text: string;
    keyInsights: string[];
    breakthroughs: string[];
    struggles: string[];
    notableMoments: string[];
  },
  tokensUsed: number
): Promise<ConversationSummary> {
  const db = getFirestore();
  const summaryId = generateId('sum');
  const now = new Date().toISOString();

  const summaryDoc: ConversationSummaryDocument = {
    summary_id: summaryId,
    summary_conversation_id: conversationId,
    summary_session_number: sessionNumber,
    summary_start_message_id: startMessageId,
    summary_end_message_id: endMessageId,
    summary_message_count: messageCount,
    summary_text: summaryContent.text,
    summary_key_insights: summaryContent.keyInsights,
    summary_breakthroughs: summaryContent.breakthroughs,
    summary_struggles: summaryContent.struggles,
    summary_notable_moments: summaryContent.notableMoments,
    summary_created_date: now,
    summary_tokens_used: tokensUsed,
  };

  await db.collection(SUMMARIES_COLLECTION).doc(summaryId).set(summaryDoc);

  // Update conversation with latest summary
  await updateConversationSummary(conversationId, summaryId);

  return documentToSummary(summaryDoc);
}

// ============================================
// Document Converters
// ============================================

function documentToConversation(doc: ConversationDocument): Conversation {
  return {
    ...doc,
    conversation_started_date: new Date(doc.conversation_started_date),
    conversation_last_message_date: new Date(doc.conversation_last_message_date),
  };
}

function documentToMessage(doc: MessageDocument): Message {
  return {
    ...doc,
    message_timestamp: new Date(doc.message_timestamp),
  };
}

function documentToSummary(doc: ConversationSummaryDocument): ConversationSummary {
  return {
    ...doc,
    summary_created_date: new Date(doc.summary_created_date),
  };
}
