// Supabase Helper Service
import { supabase } from '../../App';
import { DEMO_MODE } from '../data/demoData';

// ============================================
// AUTH SERVICES
// ============================================

export const authService = {
  // Sign up with email
  signUp: async (email, password, userData) => {
    if (DEMO_MODE) {
      return { data: { user: { id: 'demo-user-1', email } }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData, // { username, display_name, age, gender }
        },
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign in with email
  signIn: async (email, password) => {
    if (DEMO_MODE) {
      return { data: { user: { id: 'demo-user-1', email } }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign in with phone
  signInWithPhone: async (phone, password) => {
    if (DEMO_MODE) {
      return { data: { user: { id: 'demo-user-1', phone } }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        phone,
        password,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign out
  signOut: async () => {
    if (DEMO_MODE) return { error: null };

    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    if (DEMO_MODE) {
      return { data: { user: { id: 'demo-user-1' } }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.getUser();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Reset password
  resetPassword: async (email) => {
    if (DEMO_MODE) return { data: {}, error: null };

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update password
  updatePassword: async (newPassword) => {
    if (DEMO_MODE) return { data: {}, error: null };

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// ============================================
// USER SERVICES
// ============================================

export const userService = {
  // Get user profile
  getProfile: async (userId) => {
    if (DEMO_MODE) return { data: null, error: null };

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update profile
  updateProfile: async (userId, updates) => {
    if (DEMO_MODE) return { data: updates, error: null };

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update online status
  updateOnlineStatus: async (userId, isOnline) => {
    if (DEMO_MODE) return { error: null };

    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_online: isOnline,
          last_seen: new Date().toISOString(),
        })
        .eq('id', userId);
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Get user tokens
  getTokens: async (userId) => {
    if (DEMO_MODE) return { data: { tokens: 150 }, error: null };

    try {
      const { data, error } = await supabase
        .from('users')
        .select('tokens')
        .eq('id', userId)
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Spend tokens
  spendTokens: async (userId, amount) => {
    if (DEMO_MODE) return { data: { tokens: 140 }, error: null };

    try {
      const { data: user } = await supabase
        .from('users')
        .select('tokens')
        .eq('id', userId)
        .single();

      if (user.tokens < amount) {
        return { data: null, error: { message: 'Insufficient tokens' } };
      }

      const { data, error } = await supabase
        .from('users')
        .update({ tokens: user.tokens - amount })
        .eq('id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// ============================================
// STORAGE SERVICES
// ============================================

export const storageService = {
  // Upload file
  uploadFile: async (bucket, path, file, fileType = 'image/jpeg') => {
    if (DEMO_MODE) {
      return { data: { path: 'demo-' + Date.now() + '.jpg' }, error: null };
    }

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          contentType: fileType,
          upsert: false,
        });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get public URL
  getPublicUrl: (bucket, path) => {
    if (DEMO_MODE) return 'https://demo.url/' + path;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  // Delete file
  deleteFile: async (bucket, path) => {
    if (DEMO_MODE) return { error: null };

    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Upload avatar
  uploadAvatar: async (userId, file) => {
    const path = `avatars/${userId}-${Date.now()}.jpg`;
    const { data, error } = await storageService.uploadFile('avatars', path, file);
    
    if (error) return { data: null, error };

    const url = storageService.getPublicUrl('avatars', path);
    return { data: { path, url }, error: null };
  },

  // Upload post media
  uploadPostMedia: async (userId, file, index = 0) => {
    const path = `posts/${userId}/${Date.now()}-${index}.jpg`;
    const { data, error } = await storageService.uploadFile('posts', path, file);
    
    if (error) return { data: null, error };

    const url = storageService.getPublicUrl('posts', path);
    return { data: { path, url }, error: null };
  },
};

// ============================================
// POST SERVICES
// ============================================

export const postService = {
  // Create post
  createPost: async (userId, postData) => {
    if (DEMO_MODE) {
      return { data: { id: 'post-' + Date.now(), ...postData }, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          ...postData,
        })
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get posts (feed)
  getPosts: async (limit = 20, offset = 0) => {
    if (DEMO_MODE) return { data: [], error: null };

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:users(id, display_name, avatar_url, is_verified)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Like post
  likePost: async (userId, postId) => {
    if (DEMO_MODE) return { error: null };

    try {
      const { error } = await supabase
        .from('post_likes')
        .insert({ user_id: userId, post_id: postId });
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Unlike post
  unlikePost: async (userId, postId) => {
    if (DEMO_MODE) return { error: null };

    try {
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .match({ user_id: userId, post_id: postId });
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Add comment
  addComment: async (userId, postId, content) => {
    if (DEMO_MODE) {
      return { data: { id: 'comment-' + Date.now() }, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          user_id: userId,
          post_id: postId,
          content,
        })
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// ============================================
// MESSAGE SERVICES
// ============================================

export const messageService = {
  // Send message
  sendMessage: async (senderId, receiverId, content, messageType = 'text', mediaUrl = null) => {
    if (DEMO_MODE) {
      return { data: { id: 'msg-' + Date.now() }, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          message_type: messageType,
          media_url: mediaUrl,
        })
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get messages
  getMessages: async (userId, friendId) => {
    if (DEMO_MODE) return { data: [], error: null };

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .or(`sender_id.eq.${friendId},receiver_id.eq.${friendId}`)
        .order('created_at', { ascending: true });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Mark as read
  markAsRead: async (messageIds) => {
    if (DEMO_MODE) return { error: null };

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', messageIds);
      return { error };
    } catch (error) {
      return { error };
    }
  },
};

// ============================================
// SUBSCRIPTION SERVICES
// ============================================

export const subscriptionService = {
  // Subscribe to creator
  subscribe: async (subscriberId, creatorId, price) => {
    if (DEMO_MODE) {
      return { data: { id: 'sub-' + Date.now() }, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          subscriber_id: subscriberId,
          creator_id: creatorId,
          price,
          status: 'active',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Check subscription
  checkSubscription: async (subscriberId, creatorId) => {
    if (DEMO_MODE) return { data: null, error: null };

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .match({
          subscriber_id: subscriberId,
          creator_id: creatorId,
          status: 'active',
        })
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId) => {
    if (DEMO_MODE) return { error: null };

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);
      return { error };
    } catch (error) {
      return { error };
    }
  },
};

// ============================================
// LIVE STREAM SERVICES
// ============================================

export const liveStreamService = {
  // Create stream
  createStream: async (broadcasterId, streamData) => {
    if (DEMO_MODE) {
      return { data: { id: 'stream-' + Date.now() }, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('live_streams')
        .insert({
          broadcaster_id: broadcasterId,
          ...streamData,
          stream_key: 'sk_' + Date.now(),
          status: 'live',
        })
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get active streams
  getActiveStreams: async () => {
    if (DEMO_MODE) return { data: [], error: null };

    try {
      const { data, error } = await supabase
        .from('live_streams')
        .select(`
          *,
          broadcaster:users(id, display_name, avatar_url, is_verified)
        `)
        .eq('status', 'live')
        .order('started_at', { ascending: false });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // End stream
  endStream: async (streamId) => {
    if (DEMO_MODE) return { error: null };

    try {
      const { error } = await supabase
        .from('live_streams')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
        })
        .eq('id', streamId);
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Send gift
  sendGift: async (streamId, senderId, giftData) => {
    if (DEMO_MODE) return { data: {}, error: null };

    try {
      const { data, error } = await supabase
        .from('live_stream_gifts')
        .insert({
          stream_id: streamId,
          sender_id: senderId,
          ...giftData,
        })
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// ============================================
// TRANSACTION SERVICES
// ============================================

export const transactionService = {
  // Create transaction
  createTransaction: async (userId, transactionData) => {
    if (DEMO_MODE) {
      return { data: { id: 'tx-' + Date.now() }, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          ...transactionData,
          status: 'completed',
        })
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get transactions
  getTransactions: async (userId, limit = 50) => {
    if (DEMO_MODE) return { data: [], error: null };

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// ============================================
// CREATOR SERVICES
// ============================================

export const creatorService = {
  // Get all creators (for VideoMatch, LiveStream, etc.)
  getCreators: async (filters = {}) => {
    if (DEMO_MODE) {
      const { DEMO_CREATORS } = require('../data/demoData');
      return { data: DEMO_CREATORS, error: null };
    }

    try {
      let query = supabase
        .from('users')
        .select(`
          *,
          creator_profiles(*)
        `)
        .eq('is_creator', true);

      // Apply filters
      if (filters.country) {
        query = query.eq('country', filters.country);
      }
      if (filters.is_online !== undefined) {
        query = query.eq('is_online', filters.is_online);
      }
      if (filters.is_live !== undefined) {
        // Join with live_streams to check if live
        query = query.eq('is_live', filters.is_live);
      }
      if (filters.min_age) {
        query = query.gte('age', filters.min_age);
      }
      if (filters.max_age) {
        query = query.lte('age', filters.max_age);
      }
      if (filters.gender) {
        query = query.eq('gender', filters.gender);
      }

      // Order by
      const orderBy = filters.orderBy || 'created_at';
      query = query.order(orderBy, { ascending: false });

      // Limit
      const limit = filters.limit || 50;
      query = query.limit(limit);

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get creator profile with pricing
  getCreatorProfile: async (userId) => {
    if (DEMO_MODE) {
      const { getDemoCreator } = require('../data/demoData');
      return { data: getDemoCreator(userId), error: null };
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          creator_profiles(*)
        `)
        .eq('id', userId)
        .eq('is_creator', true)
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update creator pricing
  updateCreatorPricing: async (userId, pricingData) => {
    if (DEMO_MODE) return { data: pricingData, error: null };

    try {
      const { data, error } = await supabase
        .from('creator_profiles')
        .upsert({
          user_id: userId,
          ...pricingData,
        })
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Search creators
  searchCreators: async (searchTerm, filters = {}) => {
    if (DEMO_MODE) {
      const { DEMO_CREATORS } = require('../data/demoData');
      const filtered = DEMO_CREATORS.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return { data: filtered, error: null };
    }

    try {
      let query = supabase
        .from('users')
        .select(`
          *,
          creator_profiles(*)
        `)
        .eq('is_creator', true)
        .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`);

      if (filters.country) {
        query = query.eq('country', filters.country);
      }

      const { data, error } = await query.limit(20);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// ============================================
// VIDEO CALL SERVICES
// ============================================

export const videoCallService = {
  // Create video call
  createCall: async (callerId, receiverId, callType = 'private') => {
    if (DEMO_MODE) {
      return { data: { id: 'call-' + Date.now(), room_id: 'room-' + Date.now() }, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('video_calls')
        .insert({
          caller_id: callerId,
          receiver_id: receiverId,
          call_type: callType,
          room_id: 'room-' + Date.now(),
          status: 'calling',
        })
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Answer call
  answerCall: async (callId) => {
    if (DEMO_MODE) return { error: null };

    try {
      const { error } = await supabase
        .from('video_calls')
        .update({
          status: 'active',
          answered_at: new Date().toISOString(),
        })
        .eq('id', callId);
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // End call
  endCall: async (callId, durationSeconds) => {
    if (DEMO_MODE) return { error: null };

    try {
      const { error } = await supabase
        .from('video_calls')
        .update({
          status: 'ended',
          duration_seconds: durationSeconds,
          ended_at: new Date().toISOString(),
        })
        .eq('id', callId);
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Get call history
  getCallHistory: async (userId, limit = 50) => {
    if (DEMO_MODE) return { data: [], error: null };

    try {
      const { data, error } = await supabase
        .from('video_calls')
        .select(`
          *,
          caller:users!caller_id(*),
          receiver:users!receiver_id(*)
        `)
        .or(`caller_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('started_at', { ascending: false })
        .limit(limit);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// ============================================
// FOLLOW SERVICES
// ============================================

export const followService = {
  // Follow user
  followUser: async (followerId, followingId) => {
    if (DEMO_MODE) return { error: null };

    try {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: followerId, following_id: followingId });
      
      if (!error) {
        // Update follower counts
        await supabase.rpc('increment_follower_count', { user_id: followingId });
        await supabase.rpc('increment_following_count', { user_id: followerId });
      }
      
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Unfollow user
  unfollowUser: async (followerId, followingId) => {
    if (DEMO_MODE) return { error: null };

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .match({ follower_id: followerId, following_id: followingId });
      
      if (!error) {
        // Update follower counts
        await supabase.rpc('decrement_follower_count', { user_id: followingId });
        await supabase.rpc('decrement_following_count', { user_id: followerId });
      }
      
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Check if following
  isFollowing: async (followerId, followingId) => {
    if (DEMO_MODE) return { data: false, error: null };

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .match({ follower_id: followerId, following_id: followingId })
        .single();
      return { data: !!data, error: null };
    } catch (error) {
      return { data: false, error: null };
    }
  },

  // Get followers
  getFollowers: async (userId, limit = 50) => {
    if (DEMO_MODE) return { data: [], error: null };

    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower:users!follower_id(*)
        `)
        .eq('following_id', userId)
        .limit(limit);
      return { data: data?.map(f => f.follower) || [], error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get following
  getFollowing: async (userId, limit = 50) => {
    if (DEMO_MODE) return { data: [], error: null };

    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          following:users!following_id(*)
        `)
        .eq('follower_id', userId)
        .limit(limit);
      return { data: data?.map(f => f.following) || [], error };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// ============================================
// NOTIFICATION SERVICES
// ============================================

export const notificationService = {
  // Get notifications
  getNotifications: async (userId, limit = 50) => {
    if (DEMO_MODE) {
      const { DEMO_NOTIFICATIONS } = require('../data/demoData');
      return { data: DEMO_NOTIFICATIONS, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Mark as read
  markAsRead: async (notificationIds) => {
    if (DEMO_MODE) return { error: null };

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', notificationIds);
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Create notification
  createNotification: async (notificationData) => {
    if (DEMO_MODE) return { data: {}, error: null };

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },
};

export default {
  auth: authService,
  user: userService,
  storage: storageService,
  post: postService,
  message: messageService,
  subscription: subscriptionService,
  liveStream: liveStreamService,
  transaction: transactionService,
  creator: creatorService,
  videoCall: videoCallService,
  follow: followService,
  notification: notificationService,
};
