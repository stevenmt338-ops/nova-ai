import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Increase payload limits for base64 images and audio uploads
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Initialize GoogleGenAI client according to instructions
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for unique request IDs
const generateRequestId = () => `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

// -------------------------------------------------------------
// Health & Provider Diagnostics Endpoint
// -------------------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'online',
    product: 'NOVA AI',
    version: '1.0.0',
    hasApiKey: hasKey,
    defaultModel: 'gemini-3.8-flash',
    supportedModels: {
      chat: ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-4-argon'],
      images: ['gemini-3.1-flash-lite-image', 'gemini-nano-banana-2.1'],
      tts: ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts'],
      transcribe: ['gemini-3.5-transcribe'],
      video: ['gemini-omni-1.2-flash (Interactions API / Paid Tier)'],
    },
    capabilities: [
      'multimodal_chat',
      'deep_thinking',
      'search_grounding',
      'image_generation',
      'image_editing',
      'speech_transcription',
      'voice_synthesis_tts',
      'multi_agent_pipeline',
      'code_sandbox',
      'deep_research',
    ],
  });
});

// -------------------------------------------------------------
// Chat & Multimodal Streaming / Unary Endpoint
// -------------------------------------------------------------
app.post('/api/chat', async (req: Request, res: Response) => {
  const reqId = generateRequestId();
  let targetModel = 'gemini-3.1-flash-lite';
  let contents: any[] = [];
  let config: any = {};
  let clientDisconnected = false;

  res.on('close', () => {
    if (!res.writableEnded) {
      clientDisconnected = true;
    }
  });

  try {
    const {
      prompt,
      messages = [],
      model = 'gemini-3.1-flash-lite',
      thinkingLevel,
      enableSearch = false,
      attachments = [], // [{ mimeType, data }]
      systemInstruction,
      stream = true,
    } = req.body;

    if (!prompt && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: 'الرسالة أو المرفق مطلوب لبدء المحادثة', requestId: reqId });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'لم يتم العثور على مفتاح GEMINI_API_KEY في بيئة التشغيل. يرجى إعداده في لوحة Secrets.',
        code: 'MISSING_API_KEY',
        requestId: reqId,
      });
    }

    // Determine target model (Fast Flash Lite by default for high throughput)
    targetModel = model;
    if (!['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-4-argon'].includes(targetModel)) {
      targetModel = 'gemini-3.1-flash-lite';
    }

    // Construct tools
    const tools: any[] = [];
    if (enableSearch) {
      tools.push({ googleSearch: {} });
    }

    // Configure thinking only for models that support it
    let thinkingConfig: any = undefined;
    if (thinkingLevel && (targetModel === 'gemini-3.8-flash' || targetModel === 'gemini-4-argon')) {
      if (thinkingLevel === 'HIGH') thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      else if (thinkingLevel === 'LOW') thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
      else thinkingConfig = { thinkingLevel: ThinkingLevel.MEDIUM };
    }

    // Prepare contents: Window history to last 8 messages to reduce token lag
    const currentParts: any[] = [];
    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        if (att.data && att.mimeType) {
          const cleanBase64 = att.data.replace(/^data:[^;]+;base64,/, '');
          currentParts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: cleanBase64,
            },
          });
        }
      }
    }
    if (prompt) {
      currentParts.push({ text: prompt });
    }

    contents = [];
    // Only send the last 8 messages and cap history turn lengths to prevent high latency
    const recentMessages = Array.isArray(messages) ? messages.slice(-8) : [];
    for (const m of recentMessages) {
      if (m && m.content) {
        const textVal = typeof m.content === 'string' ? m.content : '';
        // Trim oversized history items to prevent sluggish multi-thousand-token roundtrips
        const cappedText = textVal.length > 1500 ? textVal.slice(0, 1500) + '...' : textVal;
        contents.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: cappedText }],
        });
      }
    }
    contents.push({ role: 'user', parts: currentParts });

    config = {};
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    } else {
      config.systemInstruction = `أنت NOVA AI — مساعد ذكاء اصطناعي فائق السرعة، ذكي، دقيق وودود.
