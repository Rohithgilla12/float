"""Generates Float's app icon and menu bar template icon as SVG."""
import math

def squircle(cx, cy, r, n=5.0, steps=720):
    pts = []
    for i in range(steps):
        t = 2 * math.pi * i / steps
        c, s = math.cos(t), math.sin(t)
        pts.append(f"{cx + r * math.copysign(abs(c) ** (2 / n), c):.2f},{cy + r * math.copysign(abs(s) ** (2 / n), s):.2f}")
    return "M" + " L".join(pts) + " Z"

tile = squircle(512, 512, 412)
ink = "#7A4E05"

app = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2A2D34"/><stop offset="1" stop-color="#0F1013"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="#FDE68A"/><stop offset="0.55" stop-color="#FBBF24"/><stop offset="1" stop-color="#F59E0B"/>
    </linearGradient>
    <linearGradient id="win" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#363A42"/><stop offset="1" stop-color="#22252B"/>
    </linearGradient>
    <filter id="tileShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#000" flood-opacity="0.35"/>
    </filter>
    <filter id="cardShadow" x="-40%" y="-40%" width="180%" height="190%">
      <feDropShadow dx="0" dy="64" stdDeviation="40" flood-color="#000" flood-opacity="0.7"/>
    </filter>
    <clipPath id="clip"><path d="{tile}"/></clipPath>
  </defs>
  <path d="{tile}" fill="url(#bg)" filter="url(#tileShadow)"/>
  <g clip-path="url(#clip)">
    <rect x="176" y="548" width="672" height="420" rx="40" fill="url(#win)"/>
    <path d="M176 588 a40 40 0 0 1 40 -40 h592 a40 40 0 0 1 40 40 v24 h-672 z" fill="#434852"/>
    <circle cx="222" cy="580" r="12" fill="#5C626D"/><circle cx="262" cy="580" r="12" fill="#5C626D"/><circle cx="302" cy="580" r="12" fill="#5C626D"/>
    <rect x="232" y="664" width="300" height="20" rx="10" fill="#474C56"/>
    <rect x="232" y="710" width="420" height="20" rx="10" fill="#3C4149"/>
    <rect x="232" y="756" width="360" height="20" rx="10" fill="#3C4149"/>
  </g>
  <g transform="rotate(-6 532 372)" filter="url(#cardShadow)">
    <rect x="332" y="172" width="400" height="400" rx="52" fill="url(#card)"/>
    <rect x="333.5" y="173.5" width="397" height="397" rx="50.5" fill="none" stroke="#FFF7D6" stroke-opacity="0.6" stroke-width="3"/>
    <g fill="none" stroke="{ink}" stroke-opacity="0.8" stroke-width="15" stroke-linecap="round" stroke-linejoin="round">
      <rect x="392" y="250" width="58" height="58" rx="15"/>
      <path d="M405 279 L418 293 L438 265"/>
      <rect x="392" y="350" width="58" height="58" rx="15"/>
    </g>
    <g fill="{ink}" fill-opacity="0.55">
      <rect x="478" y="269" width="196" height="21" rx="10.5"/>
      <rect x="478" y="369" width="156" height="21" rx="10.5"/>
      <rect x="392" y="460" width="262" height="21" rx="10.5"/>
    </g>
  </g>
  <path d="{tile}" fill="none" stroke="#FFFFFF" stroke-opacity="0.07" stroke-width="3"/>
</svg>
'''
open("app-icon.svg", "w").write(app)

tray = '''<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
  <g fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="7.25" y="3.25" width="21.5" height="20.5" rx="5"/>
    <path d="M12.25 10.25 H23.75 M12.25 16.25 H19.75"/>
    <path d="M4.25 31.25 H31.75"/>
  </g>
</svg>
'''
open("tray-template.svg", "w").write(tray)
