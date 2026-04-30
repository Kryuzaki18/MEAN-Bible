import textToSpeech from "@google-cloud/text-to-speech";
import "dotenv/config";

const client = new textToSpeech.TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS || "{}"),
  
});

export const speak = async (text: string): Promise<Buffer> => {
  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: {
      languageCode: "en-US",
      name: "en-US-Wavenet-D", 
    },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: 0.9
    },
  });

  return response.audioContent as Buffer;
};