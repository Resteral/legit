'use server';

import { createClient } from '@/utils/supabase/server';

const DEBATE_TOPICS = [
  "Should AI replace human software developers?",
  "Is pineapple on pizza delicious or a culinary crime?",
  "Bitcoin vs. Gold: What is the ultimate store of value?",
  "PlayStation 5 vs. Xbox Series X: Which is the superior console?",
  "Are dogs better companions than cats?",
  "Is remote work superior to working in a physical office?",
  "Should college education be free for everyone?",
  "Should social media be banned for children under 16?",
  "Marvel vs. DC: Who has the better superhero universe?",
  "Is coffee better than tea?"
];

export async function findOrCreateDebateRoom() {
  const supabase = await createClient();

  // 1. Look for an active room created in the last 5 minutes that has fewer than 2 distinct senders
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  
  const { data: activeRooms, error: roomsErr } = await supabase
    .from('debate_rooms')
    .select('id, topic')
    .eq('status', 'active')
    .gt('created_at', fiveMinutesAgo)
    .order('created_at', { ascending: false });

  if (roomsErr) {
    console.error('Error finding rooms:', roomsErr);
  }

  if (activeRooms && activeRooms.length > 0) {
    for (const room of activeRooms) {
      // Count messages in this room to check if there's already 2 debaters
      const { data: messages } = await supabase
        .from('debate_messages')
        .select('sender')
        .eq('room_id', room.id);

      const uniqueSenders = new Set(messages?.map(m => m.sender) || []);
      
      // If there's 1 sender, we can join as User2!
      if (uniqueSenders.size === 1) {
        return { 
          roomId: room.id, 
          topic: room.topic, 
          role: 'User2' // The second joiner is User2
        };
      }
    }
  }

  // 2. If no available room found, create a new one with a random topic!
  const randomTopic = DEBATE_TOPICS[Math.floor(Math.random() * DEBATE_TOPICS.length)];
  
  const { data: newRoom, error: createErr } = await supabase
    .from('debate_rooms')
    .insert([{ topic: randomTopic, status: 'active' }])
    .select('id, topic')
    .single();

  if (createErr) {
    console.error('Error creating debate room:', createErr);
    return { error: 'Failed to create room' };
  }

  return {
    roomId: newRoom.id,
    topic: newRoom.topic,
    role: 'User1' // The creator is User1
  };
}

export async function sendDebateMessage(roomId: string, sender: string, content: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('debate_messages')
    .insert([
      {
        room_id: roomId,
        sender,
        content
      }
    ]);

  if (error) {
    console.error('Error sending debate message:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function fetchDebateMessages(roomId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('debate_messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching debate messages:', error);
    return [];
  }

  return data || [];
}
