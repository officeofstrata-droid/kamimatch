import { describe, expect, it } from 'vitest';
import { roomSchema, roomStartTime } from '@/lib/community-rules';

const room = { title: 'Friday watch party', anime: 'One Piece', kind: 'watch', episode: 1, streaming_url: '' };
describe('Watch parties', () => {
  it('allows creating a room without the optional start time', () => {
    expect(roomSchema.parse({ ...room, starts_at: '' }).starts_at).toBeUndefined();
  });
  it('sends a selected local start time as a valid instant', () => {
    const starts_at = roomStartTime('2026-10-18T19:30');
    expect(starts_at).toBe(new Date('2026-10-18T19:30').toISOString());
    expect(roomSchema.safeParse({ ...room, starts_at }).success).toBe(true);
  });
  it('rejects unofficial streaming hosts', () => {
    expect(roomSchema.safeParse({ ...room, streaming_url: 'https://netflix.com.evil.example/watch' }).success).toBe(false);
    expect(roomSchema.safeParse({ ...room, streaming_url: 'https://www.crunchyroll.com/watch/episode' }).success).toBe(true);
  });
});