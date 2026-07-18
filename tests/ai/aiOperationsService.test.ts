import assert from 'node:assert/strict';
import { test } from 'node:test';
import Database from 'better-sqlite3';
import {
  createAiOperationsService,
  normalizeAiPhone,
} from '../../src/server/ai/aiOperationsService.ts';

const createTestService = (env: Partial<NodeJS.ProcessEnv> = {}) => {
  const sqlite = new Database(':memory:');
  const service = createAiOperationsService({
    sqlite,
    pgPool: null,
    usePostgres: false,
    env: {
      AI_AGENT_AUTO_CREATE_PICKUPS: 'false',
      ...env,
    } as NodeJS.ProcessEnv,
  });
  return { sqlite, service };
};

test('normalizes UAE phone variants to one canonical WhatsApp number', () => {
  const variants = ['0509998528', '971509998528', '+971509998528', '00971509998528', '50 999 8528'];
  assert.deepEqual(
    variants.map((value) => normalizeAiPhone(value)),
    ['971509998528', '971509998528', '971509998528', '971509998528', '971509998528']
  );
});

test('AI schema includes customer-service foundation tables and wamid uniqueness', async () => {
  const { sqlite, service } = createTestService();
  try {
    await service.ensureSchema();

    const tables = sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all()
      .map((row: any) => row.name);

    for (const table of [
      'customer_channel_links',
      'driver_service_areas',
      'driver_assignments',
      'complaint_events',
      'human_escalations',
      'ai_tool_calls',
      'notification_logs',
      'conversation_summaries',
    ]) {
      assert.ok(tables.includes(table), `Expected ${table} to exist`);
    }

    const indexes = sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type = 'index'")
      .all()
      .map((row: any) => row.name);
    assert.ok(indexes.includes('idx_ai_messages_wamid_unique'));
  } finally {
    sqlite.close();
  }
});

test('duplicate WhatsApp wamid is processed idempotently', async () => {
  const { sqlite, service } = createTestService();
  try {
    await service.ensureSchema();

    const first = await service.routeIncomingMessage({
      channel: 'whatsapp',
      from: '+971509998528',
      to: '+971555000000',
      name: 'Sara',
      messageText: 'عايز pickup اليوم',
      messageType: 'text',
      whatsappMessageId: 'wamid.TEST.DUPLICATE',
    });

    const second = await service.routeIncomingMessage({
      channel: 'whatsapp',
      from: '0509998528',
      to: '+971555000000',
      name: 'Sara',
      messageText: 'عايز pickup اليوم',
      messageType: 'text',
      whatsappMessageId: 'wamid.TEST.DUPLICATE',
    });

    assert.equal(first.duplicate_message, false);
    assert.equal(second.duplicate_message, true);
    assert.equal(second.conversation_id, first.conversation_id);

    const inboundCount = sqlite
      .prepare(
        `SELECT COUNT(*) AS count
         FROM ai_messages
         WHERE whatsapp_message_id = ? AND direction = 'inbound'`
      )
      .get('wamid.TEST.DUPLICATE') as { count: number };
    assert.equal(inboundCount.count, 1);

    const messageCount = sqlite
      .prepare('SELECT COUNT(*) AS count FROM ai_messages WHERE conversation_id = ?')
      .get(first.conversation_id) as { count: number };
    assert.equal(messageCount.count, 2);
  } finally {
    sqlite.close();
  }
});

