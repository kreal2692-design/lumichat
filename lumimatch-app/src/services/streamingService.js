/**
 * Streaming Service - Live Stream Management
 * Handles live streaming, comments, gifts, and viewer management
 */

import { supabase } from '../../App';
import { logError, logInfo, logSuccess, logWarning } from '../utils/errorLogger';

class StreamingService {
  constructor() {
    this.currentStream = null;
    this.currentUser = null;
    this.subscriptions = new Map();
  }

  /**
   * START LIVE STREAM
   */
  async startLiveStream(userId, title, description = '', category = 'general') {
    try {
      logInfo('Streaming', 'Starting live stream...');
      
      // Create live stream record
      const { data: stream, error } = await supabase
        .from('live_streams')
        .insert({
          streamer_id: userId,
          title,
          description,
          category,
          is_live: true,
          viewer_count: 0,
          total_viewers: 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update user presence
      await this.updateUserPresence(userId, 'in_stream', stream.id);
      
      this.currentStream = stream;
      logSuccess('Streaming', 'Live stream started', stream.id);
      
      return stream;
    } catch (error) {
      logError('Streaming', 'Failed to start stream', error);
      throw error;
    }
  }

  /**
   * END LIVE STREAM
   */
  async endLiveStream(streamId, userId) {
    try {
      logInfo('Streaming', 'Ending live stream...', streamId);
      
      // Calculate total duration
      const { data: stream } = await supabase
        .from('live_streams')
        .select('started_at, total_viewers, total_earnings')
        .eq('id', streamId)
        .single();
      
      const duration = stream ? 
        Math.floor((new Date() - new Date(stream.started_at)) / 1000) : 0;
      
      // Update stream
      const { error } = await supabase
        .from('live_streams')
        .update({
          is_live: false,
          ended_at: new Date().toISOString(),
          viewer_count: 0,
        })
        .eq('id', streamId);
      
      if (error) throw error;
      
      // Update all viewers' left_at
      await supabase
        .from('stream_viewers')
        .update({ left_at: new Date().toISOString() })
        .eq('stream_id', streamId)
        .is('left_at', null);
      
      // Update user presence
      await this.updateUserPresence(userId, 'online', null);
      
      // Unsubscribe from all channels
      this.unsubscribeAll();
      
      this.currentStream = null;
      logSuccess('Streaming', 'Live stream ended', {
        duration,
        viewers: stream?.total_viewers,
        earnings: stream?.total_earnings,
      });
      
      return {
        duration,
        total_viewers: stream?.total_viewers || 0,
        total_earnings: stream?.total_earnings || 0,
      };
    } catch (error) {
      logError('Streaming', 'Failed to end stream', error);
      throw error;
    }
  }

  /**
   * JOIN STREAM AS VIEWER
   */
  async joinStream(streamId, userId) {
    try {
      logInfo('Streaming', 'Joining stream...', streamId);
      
      // Check if stream exists and is live
      const { data: stream, error: streamError } = await supabase
        .from('live_streams')
        .select('*')
        .eq('id', streamId)
        .eq('is_live', true)
        .single();
      
      if (streamError || !stream) {
        throw new Error('Stream not found or not live');
      }
      
      // Add viewer record
      const { error: viewerError } = await supabase
        .from('stream_viewers')
        .upsert({
          stream_id: streamId,
          user_id: userId,
          joined_at: new Date().toISOString(),
          left_at: null,
        }, {
          onConflict: 'stream_id,user_id',
        });
      
      if (viewerError) throw viewerError;
      
      // Increment total viewers if first time
      await supabase
        .from('live_streams')
        .update({
          total_viewers: stream.total_viewers + 1,
        })
        .eq('id', streamId);
      
      // Update user presence
      await this.updateUserPresence(userId, 'in_stream', streamId);
      
      logSuccess('Streaming', 'Joined stream', streamId);
      return stream;
    } catch (error) {
      logError('Streaming', 'Failed to join stream', error);
      throw error;
    }
  }

  /**
   * LEAVE STREAM
   */
  async leaveStream(streamId, userId) {
    try {
      logInfo('Streaming', 'Leaving stream...', streamId);
      
      // Update viewer left_at
      await supabase
        .from('stream_viewers')
        .update({ left_at: new Date().toISOString() })
        .eq('stream_id', streamId)
        .eq('user_id', userId);
      
      // Update user presence
      await this.updateUserPresence(userId, 'online', null);
      
      // Unsubscribe from channels
      this.unsubscribeAll();
      
      logSuccess('Streaming', 'Left stream', streamId);
    } catch (error) {
      logError('Streaming', 'Failed to leave stream', error);
      throw error;
    }
  }

  /**
   * SEND COMMENT
   */
  async sendComment(streamId, userId, username, avatarUrl, message) {
    try {
      const { data, error } = await supabase
        .from('stream_comments')
        .insert({
          stream_id: streamId,
          user_id: userId,
          username,
          avatar_url: avatarUrl,
          message,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      logInfo('Streaming', 'Comment sent');
      return data;
    } catch (error) {
      logError('Streaming', 'Failed to send comment', error);
      throw error;
    }
  }

  /**
   * SEND GIFT
   */
  async sendGift(streamId, senderId, senderUsername, receiverId, giftData) {
    try {
      logInfo('Streaming', 'Sending gift...', giftData);
      
      // Check sender balance
      const { data: sender } = await supabase
        .from('users')
        .select('diamonds')
        .eq('id', senderId)
        .single();
      
      if (!sender || sender.diamonds < giftData.value) {
        throw new Error('Insufficient diamonds');
      }
      
      // Deduct diamonds from sender
      await supabase
        .from('users')
        .update({ diamonds: sender.diamonds - giftData.value })
        .eq('id', senderId);
      
      // Add earnings to receiver (70% commission)
      const earnings = Math.floor(giftData.value * 0.7);
      await supabase
        .from('users')
        .update({ diamonds: supabase.sql`diamonds + ${earnings}` })
        .eq('id', receiverId);
      
      // Record gift
      const { data: gift, error } = await supabase
        .from('stream_gifts')
        .insert({
          stream_id: streamId,
          sender_id: senderId,
          sender_username: senderUsername,
          receiver_id: receiverId,
          gift_type: giftData.type,
          gift_name: giftData.name,
          gift_emoji: giftData.emoji,
          gift_value: giftData.value,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update stream earnings
      await supabase
        .from('live_streams')
        .update({
          total_gifts_received: supabase.sql`total_gifts_received + 1`,
          total_earnings: supabase.sql`total_earnings + ${earnings}`,
        })
        .eq('id', streamId);
      
      logSuccess('Streaming', 'Gift sent', { gift: giftData.name, value: giftData.value });
      return gift;
    } catch (error) {
      logError('Streaming', 'Failed to send gift', error);
      throw error;
    }
  }

  /**
   * GET ACTIVE LIVE STREAMS
   */
  async getActiveLiveStreams(limit = 20) {
    try {
      const { data, error } = await supabase
        .from('live_streams')
        .select(`
          *,
          streamer:users!live_streams_streamer_id_fkey(
            id,
            username,
            display_name,
            avatar_url,
            is_verified,
            is_premium
          )
        `)
        .eq('is_live', true)
        .order('viewer_count', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      logError('Streaming', 'Failed to get live streams', error);
      return [];
    }
  }

  /**
   * SUBSCRIBE TO STREAM COMMENTS
   */
  subscribeToComments(streamId, callback) {
    try {
      const channelName = `stream_comments_${streamId}`;
      
      const subscription = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'stream_comments',
            filter: `stream_id=eq.${streamId}`,
          },
          (payload) => {
            logInfo('Streaming', 'New comment received');
            callback(payload.new);
          }
        )
        .subscribe();
      
      this.subscriptions.set(channelName, subscription);
      logSuccess('Streaming', 'Subscribed to comments', streamId);
      
      return subscription;
    } catch (error) {
      logError('Streaming', 'Failed to subscribe to comments', error);
      throw error;
    }
  }

  /**
   * SUBSCRIBE TO STREAM GIFTS
   */
  subscribeToGifts(streamId, callback) {
    try {
      const channelName = `stream_gifts_${streamId}`;
      
      const subscription = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'stream_gifts',
            filter: `stream_id=eq.${streamId}`,
          },
          (payload) => {
            logInfo('Streaming', 'New gift received');
            callback(payload.new);
          }
        )
        .subscribe();
      
      this.subscriptions.set(channelName, subscription);
      logSuccess('Streaming', 'Subscribed to gifts', streamId);
      
      return subscription;
    } catch (error) {
      logError('Streaming', 'Failed to subscribe to gifts', error);
      throw error;
    }
  }

  /**
   * SUBSCRIBE TO VIEWER COUNT
   */
  subscribeToViewerCount(streamId, callback) {
    try {
      const channelName = `stream_viewers_${streamId}`;
      
      const subscription = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'stream_viewers',
            filter: `stream_id=eq.${streamId}`,
          },
          async () => {
            // Get current viewer count
            const { count } = await supabase
              .from('stream_viewers')
              .select('*', { count: 'exact', head: true })
              .eq('stream_id', streamId)
              .is('left_at', null);
            
            callback(count || 0);
          }
        )
        .subscribe();
      
      this.subscriptions.set(channelName, subscription);
      logSuccess('Streaming', 'Subscribed to viewer count', streamId);
      
      return subscription;
    } catch (error) {
      logError('Streaming', 'Failed to subscribe to viewer count', error);
      throw error;
    }
  }

  /**
   * UPDATE USER PRESENCE
   */
  async updateUserPresence(userId, status, currentActivity = null) {
    try {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: userId,
          status,
          current_activity: currentActivity,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });
      
      logInfo('Streaming', `User presence updated: ${status}`);
    } catch (error) {
      logError('Streaming', 'Failed to update presence', error);
    }
  }

  /**
   * UNSUBSCRIBE ALL
   */
  unsubscribeAll() {
    try {
      this.subscriptions.forEach((subscription, channelName) => {
        supabase.removeChannel(subscription);
        logInfo('Streaming', `Unsubscribed from ${channelName}`);
      });
      this.subscriptions.clear();
    } catch (error) {
      logError('Streaming', 'Failed to unsubscribe', error);
    }
  }

  /**
   * CLEANUP
   */
  cleanup() {
    this.unsubscribeAll();
    this.currentStream = null;
    this.currentUser = null;
  }
}

// Export singleton instance
export default new StreamingService();
