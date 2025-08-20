import { supabase } from '../lib/supabase';

export const testRealtimeConnection = () => {
  console.log('🧪 Testing real-time connection...');
  
  const channel = supabase.channel('test-channel');
  
  channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
      console.log('✅ Real-time working! Received:', payload);
    })
    .subscribe((status) => {
      console.log('📡 Test subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Successfully subscribed to real-time events');
        
        // Test by inserting a dummy task
        setTimeout(async () => {
          console.log('🧪 Creating test task to trigger real-time event...');
          
          // First get a valid column ID
          const { data: columns } = await supabase.from('columns').select('id').limit(1);
          const columnId = columns?.[0]?.id;
          
          if (!columnId) {
            console.error('❌ No columns found to test with');
            return;
          }
          
          const { error } = await supabase
            .from('tasks')
            .insert({
              title: 'Real-time Test Task',
              description: 'This is a test task to verify real-time functionality',
              priority: 'low',
              column_id: columnId,
              order: 999
            });
            
          if (error) {
            console.error('❌ Failed to create test task:', error);
          } else {
            console.log('✅ Test task created, should trigger real-time event');
            
            // Clean up the test task after 5 seconds
            setTimeout(async () => {
              await supabase
                .from('tasks')
                .delete()
                .eq('title', 'Real-time Test Task');
              console.log('🧹 Cleaned up test task');
            }, 5000);
          }
        }, 2000);
      }
    });
    
  // Clean up after 30 seconds
  setTimeout(() => {
    supabase.removeChannel(channel);
    console.log('🧹 Cleaned up test channel');
  }, 30000);
};

export const checkSupabaseConfig = async () => {
  console.log('🔍 Checking Supabase configuration...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('tasks').select('count').single();
    if (error) {
      console.error('❌ Basic connection failed:', error);
      return false;
    }
    
    console.log('✅ Basic connection working');
    
    // Test real-time
    testRealtimeConnection();
    
    return true;
  } catch (error) {
    console.error('❌ Supabase configuration error:', error);
    return false;
  }
};