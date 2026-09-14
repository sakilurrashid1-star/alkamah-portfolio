import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json({limit:'100kb'}));

const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

app.get('/health', (_req,res)=>res.json({ok:true,service:'aethermind-ai-gateway'}));

app.post('/api/ask', async (req,res)=>{
  try {
    const {message,state={}} = req.body || {};
    if(!message) return res.status(400).json({error:'message is required'});
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      instructions: 'You are AetherMind, an explainable decision-intelligence copilot. Never claim certainty or predict the future. Use the supplied state as illustrative simulation inputs. Give concise, practical reasoning. Surface trade-offs, assumptions and one way to test the recommendation.',
      input: `User question: ${message}\nSimulation state: ${JSON.stringify(state)}`
    });
    res.json({answer:response.output_text});
  } catch (error) {
    console.error(error);
    res.status(500).json({error:'AI gateway failed'});
  }
});

const port = process.env.PORT || 8787;
app.listen(port,()=>console.log(`AetherMind gateway listening on ${port}`));
