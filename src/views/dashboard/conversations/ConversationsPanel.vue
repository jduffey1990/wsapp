<!-- src/views/dashboard/conversations/ConversationsPanel.vue -->
<template>
  <v-container fluid>
    <v-row>
      <!-- LEFT: Conversations Sidebar -->
      <v-col cols="12" md="4" lg="3">
        <v-card class="conversations-sidebar">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Conversations</span>
            <v-btn
              icon="mdi-plus"
              size="small"
              variant="text"
              @click="createNewConversation"
            />
          </v-card-title>

          <v-divider />

          <!-- Loading -->
          <v-skeleton-loader
            v-if="loading"
            type="list-item-three-line@3"
          />

          <!-- Empty State -->
          <v-card-text v-else-if="conversations.length === 0" class="text-center py-8">
            <v-icon size="48" color="grey-lighten-1">mdi-message-outline</v-icon>
            <div class="text-body-2 mt-2">No conversations yet</div>
            <v-btn
              size="small"
              color="primary"
              class="mt-3"
              @click="createNewConversation"
            >
              Start Chatting
            </v-btn>
          </v-card-text>

          <!-- Conversation List -->
          <v-list v-else density="compact">
            <v-list-item
              v-for="conv in conversations"
              :key="conv.id"
              :active="selectedConversation?.id === conv.id"
              @click="selectConversation(conv)"
              class="conversation-item"
            >
              <template #prepend>
                <v-avatar color="primary" size="32">
                  <v-icon size="18">mdi-chat</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="text-subtitle-2">
                {{ conv.title || 'Untitled Conversation' }}
              </v-list-item-title>

              <v-list-item-subtitle class="text-caption">
                {{ conv.messages?.length || 0 }} messages
                <span v-if="conv.lastMessageAt">
                  · {{ formatTimeAgo(conv.lastMessageAt) }}
                </span>
              </v-list-item-subtitle>

              <template #append>
                <v-chip
                  v-if="conv.status === 'archived'"
                  size="x-small"
                  label
                  variant="outlined"
                >
                  Archived
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- RIGHT: Chat Interface -->
      <v-col cols="12" md="8" lg="9">
        <!-- No Conversation Selected -->
        <div v-if="!selectedConversation" class="empty-chat">
          <v-icon size="80" color="grey-lighten-1">mdi-chat-outline</v-icon>
          <div class="text-h6 mt-4">Select a conversation</div>
          <div class="text-body-2 text-medium-emphasis">or start a new one to begin chatting</div>
        </div>

        <!-- Conversation View -->
        <v-card v-else class="chat-card" elevation="2">
          <!-- Header -->
          <v-card-title class="d-flex justify-space-between align-center pa-4">
            <div>
              <div class="text-h6">
                {{ selectedConversation.title || 'Untitled Conversation' }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ selectedConversation.messages?.length || 0 }} messages
              </div>
            </div>

            <div class="d-flex ga-2">
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click="editTitle"
              />
              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    size="small"
                    variant="text"
                    v-bind="props"
                  />
                </template>
                <v-list density="compact">
                  <v-list-item @click="archiveConversation">
                    <v-list-item-title>Archive</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="deleteConversation">
                    <v-list-item-title class="text-error">Delete</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-card-title>

          <v-divider />

          <!-- Messages Area -->
          <v-card-text ref="messagesContainer" class="messages-container">
            <div
              v-for="(message, idx) in selectedConversation.messages || []"
              :key="`msg-${idx}`"
              :class="['message-bubble', message.role]"
            >
              <div class="message-avatar">
                <v-avatar
                  :color="message.role === 'user' ? 'primary' : 'secondary'"
                  size="32"
                >
                  <v-icon size="18">
                    {{ message.role === 'user' ? 'mdi-account' : 'mdi-robot' }}
                  </v-icon>
                </v-avatar>
              </div>

              <div class="message-content">
                <div class="message-header">
                  <span class="font-weight-bold">
                    {{ message.role === 'user' ? 'You' : 'AI Assistant' }}
                  </span>
                  <span class="text-caption text-medium-emphasis ml-2">
                    {{ formatTime(message.timestamp) }}
                  </span>
                </div>
                <div class="message-text">
                  {{ message.content }}
                </div>
              </div>
            </div>

            <!-- Loading indicator when sending -->
            <div v-if="sendingMessage" class="message-bubble assistant">
              <div class="message-avatar">
                <v-avatar color="secondary" size="32">
                  <v-icon size="18">mdi-robot</v-icon>
                </v-avatar>
              </div>
              <div class="message-content">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </v-card-text>

          <v-divider />

          <!-- Message Input -->
          <v-card-actions class="pa-4">
            <v-textarea
              v-model="newMessage"
              placeholder="Type your message..."
              rows="2"
              variant="outlined"
              density="comfortable"
              auto-grow
              :disabled="sendingMessage"
              @keydown.enter.exact.prevent="sendMessage"
              @keydown.enter.shift.exact="newMessage += '\n'"
            >
              <template #append-inner>
                <v-btn
                  icon="mdi-send"
                  size="small"
                  color="primary"
                  :disabled="!newMessage.trim() || sendingMessage"
                  :loading="sendingMessage"
                  @click="sendMessage"
                />
              </template>
            </v-textarea>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit Title Dialog -->
    <v-dialog v-model="titleDialog.open" max-width="500">
      <v-card>
        <v-card-title>Edit Conversation Title</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="titleDialog.title"
            label="Title"
            variant="outlined"
            density="comfortable"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="titleDialog.open = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveTitle">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { useUserStore } from '@/store/user';