شعارك: "ذكاء واحد. إمكانيات بلا حدود."
- أجب فورياً بدقة وإيجاز باللغة العربية الفصحى الجميلة والواضحة (أو بلغة السائل).
- استخدم تنسيق Markdown أنيق، عناوين واضحة، وأكواد منسقة عند الطلب.
- لا تختلق معلومات أو روابط غير مؤكدة.`;
    }

    if (tools.length > 0) {
      config.tools = tools;
    }
    if (thinkingConfig) {
      config.thinkingConfig = thinkingConfig;
    }

    if (stream) {
      // Set SSE headers and flush them immediately for zero-delay TTFT
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders?.();

      const responseStream = await ai.models.generateContentStream({
        model: targetModel,
        contents,
        config,
      });

      let fullText = '';
      let groundingSources: any[] = [];

      for await (const chunk of responseStream) {
        if (clientDisconnected) {
          break;
        }

        const chunkText = chunk.text || '';
        fullText += chunkText;

        const chunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks && chunks.length > 0) {
          groundingSources = chunks.map((c: any) => ({
            uri: c.web?.uri || '',
            title: c.web?.title || c.web?.uri || 'مصدر خارجي',
          })).filter((s: any) => s.uri);
        }

        const payload = JSON.stringify({
          text: chunkText,
          sources: groundingSources,
        });
        res.write(`data: ${payload}\n\n`);
      }

      if (!clientDisconnected) {
        res.write(`data: [DONE]\n\n`);
      }
      return res.end();
    } else {
      // Unary generation
      const response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config,
      });

      const extractedText = response.text || '';
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks.map((c: any) => ({
        uri: c.web?.uri || '',
        title: c.web?.title || c.web?.uri || 'مصدر خارجي',
      })).filter((s: any) => s.uri);

      return res.json({
        text: extractedText,
        model: targetModel,
        sources,
        requestId: reqId,
      });
    }
  } catch (error: any) {
    // Helper to clean error message
    let friendlyMsg = error?.message || 'حدث خطأ أثناء معالجة الطلب عبر النموذج.';
    try {
      if (typeof friendlyMsg === 'string' && friendlyMsg.startsWith('{')) {
        const parsedErr = JSON.parse(friendlyMsg);
        if (parsedErr?.error?.message) {
          friendlyMsg = parsedErr.error.message;
        }
      }
    } catch (_) {}

    // If 503 UNAVAILABLE / high demand or 429, try resilient fallback to gemini-3.1-flash-lite if targetModel was gemini-3.8-flash
    if (
      (error?.status === 503 || friendlyMsg.includes('high demand') || friendlyMsg.includes('UNAVAILABLE')) &&
      targetModel === 'gemini-3.8-flash' &&
      !res.headersSent
    ) {
      try {
        console.log(`[NOVA AI] Fallback from ${targetModel} to gemini-3.1-flash-lite due to temporary demand spike`);
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents,
          config: {
            systemInstruction: config.systemInstruction,
          },
        });
        const extractedText = fallbackResponse.text || '';
        return res.json({
          text: extractedText,
          model: 'gemini-3.1-flash-lite (وضع السرعة البديل)',
          sources: [],
          requestId: reqId,
        });
      } catch (fallbackErr: any) {
        console.error('Fallback failed:', fallbackErr);
      }
    }

    const statusCode = error?.status === 429 ? 429 : 500;
    if (!res.headersSent) {
      return res.status(statusCode).json({
        error: friendlyMsg,
        code: error?.status === 429 ? 'QUOTA_EXCEEDED' : 'API_ERROR',
        requestId: reqId,
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: friendlyMsg })}\n\n`);
      return res.end();
    }
  }
});

