import React, { useState } from 'react';
import Textarea from '@mui/joy/Textarea';
import Button from '@mui/joy/Button';
import Box from '@mui/joy/Box';
import { Send, HeadphonesOutlined } from '@mui/icons-material/';
import useSound from 'use-sound';
// import s from './audios/hell.mp3';
import Typography from '@mui/material/Typography';

function App() {
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState('');
  const [senderQuery, setSenderQuery] = useState('');
  const [audio, setAudio] = useState('');
  const [receiverQuery, setReceiverQuery] = useState('');
  const [conversation, setConversation] = useState([]);
  const [play] = useSound(audio);


  const handleSenderQueryChange = (e) => {
    setSenderQuery(e.target.value);
  };

  const handleReceiverQueryChange = (e) => {
    setReceiverQuery(e.target.value);
  };

  const generateSenderText = () => {
    setLoading(true);

    fetch(`http://127.0.0.1:8000/chat/message/${senderQuery}`, {
      method: 'GET',  
      headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Request failed');
        }
      })
      .then(data => {
        console.log('story: ', data);
        if (data) {
          setStory(data);
        }
      })
      .catch(err => {
          console.log(err);
      });

    setLoading(false);
  }

  const generateReceiverText = () => {
    setLoading(false);

    fetch(`http://127.0.0.1:8000/chat/message/${receiverQuery}`, {
      method: 'GET',  
      headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Request failed');
        }
      })
      .then(data => {
        console.log('story: ', data);
        if (data) {
          setStory(data);
        }
      })
      .catch(err => {
          console.log(err);
      });

    setLoading(false);
  }

  const generateAudio = () => {
    setLoading(true);
    console.log('audio about: ', story);

    fetch(`http://127.0.0.1:8000/voice_clone/${senderQuery}`, {
      method: 'GET',  
      headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Request failed');
        }
      })
      .then(data => {
        console.log('audio path: ', data);
        if (data) {
          setAudio(data);
        }
      })
      .catch(err => {
          console.log(err);
      });

    setLoading(false);

  }

  const fetchMicAudio = async (text) => {
    setLoading(true); // Assuming you want to set loading to true before making the fetch request
  
    try {
      const response = await fetch(`http://127.0.0.1:8000/voice_record`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Request failed'); // Handle non-2xx status codes as errors
      }
  
      const data = await response.json();
      console.log('audio path: ', data);
  
      if (data) {
        setAudio(data);
      }
  
      setLoading(false);
    } catch (err) {
      console.log('Error:', err); // Display or handle the error appropriately
      setLoading(false);
    }
  
    return text;
    };
  
  const handleSubmit = async (e) => {

    let flag =0;
    e.preventDefault();
    setLoading(true);
    // Simulate an API call or processing the message    
    await new Promise((resolve) => {
      setTimeout(() => {
        setLoading(false);
        if (senderQuery) {
          setStory(senderQuery);
          console.log("senderQuery = " + senderQuery)
          console.log("story = " + story);
  
          // Make fetchMicAudio synchronous by using await
          fetchMicAudio(senderQuery)
            .then(() => {
              if (flag === 0) {
                generateAudio();
                flag = flag + 1;
              } else if(flag === 1) {
                generateAudio();
              }
            })
            .catch((err) => {
              console.error(err);
            });
  
          setConversation([
            ...conversation,
            {
              sender: 'You',
              timestamp: new Date().toLocaleTimeString(),
              content: senderQuery,
            },
          ]);
  
          setSenderQuery('');
          generateSenderText();
        }
        if (receiverQuery) {
          setConversation([
            ...conversation,
            {
              sender: 'Receiver',
              timestamp: new Date().toLocaleTimeString(),
              content: receiverQuery,
            },
          ]);
  
          setReceiverQuery('');
          generateReceiverText();
        }
  
        resolve(); // Resolve the promise to indicate the async part is done
      }, 1000);
    });
  }


  return (
    <Box sx={{ marginTop: '32px', marginBottom: '32px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '100vh'}}>
      <Box sx={{ marginRight: '32px', width: '300px' }}>
        <Typography variant="h5" component="h5">
          Sender
        </Typography>
        <form onSubmit={handleSubmit}>
          <Textarea
            sx={{ width: '100%' }}
            onChange={handleSenderQueryChange}
            minRows={2}
            maxRows={4}
            placeholder="Type anything…"
            value={senderQuery} />
          <Button
            disabled={loading || senderQuery === ''}
            type='submit'
            sx={{ marginTop: '16px' }}
            loading={loading}>
            <Send />
          </Button>
        </form>
      </Box>
      
      {story && (
          <Box sx={{ width: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h5" component="h5">
            Receiver
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Textarea
              sx={{ width: '100%' }}
              onChange={handleReceiverQueryChange}
              minRows={2}
              maxRows={4}
              placeholder="Type anything…"
              value={receiverQuery}
            />
            <Button
              disabled={loading || receiverQuery === ''}
              type='submit'
              sx={{ marginTop: '16px' }}
              loading={loading}
            >
              <Send />
            </Button>
          </form>
          <Textarea
            sx={{ width: '100%', marginTop: '16px' }}
            value={story}
          />
          <Button
            loading={loading}
            sx={{ marginTop: '16px' }}
            onClick={audio ? play : generateAudio}
          >
            <HeadphonesOutlined />
          </Button>
        </Box>      
        )}

      <Box sx={{ width: '300px', marginLeft: '32px' }}>
        <Typography variant="h5" component="h5">
          Conversation
        </Typography>
        <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
          {conversation.map((message, index) => (
            <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: message.sender === 'You' ? 'flex-start' : 'flex-end' }}>
              <Typography variant="body2" sx={{ color: 'gray' }}>{message.sender} - {message.timestamp}</Typography>
              <Box sx={{ backgroundColor: message.sender === 'You' ? 'lightgray' : 'lightblue', padding: '8px', borderRadius: '8px', maxWidth: '80%' }}>
                {message.content}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default App;