import { inject, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import moment from 'moment';
import { storeToRefs } from 'pinia';
const route = useRoute();
const selectedConversationId = ref(null);


/* Inject APIs */
const toast = inject('toast')?.show
const $companiesApi = inject('$companiesApi')

/* User Store */
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

/* State */
const loading = ref(false)
const sendingMessage = ref(false)
const conversations = ref([])
const selectedConversation = ref(null)
const newMessage = ref('')
const messagesContainer = ref(null)

/* Title Dialog */
const titleDialog = ref({
  open: false,
  title: ''
})

/* Helper Functions */
function formatTimeAgo(timestamp) {
  return moment(timestamp).fromNow()
}

function formatTime(timestamp) {
  return moment(timestamp).format('h:mm A')
}

/* API Calls */
async function fetchConversations() {
  if (!user.value?.companyId) return

  loading.value = true
  try {
    const response = await $companiesApi.get('/conversations', {
      params: { companyId: user.value.companyId }
    })
    conversations.value = response.data
  } catch (error) {
    console.error('Error fetching conversations:', error)
    toast?.({ message: 'Failed to load conversations', error: true })
  } finally {
    loading.value = false
  }
}

async function createNewConversation() {
  if (!user.value?.companyId) return

  try {
    const response = await $companiesApi.post('/conversations', {
      companyId: user.value.companyId,
      title: 'New Conversation',
      status: 'active',
      messages: []
    })
    conversations.value.unshift(response.data)
    selectedConversation.value = response.data
    toast?.({ message: 'New conversation created' })
  } catch (error) {
    console.error('Error creating conversation:', error)
    toast?.({ message: 'Failed to create conversation', error: true })
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || !selectedConversation.value) return

  sendingMessage.value = true
  try {
    // Create the user message
    const userMessage = {
      role: 'user',
      content: newMessage.value.trim(),
      timestamp: new Date().toISOString()
    }

    // Add message to conversation
    const updatedMessages = [
      ...(selectedConversation.value.messages || []),
      userMessage
    ]

    // Update conversation
    const response = await $companiesApi.patch(
      `/conversations/${selectedConversation.value.id}`,
      {
        messages: updatedMessages,
        lastMessageAt: new Date().toISOString()
      }
    )

    // Update local state
    selectedConversation.value = response.data
    const index = conversations.value.findIndex(c => c.id === response.data.id)
    if (index !== -1) {
      conversations.value[index] = response.data
    }

    newMessage.value = ''

    // TODO: Call AI API to get response
    // For now, we'll just add a placeholder assistant message
    setTimeout(async () => {
      const assistantMessage = {
        role: 'assistant',
        content: 'This is a placeholder response. Integrate with your AI API here.',
        timestamp: new Date().toISOString()
      }

      const withAssistant = [
        ...response.data.messages,
        assistantMessage
      ]

      const aiResponse = await $companiesApi.patch(
        `/conversations/${selectedConversation.value.id}`,
        {
          messages: withAssistant,
          lastMessageAt: new Date().toISOString()
        }
      )

      selectedConversation.value = aiResponse.data
      const idx = conversations.value.findIndex(c => c.id === aiResponse.data.id)
      if (idx !== -1) {
        conversations.value[idx] = aiResponse.data
      }

      scrollToBottom()
    }, 1000)

    scrollToBottom()
  } catch (error) {
    console.error('Error sending message:', error)
    toast?.({ message: 'Failed to send message', error: true })
  } finally {
    sendingMessage.value = false
  }
}

function selectConversation(conversation) {
  selectedConversation.value = conversation
  nextTick(() => {
    scrollToBottom()
  })
}

function scrollToBottom() {
  if (messagesContainer.value) {
    nextTick(() => {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    })
  }
}

/* Edit Title */
function editTitle() {
  if (!selectedConversation.value) return
  titleDialog.value.title = selectedConversation.value.title || ''
  titleDialog.value.open = true
}

async function saveTitle() {
  if (!selectedConversation.value) return

  try {
    const response = await $companiesApi.patch(
      `/conversations/${selectedConversation.value.id}`,
      { title: titleDialog.value.title }
    )

    selectedConversation.value = response.data
    const index = conversations.value.findIndex(c => c.id === response.data.id)
    if (index !== -1) {
      conversations.value[index] = response.data
    }

    titleDialog.value.open = false
    toast?.({ message: 'Title updated' })
  } catch (error) {
    console.error('Error updating title:', error)
    toast?.({ message: 'Failed to update title', error: true })
  }
}

/* Archive/Delete */
async function archiveConversation() {
  if (!selectedConversation.value) return

  try {
    await $companiesApi.post(
      `/conversations/${selectedConversation.value.id}/archive`
    )

    const index = conversations.value.findIndex(c => c.id === selectedConversation.value.id)
    if (index !== -1) {
      conversations.value[index].status = 'archived'
    }

    toast?.({ message: 'Conversation archived' })
  } catch (error) {
    console.error('Error archiving conversation:', error)
    toast?.({ message: 'Failed to archive conversation', error: true })
  }
}

async function deleteConversation() {
  if (!selectedConversation.value) return
  if (!confirm('Are you sure you want to delete this conversation?')) return

  try {
    await $companiesApi.delete(`/conversations/${selectedConversation.value.id}`)
    conversations.value = conversations.value.filter(c => c.id !== selectedConversation.value.id)
    selectedConversation.value = null
    toast?.({ message: 'Conversation deleted' })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    toast?.({ message: 'Failed to delete conversation', error: true })
  }
}

const loadConversation = async (conversationId) => {
  // Your logic to load and display the conversation
  console.log('Loading conversation:', conversationId);
};

/* Lifecycle */
// Watch for route param changes
watch(() => route.params.id, (newId) => {
  if (newId) {
    selectedConversationId.value = newId;
    // Load this specific conversation
    loadConversation(newId);
  }
}, { immediate: true });

onMounted(() => {
  fetchConversations()
  if (route.params.id) {
    loadConversation(route.params.id);
  }
})

/* Watch for conversation changes to scroll */
watch(() => selectedConversation.value?.messages?.length, () => {
  scrollToBottom()
})
</script>

<style scoped>
.conversations-sidebar {
  height: calc(100vh - 250px);
  overflow-y: auto;
}

.conversation-item {
  cursor: pointer;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 250px);
}

.chat-card {
  height: calc(100vh - 250px);
  display: flex;
  flex-direction: column;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-bubble {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.message-bubble.user {
  flex-direction: row-reverse;
}

.message-bubble.user .message-content {
  background: #5B9279;
  color: white;
}

.message-content {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  background: #f5f5f5;
}

.message-header {
  margin-bottom: 4px;
}

.message-text {
  white-space: pre-wrap;
  word-break: break-word;
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}
</style>