// -------------------------------------------------------------
// NOVA IMAGINE — Text to Image & Image to Image Endpoint
// -------------------------------------------------------------
app.post('/api/images/generate', async (req: Request, res: Response) => {
  const reqId = generateRequestId();
  try {
    const {
      prompt,
      aspectRatio = '1:1',
      style = 'none',
      referenceImage, // Base64 if image-to-image
      quality = 'standard', // 'standard' -> gemini-3.1-flash-lite-image, 'hd' -> gemini-nano-banana-2.1
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required', requestId: reqId });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'مفتاح GEMINI_API_KEY غير متوفر.',
        code: 'MISSING_API_KEY',
        requestId: reqId,
      });
    }

    // Enhance prompt with visual art direction if style is provided
    let enhancedPrompt = prompt;
    if (style === 'cinematic') {
      enhancedPrompt += ', cinematic lighting, anamorphic lens, 8k, dramatic atmosphere, photorealistic, intricate depth of field';
    } else if (style === 'photorealistic') {
      enhancedPrompt += ', high resolution studio photography, 50mm lens, soft natural lighting, hyperrealistic textures, authentic details';
    } else if (style === 'scifi') {
      enhancedPrompt += ', futuristic cyberpunk neon aesthetics, sleek technology, glowing conduits, deep space ambient, high tech';
    } else if (style === 'artistic') {
      enhancedPrompt += ', masterclass digital oil painting style, expressive brushstrokes, dynamic composition, vibrant palette';
    } else if (style === 'anime') {
      enhancedPrompt += ', modern high-end anime aesthetic, Makoto Shinkai lighting, clean outlines, rich vibrant colors';
    } else if (style === '3d') {
      enhancedPrompt += ', 3D Pixar & Octane Render style, smooth clay textures, volumetric soft shadows, delightful lighting';
    }

    const validAspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
    const selectedRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    const modelToUse = quality === 'hd' ? 'gemini-nano-banana-2.1' : 'gemini-3.1-flash-lite-image';

    const parts: any[] = [];
    if (referenceImage) {
      const cleanData = referenceImage.replace(/^data:[^;]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: cleanData,
        },
      });
    }
    parts.push({ text: enhancedPrompt });

    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: selectedRatio,
          ...(modelToUse === 'gemini-nano-banana-2.1' ? { imageSize: '1K' } : {}),
        },
      },
    });

    let imageUrl: string | null = null;
    let descriptionText = '';

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || 'image/png';
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
      } else if (part.text) {
        descriptionText += part.text;
      }
    }

    if (!imageUrl) {
      return res.status(422).json({
        error: 'لم يرجع النموذج صورة صالحة. قد يكون السبب تقييدات السلامة أو المحتوى المطلوب.',
        details: descriptionText,
        requestId: reqId,
      });
    }

    return res.json({
      imageUrl,
      model: modelToUse,
      aspectRatio: selectedRatio,
      prompt: enhancedPrompt,
      notes: descriptionText,
      createdAt: new Date().toISOString(),
      requestId: reqId,
    });
  } catch (error: any) {
    console.error(`[/api/images/generate error ${reqId}]:`, error);
    return res.status(error?.status === 429 ? 429 : 500).json({
      error: error?.message || 'تعذر توليد الصورة عبر النموذج.',
      code: error?.status === 429 ? 'QUOTA_EXCEEDED' : 'IMAGE_GEN_ERROR',
      requestId: reqId,
    });
  }
});

// -------------------------------------------------------------
// NOVA VOICE — Speech-to-Text (STT) via gemini-3.5-transcribe
// -------------------------------------------------------------
app.post('/api/audio/transcribe', async (req: Request, res: Response) => {
  const reqId = generateRequestId();
  try {
    const { audioData, mimeType = 'audio/webm' } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required', requestId: reqId });
    }

    const cleanBase64 = audioData.replace(/^data:[^;]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: 'قم بتفريغ هذا التسجيل الصوتي بدقة تامة. ثم في النهاية ضع ملخصاً تنفيذياً في 3 نقاط رئيسية إن كان المحتوى حديثاً أو اجتماعاً.',
          },
        ],
      },
    });

    const fullResult = response.text || '';
    return res.json({
      transcription: fullResult,
      model: 'gemini-3.5-transcribe',
      requestId: reqId,
    });
  } catch (error: any) {
    console.error(`[/api/audio/transcribe error ${reqId}]:`, error);
    return res.status(500).json({
      error: error?.message || 'تعذر تفريغ الصوت عبر النموذج.',
      requestId: reqId,
    });
  }
});

// -------------------------------------------------------------
// NOVA VOICE — Text-to-Speech (TTS) via gemini-3.8-flash-lite-tts
// -------------------------------------------------------------
app.post('/api/audio/speech', async (req: Request, res: Response) => {
  const reqId = generateRequestId();
  try {
    const {
      text,
      voiceName = 'Kore', // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
      style = 'Clear, articulate, natural friendly voice',
    } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS', requestId: reqId });
    }

    const validVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
    const chosenVoice = validVoices.includes(voiceName) ? voiceName : 'Kore';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 1000), // safety ceiling for single unary audio
              speechMetadata: {
                style,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: chosenVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'لم يتم استرجاع بيانات الصوت من المزود.', requestId: reqId });
    }

    // Unary output is a standard WAV file with 44-byte RIFF header (audio/wav, 24kHz mono 16-bit)
    const audioDataUrl = `data:audio/wav;base64,${base64Audio}`;

    return res.json({
      audioUrl: audioDataUrl,
      voice: chosenVoice,
      model: 'gemini-3.8-flash-lite-tts',
      requestId: reqId,
    });
  } catch (error: any) {
    console.error(`[/api/audio/speech error ${reqId}]:`, error);
    return res.status(500).json({
      error: error?.message || 'تعذر تحويل النص إلى كلام.',
      requestId: reqId,
    });
  }
});