test('routes high-risk complaints into channel links, memory summaries, and human escalations', async () => {
  const { sqlite, service } = createTestService();
  try {
    await service.ensureSchema();

    const routed = await service.routeIncomingMessage({
      channel: 'whatsapp',
      from: '+971509998528',
      to: '+971555000000',
      name: 'Sara',
      messageText: 'my kandora is lost order 256719',
      messageType: 'text',
      whatsappMessageId: 'wamid.TEST.LOST',
    });

    assert.equal(routed.intent, 'lost_item');
    assert.equal(routed.priority, 'urgent');
    assert.ok(routed.human_escalation_id);

    const channelLink = sqlite
      .prepare(
        `SELECT *
         FROM customer_channel_links
         WHERE channel = 'whatsapp' AND channel_user_id = ?`
      )
      .get('971509998528') as { verification_status: string; contact_id: number };
    assert.equal(channelLink.verification_status, 'channel_verified');
    assert.equal(channelLink.contact_id, routed.contact_id);

    const summary = sqlite
      .prepare('SELECT * FROM conversation_summaries WHERE conversation_id = ? AND deleted_at IS NULL')
      .get(routed.conversation_id) as { summary: string; last_intent: string; human_escalation_id: number };
    assert.equal(summary.last_intent, 'lost_item');
    assert.equal(summary.human_escalation_id, routed.human_escalation_id);
    assert.match(summary.summary, /intent=lost_item/);

    const escalation = sqlite
      .prepare('SELECT * FROM human_escalations WHERE id = ?')
      .get(routed.human_escalation_id) as { severity: string; status: string };
    assert.equal(escalation.severity, 'urgent');
    assert.equal(escalation.status, 'open');
  } finally {
    sqlite.close();
  }
});

test('failed manual WhatsApp send is captured in notification logs', async () => {
  const { sqlite, service } = createTestService();
  try {
    await service.ensureSchema();

    await assert.rejects(
      () => service.sendAndLogWhatsAppText('+971509998528', 'Test message'),
      /WhatsApp Cloud API is not configured/
    );

    const notification = sqlite
      .prepare(
        `SELECT *
         FROM notification_logs
         WHERE recipient_phone = ? AND status = 'failed'
         ORDER BY id DESC LIMIT 1`
      )
      .get('971509998528') as { error_code: string; error_message: string };
    assert.equal(notification.error_code, 'NOTIFICATION_SEND_FAILED');
    assert.match(notification.error_message, /WhatsApp Cloud API is not configured/);
  } finally {
    sqlite.close();
  }
});

test('OpenAI analysis uses Responses API structured output and logs tool calls', async () => {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; body: any }> = [];
  globalThis.fetch = (async (url: any, init: any) => {
    const body = JSON.parse(String(init?.body ?? '{}'));
    calls.push({ url: String(url), body });
    return {
      ok: true,
      json: async () => ({
        id: 'resp_test_123',
        output: [
          {
            content: [
              {
                type: 'output_text',
                text: JSON.stringify({
                  intent: 'pickup_request',
                  language: 'ar',
                  priority: 'normal',
                  pickup_draft: {
                    customer_name: 'Sara',
                    customer_phone: '971509998528',
                    area: 'MBZ',
                    address: '',
                    google_maps_url: '',
                    preferred_time: 'today',
                    serviceType: 'WhatsApp pickup',
                    notes: '',
                    confidence: 'high',
                  },
                  missing_fields: [],
                  ready_for_auto_create: true,
                  reply: 'أكيد يا سارة، تم استلام طلب الاستلام.',
                }),
              },
            ],
          },
        ],
        usage: { input_tokens: 10, output_tokens: 20 },
      }),
    } as Response;
  }) as typeof fetch;

  const { sqlite, service } = createTestService({
    OPENAI_API_KEY: 'test-key',
    OPENAI_BASE_URL: 'https://mock.openai.local',
  });
  try {
    await service.ensureSchema();
    const routed = await service.routeIncomingMessage({
      channel: 'whatsapp',
      from: '+971509998528',
      to: '+971555000000',
      name: 'Sara',
      messageText: 'عايز pickup اليوم',
      messageType: 'text',
      whatsappMessageId: 'wamid.TEST.OPENAI',
      correlationId: 'corr_test_openai',
    });

    assert.equal(routed.ai_source, 'openai');
    assert.equal(routed.intent, 'pickup_request');
    assert.equal(routed.language, 'ar');
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://mock.openai.local/v1/responses');
    assert.equal(calls[0].body.text.format.type, 'json_schema');
    assert.equal(calls[0].body.text.format.name, 'laundry_customer_message_analysis');
    assert.ok(Array.isArray(calls[0].body.input));
    assert.equal(calls[0].body.messages, undefined);

    const toolCall = sqlite
      .prepare(
        `SELECT *
         FROM ai_tool_calls
         WHERE correlation_id = ?
         ORDER BY id DESC LIMIT 1`
      )
      .get('corr_test_openai') as { tool_name: string; status: string; intent: string; request_payload: string; response_payload: string };
    assert.equal(toolCall.tool_name, 'openai.responses.customer_message_analysis');
    assert.equal(toolCall.status, 'succeeded');
    assert.equal(toolCall.intent, 'pickup_request');
    assert.match(toolCall.request_payload, /contact_phone_masked/);
    assert.doesNotMatch(toolCall.request_payload, /971509998528/);
    assert.match(toolCall.response_payload, /resp_test_123/);
  } finally {
    sqlite.close();
    globalThis.fetch = originalFetch;
  }
});

