import { Component, Input } from '@angular/core';

// Original line art (horizon, two ridges, a road with foreshortened centre dashes, a red glow).
// Stands in for photography: home hero and the auth panel. Decorative only.
@Component({
  selector: 'app-road-art',
  standalone: false,
  template: `
<svg viewBox="0 0 1600 900" [attr.preserveAspectRatio]="align === 'end' ? 'xMaxYMid slice' : 'xMidYMid slice'" focusable="false">
  <defs>
    <radialGradient id="road-art-glow" cx="1130" cy="500" r="620" gradientUnits="userSpaceOnUse">
      <stop offset="0" class="art-glow-stop" />
      <stop offset="1" class="art-glow-stop end" />
    </radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#road-art-glow)" />
  <path class="art-ridge far" d="M520 500 L640 452 L720 474 L820 410 L910 455 L990 428 L1130 500 L1230 446 L1320 470 L1420 418 L1530 462 L1600 440 L1600 500 Z" />
  <path class="art-ridge" d="M560 500 L700 470 L790 488 L880 462 L1000 492 L1130 500 L1260 480 L1380 494 L1480 472 L1600 486 L1600 500 Z" />
  <line class="art-horizon" x1="480" y1="500" x2="1600" y2="500" />
  <polygon class="art-road" points="1130,500 760,900 1740,900" />
  <line class="art-edge" x1="1130" y1="500" x2="760" y2="900" />
  <line class="art-edge" x1="1130" y1="500" x2="1740" y2="900" />
  <polygon class="art-dash" points="1237.0,900.0 1263.0,900.0 1241.7,836.0 1219.9,836.0" />
  <polygon class="art-dash" points="1207.0,788.0 1225.8,788.0 1208.7,736.8 1193.3,736.8" />
  <polygon class="art-dash" points="1184.1,702.2 1197.2,702.2 1183.6,661.3 1173.1,661.3" />
  <polygon class="art-dash" points="1166.7,637.0 1175.6,637.0 1164.7,604.2 1157.9,604.2" />
  <polygon class="art-dash" points="1153.5,587.8 1159.2,587.8 1150.5,561.6 1146.5,561.6" />
  <polygon class="art-dash" points="1143.7,551.1 1147.0,551.1 1140.0,530.1 1138.0,530.1" />
</svg>
  `,
  styleUrl: './road-art.css',
  host: { 'aria-hidden': 'true' },
})
export class RoadArt {
  // 'end' keeps the road (right part of the drawing) in view in narrow, tall boxes
  @Input() align: 'center' | 'end' = 'center';
}