// -------------------------------------------------------------
// NOVA SEARCH & DEEP RESEARCH Endpoint
// -------------------------------------------------------------
app.post('/api/search', async (req: Request, res: Response) => {
  const reqId = generateRequestId();
  try {
    const { query, isDeep = false } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required', requestId: reqId });
    }

    let prompt = query;
    if (isDeep) {
      prompt = `قم بإجراء بحث عميق وشامل ودقيق حول الموضوع التالي:
"${query}"

المطلوب إعداد تقرير استقصائي متكامل يتضمن:
1. الملخص التنفيذي
2. الحقائق والبيانات المؤكدة مع الإشارة إلى التواريخ والمصادر الحقيقية
3. تحليل الزوايا والآراء المختلفة (مع التمييز بين الحقائق والآراء)
4. التطورات والاتجاهات الحديثة
5. الخلاصة والتوصيات العملية

استخدم بحث Google Grounding الحقيقي للتحقق من أحدث الروابط والمعلومات.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const resultText = response.text || '';
    const groundingChunks = response.candidates?.[0]?.content ? response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] : [];
    const sources = groundingChunks.map((c: any) => ({
      uri: c.web?.uri || '',
      title: c.web?.title || c.web?.uri || 'مصدر خارجي',
    })).filter((s: any) => s.uri);

    return res.json({
      content: resultText,
      sources,
      isDeep,
      query,
      model: 'gemini-3.8-flash',
      requestId: reqId,
    });
  } catch (error: any) {
    console.error(`[/api/search error ${reqId}]:`, error);
    let cleanError = error?.message || 'تعذر إتمام البحث عبر الإنترنت.';
    try {
      if (typeof cleanError === 'string' && cleanError.startsWith('{')) {
        const parsed = JSON.parse(cleanError);
        if (parsed?.error?.message) {
          cleanError = parsed.error.message;
        }
      }
    } catch (_) {}

    return res.status(error?.status === 429 ? 429 : 500).json({
      error: cleanError,
      code: error?.status === 429 ? 'QUOTA_EXCEEDED' : 'SEARCH_ERROR',
      requestId: reqId,
    });
  }
});

// -------------------------------------------------------------
// NOVA MOTION — Video Storyboard & Synthesis Director
// -------------------------------------------------------------
app.post('/api/video/storyboard', async (req: Request, res: Response) => {
  const reqId = generateRequestId();
  try {
    const { idea, duration = '5s', ratio = '16:9', motion = 'cinematic_pan' } = req.body;
    if (!idea) {
      return res.status(400).json({ error: 'Idea is required', requestId: reqId });
    }

    const prompt = `أنت مخرج فيديو ذكاء اصطناعي سينمائي (NOVA Motion Director).
الفكرة المطلوبة: "${idea}"
المدة: ${duration}
نسبة الأبعاد: ${ratio}
حركة الكاميرا المفضلة: ${motion}

المطلوب:
1. توليد سيناريو دقيق مشهد بمشهد (Storyboard) مقسم إلى 3 مشاهد متناسقة.
2. لكل مشهد حدد:
   - رقم المشهد والمدة
   - الوصف البصري الكامل (Visual prompt)
   - حركة الكاميرا الدقيقة (Camera movement)
   - المؤثرات الصوتية والموسيقى التصويرية (Audio/SFX)
3. التوجيه النهائي للنموذج المولد (Render prompt) المتوافق مع محركات الفيديو التوليدية مثل Veo وOmni.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      storyboard: response.text || '',
      idea,
      duration,
      ratio,
      motion,
      status: 'ready',
      renderProviderStatus: 'Google Veo / Gemini Omni Flash جاهز للربط عبر مفتاح فوترة مخصص.',
      requestId: reqId,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'تعذر إنشاء سيناريو الفيديو.',
      requestId: reqId,
    });
  }
});

