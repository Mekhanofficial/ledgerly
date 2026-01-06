// src/utils/draftStorage.js
export const draftStorage = {
  saveDraft: (draftData) => {
    try {
      const drafts = JSON.parse(localStorage.getItem('ledgerly_drafts') || '[]');
      drafts.push(draftData);
      localStorage.setItem('ledgerly_drafts', JSON.stringify(drafts));
      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      return false;
    }
  },

  getDrafts: () => {
    try {
      return JSON.parse(localStorage.getItem('ledgerly_drafts') || '[]');
    } catch (error) {
      console.error('Error getting drafts:', error);
      return [];
    }
  },

  getDraft: (id) => {
    try {
      const drafts = JSON.parse(localStorage.getItem('ledgerly_drafts') || '[]');
      return drafts.find(d => d.id === id);
    } catch (error) {
      console.error('Error getting draft:', error);
      return null;
    }
  },

  updateDraft: (id, updatedData) => {
    try {
      const drafts = JSON.parse(localStorage.getItem('ledgerly_drafts') || '[]');
      const index = drafts.findIndex(d => d.id === id);
      if (index !== -1) {
        drafts[index] = { ...drafts[index], ...updatedData };
        localStorage.setItem('ledgerly_drafts', JSON.stringify(drafts));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating draft:', error);
      return false;
    }
  },

  deleteDraft: (id) => {
    try {
      const drafts = JSON.parse(localStorage.getItem('ledgerly_drafts') || '[]');
      const updatedDrafts = drafts.filter(d => d.id !== id);
      localStorage.setItem('ledgerly_drafts', JSON.stringify(updatedDrafts));
      return true;
    } catch (error) {
      console.error('Error deleting draft:', error);
      return false;
    }
  },

  clearDrafts: () => {
    try {
      localStorage.removeItem('ledgerly_drafts');
      return true;
    } catch (error) {
      console.error('Error clearing drafts:', error);
      return false;
    }
  }
};