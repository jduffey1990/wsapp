// src/store/workshop.js

import { defineStore } from 'pinia';

export const useWorkshopStore = defineStore('workshop', {
  state: () => ({
    // Workshop retailers
    workshopRetailers: JSON.parse(localStorage.getItem('workshop-retailers') || '[]'),
    
    // Current retailer being viewed in detail
    currentRetailer: null,
    
    // UI state
    loading: false,
    error: null,
  }),

  getters: {
    /**
     * Get all workshop retailers
     */
    allRetailers: (state) => state.workshopRetailers,
    
    /**
     * Check if a retailer is in the workshop
     */
    isInWorkshop: (state) => (retailerId) => {
      return state.workshopRetailers.some(wr => wr.retailerId === retailerId);
    },
    
    /**
     * Get workshop retailer by ID
     */
    getWorkshopRetailer: (state) => (retailerId) => {
      return state.workshopRetailers.find(wr => wr.retailerId === retailerId);
    },
    
    /**
     * Count by status
     */
    countByStatus: (state) => {
      return state.workshopRetailers.reduce((acc, wr) => {
        acc[wr.status] = (acc[wr.status] || 0) + 1;
        return acc;
      }, {});
    },
    
    /**
     * Get retailers sorted by date added (newest first)
     */
    sortedByDate: (state) => {
      return [...state.workshopRetailers].sort((a, b) => 
        new Date(b.addedDate) - new Date(a.addedDate)
      );
    },
  },

  actions: {
    /**
     * Add a retailer to the workshop
     */
    addToWorkshop(retailer, user) {
      const workshopRetailer = {
        id: `workshop-${Date.now()}`, // Simple ID for now
        retailerId: retailer.id,
        retailer: retailer, // Store full retailer object
        addedBy: user.id,
        addedByName: user.name || `${user.firstName} ${user.lastName}`,
        addedDate: new Date().toISOString(),
        status: 'research', // Default status
        assignedTo: user.id,
        assignedToName: user.name || `${user.firstName} ${user.lastName}`,
        lastContactDate: null,
        notes: [],
        activities: [
          {
            id: `activity-${Date.now()}`,
            type: 'added',
            user: user.name || `${user.firstName} ${user.lastName}`,
            userId: user.id,
            date: new Date().toISOString(),
            content: 'Added to workshop'
          }
        ]
      };
      
      this.workshopRetailers.push(workshopRetailer);
      this.saveToLocalStorage();
      
      return workshopRetailer;
    },
    
    /**
     * Remove a retailer from the workshop
     */
    removeFromWorkshop(retailerId) {
      const index = this.workshopRetailers.findIndex(wr => wr.retailerId === retailerId);
      if (index > -1) {
        this.workshopRetailers.splice(index, 1);
        this.saveToLocalStorage();
        return true;
      }
      return false;
    },
    
    /**
     * Update retailer status
     */
    updateStatus(retailerId, status, user) {
      const workshopRetailer = this.getWorkshopRetailer(retailerId);
      if (workshopRetailer) {
        workshopRetailer.status = status;
        
        // Add activity
        this.addActivity(retailerId, {
          type: 'status_change',
          user: user.name || `${user.firstName} ${user.lastName}`,
          userId: user.id,
          date: new Date().toISOString(),
          content: `Status changed to ${status}`
        });
        
        this.saveToLocalStorage();
      }
    },
    
    /**
     * Update last contact date
     */
    updateLastContact(retailerId, date = new Date().toISOString()) {
      const workshopRetailer = this.getWorkshopRetailer(retailerId);
      if (workshopRetailer) {
        workshopRetailer.lastContactDate = date;
        this.saveToLocalStorage();
      }
    },
    
    /**
     * Update assigned user
     */
    updateAssignedTo(retailerId, userId, userName) {
      const workshopRetailer = this.getWorkshopRetailer(retailerId);
      if (workshopRetailer) {
        workshopRetailer.assignedTo = userId;
        workshopRetailer.assignedToName = userName;
        this.saveToLocalStorage();
      }
    },
    
    /**
     * Add a note
     */
    addNote(retailerId, note, user) {
      const workshopRetailer = this.getWorkshopRetailer(retailerId);
      if (workshopRetailer) {
        const newNote = {
          id: `note-${Date.now()}`,
          content: note,
          user: user.name || `${user.firstName} ${user.lastName}`,
          userId: user.id,
          date: new Date().toISOString()
        };
        
        workshopRetailer.notes.push(newNote);
        
        // Also add to activity timeline
        this.addActivity(retailerId, {
          type: 'note',
          user: user.name || `${user.firstName} ${user.lastName}`,
          userId: user.id,
          date: new Date().toISOString(),
          content: note
        });
        
        this.saveToLocalStorage();
        return newNote;
      }
    },
    
    /**
     * Delete a note
     */
    deleteNote(retailerId, noteId) {
      const workshopRetailer = this.getWorkshopRetailer(retailerId);
      if (workshopRetailer) {
        const index = workshopRetailer.notes.findIndex(n => n.id === noteId);
        if (index > -1) {
          workshopRetailer.notes.splice(index, 1);
          this.saveToLocalStorage();
          return true;
        }
      }
      return false;
    },
    
    /**
     * Add activity to timeline
     */
    addActivity(retailerId, activity) {
      const workshopRetailer = this.getWorkshopRetailer(retailerId);
      if (workshopRetailer) {
        const newActivity = {
          id: `activity-${Date.now()}`,
          ...activity
        };
        
        workshopRetailer.activities.push(newActivity);
        this.saveToLocalStorage();
        return newActivity;
      }
    },
    
    /**
     * Log a call
     */
    logCall(retailerId, notes, user) {
      this.addActivity(retailerId, {
        type: 'call',
        user: user.name || `${user.firstName} ${user.lastName}`,
        userId: user.id,
        date: new Date().toISOString(),
        content: notes
      });
      
      this.updateLastContact(retailerId);
    },
    
    /**
     * Log an email
     */
    logEmail(retailerId, subject, user) {
      this.addActivity(retailerId, {
        type: 'email',
        user: user.name || `${user.firstName} ${user.lastName}`,
        userId: user.id,
        date: new Date().toISOString(),
        content: subject
      });
      
      this.updateLastContact(retailerId);
    },
    
    /**
     * Log a meeting
     */
    logMeeting(retailerId, notes, user) {
      this.addActivity(retailerId, {
        type: 'meeting',
        user: user.name || `${user.firstName} ${user.lastName}`,
        userId: user.id,
        date: new Date().toISOString(),
        content: notes
      });
      
      this.updateLastContact(retailerId);
    },
    
    /**
     * Set current retailer for detail view
     */
    setCurrentRetailer(retailerId) {
      this.currentRetailer = this.getWorkshopRetailer(retailerId);
    },
    
    /**
     * Save to localStorage
     */
    saveToLocalStorage() {
      localStorage.setItem('workshop-retailers', JSON.stringify(this.workshopRetailers));
    },
    
    /**
     * Clear all workshop data
     */
    clearWorkshop() {
      this.workshopRetailers = [];
      this.currentRetailer = null;
      localStorage.removeItem('workshop-retailers');
    },
    
    /**
     * Clear the store
     */
    clearStore() {
      this.$reset();
    }
  }
});