// -------------------------------------------------------------
// NOVA TEAM — Multi-Agent Collaborative Pipeline
// -------------------------------------------------------------
app.post('/api/agents/run', async (req: Request, res: Response) => {
  const reqId = generateRequestId();
  try {
    const { mission } = req.body;
    if (!mission) {
      return res.status(400).json({ error: 'Mission description is required', requestId: reqId });
    }

    const prompt = `أنت منسق فريق الذكاء الاصطناعي متكامل الأدوار (NOVA TEAM Coordinator).
المهمة الموكلة للفريق:
"${mission}"

قم بمحاكاة وتوليد مخرجات كل وكيل بدقة وعمق تسلسلياً:
1. 🧭 المخطط (Planner): يحلل المهمة ويقسمها إلى مراحل تنفيذية واضحة ومقاييس نجاح.
2. 🔍 الباحث (Researcher): يجمع المعارف والحقائق والأدوات والبيانات المطلوبة للحل.
3. 📊 المحلل (Analyst): يقيم المخاطر، والبدائل، ودراسة الجدوى الفنية.
4. 🎨 المنشئ (Creator): يبني مسودة الحل الشاملة بتفاصيل دقيقة وعملية.
5. 🔎 المراجع (Reviewer): يدقق الجودة، ويكتشف الثغرات، ويقدم تنقيحات صارمة.
6. ⚡ المنسق (Coordinator): يجمع النتائج في صيغة نهائية جاهزة للاستخدام الفوري.

نسق الإجابة بوضوح مع تمييز عنوان كل وكيل بوضوح.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      mission,
      workflowOutput: response.text || '',
      agents: [
        { id: 'planner', name: 'المخطط', role: 'Planner', status: 'completed' },
        { id: 'researcher', name: 'الباحث', role: 'Researcher', status: 'completed' },
        { id: 'analyst', name: 'المحلل', role: 'Analyst', status: 'completed' },
        { id: 'creator', name: 'المنشئ', role: 'Creator', status: 'completed' },
        { id: 'reviewer', name: 'المراجع', role: 'Reviewer', status: 'completed' },
        { id: 'coordinator', name: 'المنسق', role: 'Coordinator', status: 'completed' },
      ],
      completedAt: new Date().toISOString(),
      requestId: reqId,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'تعذر تشغيل فريق الوكلاء.',
      requestId: reqId,
    });
  }
});

// -------------------------------------------------------------
// NOVA STUDIO — Code Generation & Live Sandbox Sandbox Engine
// -------------------------------------------------------------
app.post('/api/studio/generate', async (req: Request, res: Response) => {
  const reqId = generateRequestId();
  try {
    const { prompt, existingCode } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required', requestId: reqId });
    }

    const systemPrompt = `أنت NOVA STUDIO المبرمج الخبير في إنشاء تطبيقات وواجهات الويب التفاعلية.
عندما يطلب المستخدم إنشاء تطبيق أو أداة أو واجهة:
- أنشئ كود HTML كامل مع JavaScript وCSS (مدمج أو Tailwind CDN) يعمل مباشرة بنسبة 100% داخل iframe معزول.
- يجب أن تكون الواجهة جميلة وعصرية ومصممة بألوان أنيقة وبنفسجية متناسقة.
- يجب أن تكون تفاعلية بالكامل، وتعمل فور التحميل.
- أرجع فقط كود الـ HTML الكامل داخل وسم \`\`\`html ... \`\`\` بدون كلام جانبي يفسد الكود.`;

    const contents = existingCode
      ? `الكود الحالي:\n${existingCode}\n\nالتعديل المطلوب:\n${prompt}`
      : `قم بإنشاء التطبيق التالي:\n${prompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const raw = response.text || '';
    // Extract html block if enclosed in markdown
    const codeMatch = raw.match(/```(?:html)?([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1].trim() : raw.trim();

    return res.json({
      code,
      prompt,
      model: 'gemini-3.8-flash',
      requestId: reqId,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'تعذر توليد الكود البرمجي.',
      requestId: reqId,
    });
  }
});

// -------------------------------------------------------------
// Client Serving (Vite middleware in dev, static dist in prod)
// -------------------------------------------------------------
async function setupServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NOVA AI] Server running on http://0.0.0.0:${PORT} (Production: ${isProd})`);
  });
}

setupServer().catch((err) => {
  console.error('[NOVA AI] Failed to start server:', err);
  process.exit(1);
});
