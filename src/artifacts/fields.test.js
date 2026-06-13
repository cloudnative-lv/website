import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  meetupNumber, cleanTitle, dateDots, dateLong, speakerRole,
  startTime, initials, talkSpeakerNames, eventSpeakerNames, venueLine,
} from './fields.js';

test('meetupNumber from id and title', () => {
  assert.equal(meetupNumber({ id: '2026-06-10-meetup-006' }), '6');
  assert.equal(meetupNumber({ title: 'Meetup #006: GPUs' }), '6');
  assert.equal(meetupNumber({ title: 'Meetup #4 - GitOps' }), '4');
  assert.equal(meetupNumber({}), '');
});

test('cleanTitle strips the meetup prefix', () => {
  assert.equal(cleanTitle('Meetup #006: GPUs and AI Agents'), 'GPUs and AI Agents');
  assert.equal(cleanTitle('Meetup #4 - GitOps with ArgoCD'), 'GitOps with ArgoCD');
  assert.equal(cleanTitle('No prefix here'), 'No prefix here');
});

test('dateDots and dateLong', () => {
  assert.equal(dateDots('2026-06-10'), '10.06.2026');
  assert.equal(dateLong('2026-06-10'), '10th of June');
  assert.equal(dateLong('2026-06-01'), '1st of June');
  assert.equal(dateLong('2026-06-22'), '22nd of June');
  assert.equal(dateLong('2026-06-23'), '23rd of June');
});

test('speakerRole composes title and company', () => {
  assert.equal(speakerRole({ title: 'CTO & Co-founder', company: 'Nuoxera' }), 'CTO & Co-founder @ Nuoxera');
  assert.equal(speakerRole({ company: 'GOStack' }), 'GOStack');
  assert.equal(speakerRole({ title: 'DevOps Engineer' }), 'DevOps Engineer');
  assert.equal(speakerRole({}), '');
});

test('startTime falls back to doors time', () => {
  assert.equal(startTime({ time: '18:15' }), '18:15');
  assert.equal(startTime({ time: '18:15', startTime: '18:30' }), '18:30');
});

test('initials, talkSpeakerNames, eventSpeakerNames', () => {
  assert.equal(initials('Andrey Adamovich'), 'AA');
  assert.deepEqual(talkSpeakerNames({ speaker: 'A' }), ['A']);
  assert.deepEqual(talkSpeakerNames({ speakers: ['A', 'B'] }), ['A', 'B']);
  assert.deepEqual(
    eventSpeakerNames({ talks: [{ speakers: ['A', 'B'] }, { speaker: 'B' }, { speaker: 'C' }] }),
    ['A', 'B', 'C'],
  );
});

test('venueLine keeps street + name', () => {
  assert.equal(venueLine({ address: 'Marijas iela 2A, Rīga, LV-1050', name: 'GoCardless' }), 'Marijas iela 2A, GoCardless');
  assert.equal(venueLine({ name: 'Accenture' }), 'Accenture');
});
