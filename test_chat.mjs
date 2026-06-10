import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wsnsbnhmsggkfbulkcyz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzbnNibmhtc2dna2ZidWxrY3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMjA0NDcsImV4cCI6MjA5NjU5NjQ0N30.z09VHmWijkO9nCVoNhSyuYzvs6N-Hr1J86U7-JeaYEs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
  console.log('Signing up a test user...');
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'aryan_test_12345@gmail.com',
    password: 'Password123!',
    options: {
      data: {
        full_name: 'Test Agent'
      }
    }
  });

  if (authError) {
    console.error('Auth Error:', authError.message);
    // If user already exists, let's try to sign in
    if (authError.message.includes('already registered')) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: 'aryan_test_12345@gmail.com',
            password: 'Password123!'
        });
        if (signInError) {
            console.error('SignIn Error:', signInError.message);
            return;
        }
        console.log('Signed in successfully.');
    } else {
        return;
    }
  } else {
      console.log('Signed up successfully.');
  }

  // Get the session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
      console.error('No session found');
      return;
  }

  console.log('Testing /api/chat with user session...');
  
  const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Cookie': `sb-wsnsbnhmsggkfbulkcyz-auth-token=${encodeURIComponent(JSON.stringify([session.access_token, session.refresh_token, null, null, null]))}`
      },
      body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello' }]
      })
  });

  const text = await res.text();
  console.log('Response status:', res.status);
  console.log('Response body:', text);
}

runTest();
