import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

type DogStatus = 'inside' | 'outside';

interface StatusRecord {
  id: string;
  status: DogStatus;
  updated_at: string;
}

function App() {
  const [status, setStatus] = useState<DogStatus>('inside');
  const [recordId, setRecordId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();

    // Supabase Realtime: update UI when status changes from another client/tab
    const cleanupRealtime = subscribeToChanges();

    // Polling fallback: ensures updates show even if Realtime isn't enabled for the table
    const pollInterval = setInterval(fetchStatus, 1000);

    return () => {
      cleanupRealtime();
      clearInterval(pollInterval);
    };
  }, []);

  const fetchStatus = async () => {
    const { data, error } = await supabase
      .from('dog_status')
      .select('id, status, updated_at')
      .maybeSingle();

    if (error) {
      console.error('Error fetching status:', error);
      return;
    }

    if (data) {
      setStatus(data.status);
      setRecordId(data.id);
    }
    setLoading(false);
  };

  const subscribeToChanges = () => {
    const channel = supabase
      .channel('dog_status_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'dog_status',
        },
        (payload) => {
          const newRecord = payload.new as StatusRecord;
          setStatus(newRecord.status);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const toggleStatus = async () => {
    const newStatus: DogStatus = status === 'inside' ? 'outside' : 'inside';

    const { error } = await supabase
      .from('dog_status')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', recordId);

    if (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <p className="text-2xl text-gray-600">Loading...</p>
      </div>
    );
  }

  const isOutside = status === 'outside';
  const bgColor = isOutside ? 'bg-red-500' : 'bg-green-500';
  const message = isOutside
    ? '🐕 The dog is outside! Please be careful'
    : '✅ The dog is inside!';

  return (
    <div
      className={`min-h-screen ${bgColor} flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 select-none`}
      onClick={toggleStatus}
    >
      <p className="text-white text-3xl md:text-5xl font-bold text-center px-8">
        {message}
      </p>
      <p className="text-white text-lg md:text-xl mt-8 opacity-80">
        Tap anywhere to toggle
      </p>
    </div>
  );
}

export default App;
