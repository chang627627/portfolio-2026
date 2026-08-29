"""Local preview server for the portfolio.

Serves the repo directory this file lives in (../ from .claude/), so there is
no /tmp staging copy and no rsync step: edit a file, refresh, see it.

History: this used to live at /tmp/portfolio/serve.py and serve a synced copy.
/tmp gets wiped periodically, which deleted the script and broke the preview
(twice on 2026-08-02 alone), and the sync step also caused stale-file confusion
when a screenshot was taken before the rsync landed. Keeping the script in the
repo and serving the repo directly removes both failure modes.

ThreadingHTTPServer is REQUIRED, not a preference: the single-threaded default
serves one request at a time, so pages with many large clips (homewise is
~135MB across 7 videos) download sequentially, render as empty boxes, and look
like broken markup. Production (Vercel) always serves in parallel.

RANGE SUPPORT is equally load-bearing (added 2026-08-29): without 206 responses
Chrome cannot honor preload="metadata", so every <video> falls back to a FULL
download. On homewise that is ~165MB per cold page load, the load event hangs
for minutes, and the browser pane tools refuse to run ("page is still loading")
or wedge outright. With ranges, a metadata preload fetches only the moov head
and the page loads in seconds, matching production behavior.
"""

import http.server
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(os.environ.get('PORT', 8888))

RANGE_RE = re.compile(r'bytes=(\d*)-(\d*)')


class Handler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Keep .git/.claude out of the served tree.
        parts = path.split('?', 1)[0].split('#', 1)[0].split('/')
        if any(p.startswith('.') and p not in ('', '.', '..') for p in parts):
            return os.path.join(ROOT, '__forbidden__')
        return super().translate_path(path)

    def log_message(self, *args):
        pass

    def send_head(self):
        # Single-range support so <video preload="metadata"> works like prod.
        rng = self.headers.get('Range')
        if not rng:
            return super().send_head()
        m = RANGE_RE.match(rng)
        path = self.translate_path(self.path)
        if not m or os.path.isdir(path) or not os.path.exists(path):
            return super().send_head()
        size = os.path.getsize(path)
        start = int(m.group(1)) if m.group(1) else None
        end = int(m.group(2)) if m.group(2) else None
        if start is None:            # suffix range: bytes=-N
            start = max(0, size - (end or 0))
            end = size - 1
        else:
            end = min(end if end is not None else size - 1, size - 1)
        if start >= size or start > end:
            self.send_response(416)
            self.send_header('Content-Range', 'bytes */%d' % size)
            self.end_headers()
            return None
        f = open(path, 'rb')
        f.seek(start)
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Range', 'bytes %d-%d/%d' % (start, end, size))
        self.send_header('Content-Length', str(end - start + 1))
        self.end_headers()
        self._range_len = end - start + 1
        return f

    def copyfile(self, source, outputfile):
        n = getattr(self, '_range_len', None)
        if n is None:
            return super().copyfile(source, outputfile)
        self._range_len = None
        remaining = n
        while remaining > 0:
            chunk = source.read(min(65536, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)


if __name__ == '__main__':
    os.chdir(ROOT)  # chdir before binding — avoids getcwd permission errors
    print('Serving %s on http://localhost:%d' % (ROOT, PORT), file=sys.stderr)
    http.server.ThreadingHTTPServer(('', PORT), Handler).serve_forever()