test('order tracking reveals status only when WhatsApp phone matches the order phone', async () => {
  const { sqlite, service } = createTestService();
  try {
    await service.ensureSchema();
    sqlite.exec(`
      CREATE TABLE customer_orders (
        id TEXT PRIMARY KEY,
        status TEXT NOT NULL DEFAULT 'new',
        payload TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    sqlite.prepare('INSERT INTO customer_orders (id, status, payload) VALUES (?, ?, ?)').run(
      '777001',
      'ready',
      JSON.stringify({
        id: '777001',
        customerName: 'Sara',
        customerPhone: '0509998528',
        customerPhoneNormalized: '0509998528',
        status: 'READY',
        branch: 'MBZ',
        paymentStatus: 'paid',
        totalPrice: 25,
        eta: 'today',
      })
    );

    const routed = await service.routeIncomingMessage({
      channel: 'whatsapp',
      from: '+971509998528',
      to: '+971555000000',
      name: 'Sara',
      messageText: 'order 777001 status',
      messageType: 'text',
      whatsappMessageId: 'wamid.TEST.ORDER.AUTHORIZED',
    });

    assert.equal(routed.intent, 'order_tracking');
    assert.equal(routed.order_tracking.authorization, 'verified');
    assert.equal(routed.order_tracking.status, 'READY');
    assert.match(routed.response, /READY/);
  } finally {
    sqlite.close();
  }
});

test('order tracking requires verification when WhatsApp phone does not match the order phone', async () => {
  const { sqlite, service } = createTestService();
  try {
    await service.ensureSchema();
    sqlite.exec(`
      CREATE TABLE customer_orders (
        id TEXT PRIMARY KEY,
        status TEXT NOT NULL DEFAULT 'new',
        payload TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    sqlite.prepare('INSERT INTO customer_orders (id, status, payload) VALUES (?, ?, ?)').run(
      '777002',
      'ready',
      JSON.stringify({
        id: '777002',
        customerName: 'Private Customer',
        customerPhone: '0509998528',
        customerPhoneNormalized: '0509998528',
        status: 'READY',
        branch: 'MBZ',
        paymentStatus: 'paid',
        totalPrice: 25,
      })
    );

    const routed = await service.routeIncomingMessage({
      channel: 'whatsapp',
      from: '+971501111111',
      to: '+971555000000',
      name: 'Other',
      messageText: 'order 777002 status',
      messageType: 'text',
      whatsappMessageId: 'wamid.TEST.ORDER.BLOCKED',
    });

    assert.equal(routed.intent, 'order_tracking');
    assert.equal(routed.order_tracking.authorization, 'verification_required');
    assert.equal(routed.order_tracking.verified, false);
    assert.equal(routed.order_tracking.status, undefined);
    assert.doesNotMatch(routed.response, /READY|MBZ|Private Customer/);
    assert.match(routed.response, /verify|تحقق|ملكية/i);
  } finally {
    sqlite.close();
  }
});

test('driver dispatch assigns pickup to the best available area driver with lower workload', async () => {
  const { sqlite, service } = createTestService();
  try {
    await service.ensureSchema();
    sqlite.exec(`
      CREATE TABLE customer_site_config (
        id INTEGER PRIMARY KEY,
        payload TEXT NOT NULL
      )
    `);
    sqlite.prepare('INSERT INTO customer_site_config (id, payload) VALUES (1, ?)').run(
      JSON.stringify({
        service_areas: [
          { id: 'mbz', name: 'مدينة محمد بن زايد', active: true, branch_id: 'mbz' },
        ],
        drivers: [
          {
            id: 'DRV-BUSY',
            name: 'Busy Driver',
            phone: '0501111111',
            branch_id: 'mbz',
            service_areas: ['مدينة محمد بن زايد'],
            status: 'online',
          },
          {
            id: 'DRV-FREE',
            name: 'Free Driver',
            phone: '0502222222',
            branch_id: 'mbz',
            service_areas: ['مدينة محمد بن زايد'],
            status: 'online',
          },
        ],
      })
    );

    const busyPickup = await service.createPickupRequest({
      customer_name: 'Existing',
      customer_phone: '0503333333',
      address: 'مدينة محمد بن زايد',
    });
    sqlite
      .prepare(
        `INSERT INTO driver_assignments (
          task_type, pickup_request_id, driver_phone, service_area, status, ranking_score, created_at, updated_at
        ) VALUES ('pickup', ?, ?, 'مدينة محمد بن زايد', 'assigned', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      )
      .run(busyPickup.id, '971501111111');

    const pickup = await service.createPickupRequest({
      customer_name: 'Sara',
      customer_phone: '0509998528',
      address: 'Villa 10, مدينة محمد بن زايد',
    });

    const dispatch = await service.assignDriverToPickupRequest(pickup.id, {
      service_area: 'مدينة محمد بن زايد',
      priority: 'normal',
    });

    assert.equal(dispatch.status, 'assigned');
    assert.equal(dispatch.driver.id, 'DRV-FREE');
    assert.equal(dispatch.driver.phone, '971502222222');

    const updatedPickup = sqlite.prepare('SELECT * FROM pickup_requests WHERE id = ?').get(pickup.id) as {
      status: string;
      assigned_driver_phone: string;
    };
    assert.equal(updatedPickup.status, 'assigned');
    assert.equal(updatedPickup.assigned_driver_phone, '971502222222');
  } finally {
    sqlite.close();
  }
});

test('driver dispatch is idempotent for an already assigned pickup', async () => {
  const { sqlite, service } = createTestService();
  try {
    await service.ensureSchema();
    sqlite.exec(`
      CREATE TABLE customer_site_config (
        id INTEGER PRIMARY KEY,
        payload TEXT NOT NULL
      )
    `);
    sqlite.prepare('INSERT INTO customer_site_config (id, payload) VALUES (1, ?)').run(
      JSON.stringify({
        service_areas: [{ id: 'mbz', name: 'مدينة محمد بن زايد', active: true, branch_id: 'mbz' }],
        drivers: [
          {
            id: 'DRV-ONE',
            name: 'One Driver',
            phone: '0502222222',
            branch_id: 'mbz',
            service_areas: ['مدينة محمد بن زايد'],
            status: 'online',
          },
        ],
      })
    );

    const pickup = await service.createPickupRequest({
      customer_name: 'Sara',
      customer_phone: '0509998528',
      address: 'مدينة محمد بن زايد',
    });

    const first = await service.assignDriverToPickupRequest(pickup.id, { service_area: 'مدينة محمد بن زايد' });
    const second = await service.assignDriverToPickupRequest(pickup.id, { service_area: 'مدينة محمد بن زايد' });

    assert.equal(first.status, 'assigned');
    assert.equal(second.status, 'already_assigned');
    assert.equal(Number(second.assignment.id), Number(first.assignment.id));

    const count = sqlite
      .prepare(
        `SELECT COUNT(*) AS count
         FROM driver_assignments
         WHERE pickup_request_id = ? AND status IN ('assigned', 'accepted', 'on_the_way', 'arrived')`
      )
      .get(pickup.id) as { count: number };
    assert.equal(count.count, 1);
  } finally {
    sqlite.close();
  }
});

test('driver assignment status follows the allowed pickup transition flow', async () => {
  const { sqlite, service } = createTestService();
  try {
    await service.ensureSchema();
    sqlite.exec(`
      CREATE TABLE customer_site_config (
        id INTEGER PRIMARY KEY,
        payload TEXT NOT NULL
      )
    `);
    sqlite.prepare('INSERT INTO customer_site_config (id, payload) VALUES (1, ?)').run(
      JSON.stringify({
        service_areas: [{ id: 'mbz', name: 'مدينة محمد بن زايد', active: true, branch_id: 'mbz' }],
        drivers: [
          {
            id: 'DRV-ONE',
            name: 'One Driver',
            phone: '0502222222',
            branch_id: 'mbz',
            service_areas: ['مدينة محمد بن زايد'],
            status: 'online',
          },
        ],
      })
    );

    const pickup = await service.createPickupRequest({
      customer_name: 'Sara',
      customer_phone: '0509998528',
      address: 'مدينة محمد بن زايد',
    });
    const dispatch = await service.assignDriverToPickupRequest(pickup.id, { service_area: 'مدينة محمد بن زايد' });

    const accepted = await service.updateDriverAssignmentStatus(dispatch.assignment.id, { status: 'ACCEPTED', updated_by: 'driver' });
    const onTheWay = await service.updateDriverAssignmentStatus(dispatch.assignment.id, { status: 'ON_THE_WAY', updated_by: 'driver' });
    const arrived = await service.updateDriverAssignmentStatus(dispatch.assignment.id, { status: 'ARRIVED', updated_by: 'driver' });
    const pickedUp = await service.updateDriverAssignmentStatus(dispatch.assignment.id, { status: 'PICKED_UP', updated_by: 'driver' });

    assert.equal(accepted.assignment.status, 'accepted');
    assert.ok(accepted.assignment.accepted_at);
    assert.equal(onTheWay.assignment.status, 'on_the_way');
    assert.equal(arrived.assignment.status, 'arrived');
    assert.equal(pickedUp.assignment.status, 'picked_up');
    assert.ok(pickedUp.assignment.completed_at);

    const updatedPickup = sqlite.prepare('SELECT * FROM pickup_requests WHERE id = ?').get(pickup.id) as {
      status: string;
      assigned_driver_phone: string;
    };
    assert.equal(updatedPickup.status, 'picked_up');
    assert.equal(updatedPickup.assigned_driver_phone, '971502222222');
  } finally {
    sqlite.close();
  }
});

test('driver assignment rejects invalid transition jumps', async () => {
  const { sqlite, service } = createTestService();
  try {
    await service.ensureSchema();
    sqlite.exec(`
      CREATE TABLE customer_site_config (
        id INTEGER PRIMARY KEY,
        payload TEXT NOT NULL
      )
    `);
    sqlite.prepare('INSERT INTO customer_site_config (id, payload) VALUES (1, ?)').run(
      JSON.stringify({
        service_areas: [{ id: 'mbz', name: 'مدينة محمد بن زايد', active: true, branch_id: 'mbz' }],
        drivers: [
          {
            id: 'DRV-ONE',
            name: 'One Driver',
            phone: '0502222222',
            branch_id: 'mbz',
            service_areas: ['مدينة محمد بن زايد'],
            status: 'online',
          },
        ],
      })
    );

    const pickup = await service.createPickupRequest({
      customer_name: 'Sara',
      customer_phone: '0509998528',
      address: 'مدينة محمد بن زايد',
    });
    const dispatch = await service.assignDriverToPickupRequest(pickup.id, { service_area: 'مدينة محمد بن زايد' });

    await assert.rejects(
      () => service.updateDriverAssignmentStatus(dispatch.assignment.id, { status: 'PICKED_UP', updated_by: 'driver' }),
      /Invalid driver assignment transition/
    );

    const assignment = sqlite.prepare('SELECT * FROM driver_assignments WHERE id = ?').get(dispatch.assignment.id) as {
      status: string;
    };
    assert.equal(assignment.status, 'assigned');
  } finally {
    sqlite.close();
  }
});
