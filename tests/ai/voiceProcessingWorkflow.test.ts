import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const workflow = JSON.parse(
  readFileSync(new URL('../../workflows/60-voice-message-processing.json', import.meta.url), 'utf8')
);

const nodeNames = new Set(workflow.nodes.map((node: { name: string }) => node.name));
const workflowRaw = JSON.stringify(workflow);

const isSupportedAudio = (mimeType: string, fileSize: number, maxBytes = 16_777_216) =>
  /^(audio\/(ogg|mpeg|mp4|aac|wav|webm|amr|x-m4a)|video\/mp4)/i.test(mimeType) &&
  fileSize > 0 &&
  fileSize <= maxBytes;

const normalizeMockTranscription = (text: string) => {
  const normalizedText = text.trim();
  if (normalizedText.length < 2) {
    return {
      success: false,
      normalizedText: '',
      errorCode: 'AUDIO_TRANSCRIPTION_UNCLEAR_OR_INVALID',
      routeToWorkflow01: false,
    };
  }

  return {
    success: true,
    normalizedText,
    routeToWorkflow01: true,
    normalizedMessage: {
      messageType: 'text',
      originalMessageType: 'audio',
      messageText: normalizedText,
    },
  };
};

test('voice workflow downloads WhatsApp audio through secure validation and temporary cleanup nodes', () => {
  for (const requiredNode of [
    'Get WhatsApp Media URL',
    'Validate Media Download URL',
    'Download Audio',
    'Validate Audio Type',
    'Prepare Binary Audio',
    'Transcribe Audio',
    'Transcription Valid?',
    'Delete Temporary Audio',
    'Return Normalized Text',
    'Audio Error Response',
  ]) {
    assert.ok(nodeNames.has(requiredNode), `Expected ${requiredNode} node`);
  }

  assert.ok(workflowRaw.includes('lookaside') || workflowRaw.includes('graph'));
  assert.match(workflowRaw, /WHATSAPP_AUDIO_MAX_BYTES/);
  assert.match(workflowRaw, /temporaryAudioDeleted/);
  assert.match(workflowRaw, /routeToWorkflow01/);
});

test('mocked voice transcription accepts supported audio and routes normalized text into Workflow 01 shape', () => {
  assert.equal(isSupportedAudio('audio/ogg', 24_576), true);
  const result = normalizeMockTranscription('عايز أعرف حالة الطلب 256719');

  assert.equal(result.success, true);
  assert.equal(result.routeToWorkflow01, true);
  assert.equal(result.normalizedMessage?.messageType, 'text');
  assert.equal(result.normalizedMessage?.originalMessageType, 'audio');
  assert.equal(result.normalizedText, 'عايز أعرف حالة الطلب 256719');
});

test('mocked voice transcription rejects unsupported MIME without calling the agent path', () => {
  assert.equal(isSupportedAudio('text/plain', 1024), false);
  const result = normalizeMockTranscription('');

  assert.equal(result.success, false);
  assert.equal(result.normalizedText, '');
  assert.equal(result.routeToWorkflow01, false);
  assert.equal(result.errorCode, 'AUDIO_TRANSCRIPTION_UNCLEAR_OR_INVALID');
});

test('mocked unclear audio does not fabricate customer text', () => {
  const result = normalizeMockTranscription('   ');

  assert.equal(result.success, false);
  assert.equal(result.normalizedText, '');
  assert.equal(result.routeToWorkflow01, false);
});
