import assert from 'node:assert/strict';
import test from 'node:test';
import { getYouTubeEmbedUrl } from './youtube';

test('converts a YouTube watch URL to a privacy-enhanced embed URL', () => {
  assert.equal(
    getYouTubeEmbedUrl('https://www.youtube.com/watch?v=EB2RaO8jnck'),
    'https://www.youtube-nocookie.com/embed/EB2RaO8jnck',
  );
  assert.equal(
    getYouTubeEmbedUrl('https://youtu.be/EB2RaO8jnck'),
    'https://www.youtube-nocookie.com/embed/EB2RaO8jnck',
  );
  assert.equal(
    getYouTubeEmbedUrl('https://www.youtube.com/embed/EB2RaO8jnck'),
    'https://www.youtube-nocookie.com/embed/EB2RaO8jnck',
  );
});

test('rejects non-YouTube and malformed URLs', () => {
  assert.equal(getYouTubeEmbedUrl('https://example.com/watch?v=EB2RaO8jnck'), null);
  assert.equal(getYouTubeEmbedUrl('not a URL'), null);
  assert.equal(getYouTubeEmbedUrl(null), null);
});
