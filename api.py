from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
# import cohere
from elevenlabs import generate, play, set_api_key, clone
import requests
import openai
import logging
import os
import sounddevice as sd
from scipy.io.wavfile import write
import wavio as wv

app = FastAPI()

origins = ['http://localhost:3000/']  # put your frontend url here

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

AUDIOS_PATH = "../frontend/src/audios/"
AUDIO_PATH = "/audios/"
print("Hey man... what's up")

@app.get("/voice_clone/{query}")
async def voice_clone(query: str):
    print("Inside clone voice")
    set_api_key("81b1a53dc85b0288b99dbfec258deb46")
    audio_path = f'{AUDIOS_PATH}{query[:5]}.mp3'
    file_path = f'{AUDIO_PATH}{query[:5]}.mp3'

    # voice = clone(
    #     name="Alex",
    #     description="An indian person", # Optional
    #     files=["raksha_sample_recording.mp3"]
    #     )
    
    # audio = generate(text=query, voice=voice)
    audio = generate(text=query, voice="Bella", model="eleven_monolingual_v1")
    play(audio)
    try:
        with open(audio_path, 'wb') as f:
            f.write(audio)
        return file_path

    except Exception as e:
        logging.error("here we are")
        print(e)

        return ""

@app.post("/voice_record")
def voice_record():
    
    set_api_key("81b1a53dc85b0288b99dbfec258deb46")
   
    # voice = clone(
    # name="Alex",
    # description="An indian person", # Optional
    # files=["raksha_sample_recording.mp3"]
    # )
    
    audio = generate(text=f'Hey, you just received a message! Do you want me to read out loud?', voice="Bella", model="eleven_monolingual_v1")
    play(audio)

    # Sampling frequency
    freq = 44100
    
    # Recording duration
    duration = 3
    
    # Start recorder with the given values
    # of duration and sample frequency
    recording = sd.rec(int(duration * freq),
                    samplerate=freq, channels=1)
    
    # Record audio for the given number of seconds
    sd.wait()
    
    # This will convert the NumPy array to an audio
    # file with the given sampling frequency
    # write("recording0.wav", freq, recording)
    
    # Convert the NumPy array to audio file
    wv.write("recording1.wav", recording, freq, sampwidth=2)

    openai.api_key = "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"
    audio_file= open("recording1.wav", "rb")
    transcript = openai.Audio.transcribe("whisper-1", audio_file)

    return transcript

@app.get("/chat/message/{query}")
def text_message(query: str):
    # openai.api_key = "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"  # put your API key here

    # try:
    #     response = openai.ChatCompletion.create(
    #         model="gpt-3.5-turbo",
    #         messages=[
    #             {"role": "user", "content": query}
    #         ]
    #     )
    return query
    # return response['choices'][0]['message']['content']

    # except Exception as e:
    #     print(e)

    #     return ""

if __name__ == "__main__":
    port = os.getenv("PORT")
    if not port:
        port = 8080
    uvicorn.run(app, host="0.0.0.0", port=8080) 