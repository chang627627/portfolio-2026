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
"""

import http.server
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(os.environ.get('PORT', 8888))


class Handler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Keep .git/.claude out of the served tree.
        parts = path.split('?', 1)[0].split('#', 1)[0].split('/')
        if any(p.startswith('.') and p not in ('', '.', '..') for p in parts):
            return os.path.join(ROOT, '__forbidden__')
        return super().translate_path(path)

    def log_message(self, *args):
        pass


if __name__ == '__main__':
    os.chdir(ROOT)  # chdir before binding — avoids getcwd permission errors
    print(f'Serving {ROOT} on http://localhost:{PORT}', file=sys.stderr)
    http.server.ThreadingHTTPServer(('', PORT), Handler).serve_forever()
