import { API_BASE_URL, FEATURES } from '../../config';
import { mockSpinHistoryTable } from '../mockData/mockSpinHistoryData';

// Types
interface SpinRequest {
  eventId: string | number;
  participantId?: string | number;
  locationId?: string | number;
}

interface SpinResult {
  id: number;
  spinId: number;
  outcome: 'WIN' | 'LOSE' | 'INVALID' | 'ERROR';
  rewardId: number | null;
  rewardName: string | null;
  rewardValue: string | null;
  rewardColor: string | null;
  timestamp: string;
  multiplier: number;
  isGoldenHour: boolean;
}

export const wheelService = {
  /**
   * Spins the wheel for a specific event and participant
   */
  spinWheel: async (request: SpinRequest): Promise<SpinResult> => {
    if (FEATURES.USE_MOCK_DATA) {
      // Return mock data
      const rewardWon = Math.random() > 0.7;
      const mockRewardId = rewardWon ? Math.floor(Math.random() * 25) + 1 : null;
      const rewardColors = ['#e91e63', '#9c27b0', '#3f51b5', '#2196f3', '#009688'];
      
      return {
        id: Math.floor(Math.random() * 10000),
        spinId: Math.floor(Math.random() * 1000),
        outcome: rewardWon ? 'WIN' : 'LOSE',
        rewardId: mockRewardId,
        rewardName: rewardWon ? `Prize ${mockRewardId}` : null,
        rewardValue: rewardWon ? `$${Math.floor(Math.random() * 100)}` : null,
        rewardColor: rewardWon ? rewardColors[Math.floor(Math.random() * rewardColors.length)] : null,
        timestamp: new Date().toISOString(),
        multiplier: Math.random() > 0.2 ? 2.0 : 1.0,
        isGoldenHour: Math.random() > 0.7
      };
    }

    // Real API call
    try {
      const response = await fetch(`${API_BASE_URL}/events/spin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Spin failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error spinning wheel:', error);
      throw error;
    }
  },

  /**
   * Get remaining spins for a participant in an event
   */
  getRemainingSpins: async (eventId: string | number, participantId: string | number): Promise<number> => {
    if (FEATURES.USE_MOCK_DATA) {
      // Return a random number of spins
      return Math.floor(Math.random() * 5) + 1;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/events/${eventId}/participants/${participantId}/spins-remaining`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get remaining spins with status: ${response.status}`);
      }

      const data = await response.json();
      return data.remainingSpins;
    } catch (error) {
      console.error('Error getting remaining spins:', error);
      throw error;
    }
  },

  /**
   * Get spin history for a participant in an event
   */
  getSpinHistory: async (
    eventId: string | number,
    participantId?: string | number,
    page = 0,
    size = 10
  ) => {
    if (FEATURES.USE_MOCK_DATA) {
      // Return mock data
      const filteredRows = mockSpinHistoryTable.rows.filter(row => 
        row.data.eventId === Number(eventId) && 
        (!participantId || row.data.participantId === Number(participantId))
      );
      
      return {
        spins: filteredRows.slice(page * size, (page + 1) * size).map(row => ({
          id: row.data.id,
          outcome: row.data.outcome,
          rewardId: row.data.rewardId,
          rewardName: row.data.rewardId ? `Prize ${row.data.rewardId}` : null,
          timestamp: row.data.createdAt,
          claimed: row.data.claimed,
          claimedDate: row.data.claimedDate
        })),
        totalItems: filteredRows.length,
        totalPages: Math.ceil(filteredRows.length / size)
      };
    }

    // Real API call
    try {
      let url = `${API_BASE_URL}/events/${eventId}/spins?page=${page}&size=${size}`;
      if (participantId) {
        url += `&participantId=${participantId}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get spin history with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting spin history:', error);
      throw error;
    }
  },
  
  /**
   * Claim a reward
   */
  claimReward: async (spinId: number) => {
    if (FEATURES.USE_MOCK_DATA) {
      // Mock successful claim
      return { success: true, message: "Reward claimed successfully" };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/rewards/claim/${spinId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to claim reward with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error claiming reward:', error);
      throw error;
    }
  }
};
