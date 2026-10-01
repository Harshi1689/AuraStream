/**
 * ==========================================================================
 * EMOTION BASED MUSIC PLAYER - HIGH PERFORMANCE LANDING ENGINE
 * Pure Vanilla JS + HTML5 Canvas (Zero external heavy dependencies)
 * Features:
 *  1. Large 3D Wireframe Constellation Musical Note (♪) with 60FPS perspective
 *  2. Interactive Mouse Parallax & Gentle Auto-Oscillation
 *  3. Dynamic Shard / Polygon Disintegration Cloud (drifting up & left)
 *  4. Cyber Stage Pedestal with Concentric Rings, Circuit Traces & Light Beams
 *  5. Live Rhythmic Audio Spectrum Equalizer (Left side)
 *  6. Interactive Mood Matrix Sync Switcher with direct player link
 * ==========================================================================
 */

(function () {
    'use strict';

    // -------------------------------------------------------------------------
    // 1. 3D CONSTELLATION NOTE & PEDESTAL CANVAS
    // -------------------------------------------------------------------------
    const canvas = document.getElementById('heroNoteCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Mouse tracking for parallax tilt
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    window.addEventListener('mousemove', function (e) {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        mouse.targetX = (e.clientX - cx) / cx;
        mouse.targetY = (e.clientY - cy) / cy;
    });

    // Resize handler
    function resize() {
        const rect = canvas.getBoundingClientRect();
        width = rect.width || 620;
        height = rect.height || 680;
        dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
        ctx.scale(dpr, dpr);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('load', resize);
    resize();

    // -------------------------------------------------------------------------
    // 3D GEOMETRY GENERATOR: LARGE FACETED EIGHTH NOTE (♪)
    // -------------------------------------------------------------------------
    const vertices = [];
    const edges = [];

    function addVertex(x, y, z) {
        vertices.push({ x, y, z, origX: x, origY: y, origZ: z });
        return vertices.length - 1;
    }

    function addEdge(i, j) {
        if (i === j) return;
        const exists = edges.some(e => (e[0] === i && e[1] === j) || (e[0] === j && e[1] === i));
        if (!exists) {
            edges.push([i, j]);
        }
    }

    // Geometry Scale Multiplier for grand presence
    const SCALE = 1.62;

    // A. Note Head (Tilted 3D Ellipsoid at base)
    const headCenterX = -52 * SCALE;
    const headCenterY = 72 * SCALE;
    const headCenterZ = 0;
    const headAngle = -26 * Math.PI / 180;
    const headIndices = [];

    // Concentric 3D rings forming the hollow volumetric head
    for (let layer = -2; layer <= 2; layer++) {
        const layerZ = layer * 11 * SCALE;
        const ringScale = Math.cos((layer / 2.6) * (Math.PI / 2));
        const numPts = 9;
        for (let i = 0; i < numPts; i++) {
            const theta = (i / numPts) * Math.PI * 2;
            const rx = Math.cos(theta) * 38 * SCALE * ringScale;
            const ry = Math.sin(theta) * 24 * SCALE * ringScale;

            // Apply inclination tilt
            const rotX = rx * Math.cos(headAngle) - ry * Math.sin(headAngle);
            const rotY = rx * Math.sin(headAngle) + ry * Math.cos(headAngle);

            const idx = addVertex(headCenterX + rotX, headCenterY + rotY, headCenterZ + layerZ);
            headIndices.push(idx);
        }
    }

    // Connect note head vertices
    for (let i = 0; i < headIndices.length; i++) {
        for (let j = i + 1; j < headIndices.length; j++) {
            const v1 = vertices[headIndices[i]];
            const v2 = vertices[headIndices[j]];
            const dist = Math.hypot(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
            if (dist < 46 * SCALE) {
                addEdge(headIndices[i], headIndices[j]);
            }
        }
    }

    // B. Note Stem (Vertical faceted column rising from right side of head)
    const stemIndices = [];
    const stemBottomY = 68 * SCALE;
    const stemTopY = -125 * SCALE;
    const stemSteps = 10;
    const stemX = 4 * SCALE;
    const stemW = 12 * SCALE;
    const stemD = 10 * SCALE;

    for (let s = 0; s <= stemSteps; s++) {
        const t = s / stemSteps;
        const sy = stemBottomY + (stemTopY - stemBottomY) * t;
        const sx = stemX + (t * 5 * SCALE); // gentle natural lean

        const i1 = addVertex(sx - stemW / 2, sy, -stemD / 2);
        const i2 = addVertex(sx + stemW / 2, sy, -stemD / 2);
        const i3 = addVertex(sx + stemW / 2, sy, stemD / 2);
        const i4 = addVertex(sx - stemW / 2, sy, stemD / 2);

        stemIndices.push([i1, i2, i3, i4]);

        addEdge(i1, i2);
        addEdge(i2, i3);
        addEdge(i3, i4);
        addEdge(i4, i1);
        addEdge(i1, i3); // cross support

        if (s > 0) {
            const prev = stemIndices[s - 1];
            addEdge(prev[0], i1);
            addEdge(prev[1], i2);
            addEdge(prev[2], i3);
            addEdge(prev[3], i4);
            // diagonal struts for faceted crystal look
            addEdge(prev[0], i2);
            addEdge(prev[1], i3);
            addEdge(prev[2], i4);
            addEdge(prev[3], i1);
        }
    }

    // Connect bottom stem to note head
    for (let c = 0; c < 4; c++) {
        const stemV = stemIndices[0][c];
        for (let h = 0; h < headIndices.length; h++) {
            const hv = headIndices[h];
            const dist = Math.hypot(vertices[stemV].x - vertices[hv].x, vertices[stemV].y - vertices[hv].y, vertices[stemV].z - vertices[hv].z);
            if (dist < 48 * SCALE) {
                addEdge(stemV, hv);
            }
        }
    }

    // C. Note Flag (Swooping aerodynamic 3D wing arching right and curving down)
    const flagSteps = 12;
    const flagIndices = [];
    const topStemVerts = stemIndices[stemSteps];

    for (let f = 0; f <= flagSteps; f++) {
        const t = f / flagSteps;
        // Cubic swoop formula
        const fx = stemX + (102 * SCALE) * Math.sin(t * Math.PI * 0.88);
        const fy = stemTopY + (145 * SCALE) * Math.pow(t, 1.45);
        const fz = Math.sin(t * Math.PI) * (14 * SCALE);
        const thickness = (1 - t * 0.72) * (14 * SCALE);

        const p1 = addVertex(fx, fy - thickness / 2, fz - (6 * SCALE));
        const p2 = addVertex(fx + thickness * 0.85, fy, fz + (6 * SCALE));
        const p3 = addVertex(fx, fy + thickness / 2, fz - (4 * SCALE));

        flagIndices.push([p1, p2, p3]);

        addEdge(p1, p2);
        addEdge(p2, p3);
        addEdge(p3, p1);

        if (f > 0) {
            const prev = flagIndices[f - 1];
            addEdge(prev[0], p1);
            addEdge(prev[1], p2);
            addEdge(prev[2], p3);
            addEdge(prev[0], p2);
            addEdge(prev[1], p3);
        } else {
            addEdge(topStemVerts[1], p1);
            addEdge(topStemVerts[2], p2);
            addEdge(topStemVerts[1], p3);
        }
    }

    // -------------------------------------------------------------------------
    // DISPERSED SHARD & PARTICLE CLOUD (Reference disintegration effect)
    // -------------------------------------------------------------------------
    const shardCount = 110;
    const shards = [];

    function resetShard(s, spawnImmediate = false) {
        // Spawn predominantly from flag and upper stem
        const isFlag = Math.random() > 0.3;
        const sourceArr = isFlag ? flagIndices : stemIndices;
        const step = Math.floor(Math.random() * sourceArr.length);
        const subIdx = Math.floor(Math.random() * sourceArr[step].length);
        const v = vertices[sourceArr[step][subIdx]];

        s.x = v.x + (Math.random() - 0.5) * (14 * SCALE);
        s.y = v.y + (Math.random() - 0.5) * (14 * SCALE);
        s.z = v.z + (Math.random() - 0.5) * (14 * SCALE);

        // Velocity: drift upward and to the left into ambient space
        s.vx = -(0.8 + Math.random() * 2.2);
        s.vy = -(0.6 + Math.random() * 1.8);
        s.vz = (Math.random() - 0.5) * 1.6;

        s.size = (2.5 + Math.random() * 5.5) * (window.innerWidth < 640 ? 0.7 : 1);
        s.isTriangle = Math.random() > 0.4;
        s.rot = Math.random() * Math.PI * 2;
        s.vrot = (Math.random() - 0.5) * 0.09;

        s.maxLife = 80 + Math.random() * 80;
        s.life = spawnImmediate ? Math.random() * s.maxLife : 0;
        s.alpha = 0;
    }

    for (let i = 0; i < shardCount; i++) {
        const s = {};
        resetShard(s, true);
        shards.push(s);
    }

    // -------------------------------------------------------------------------
    // PEDESTAL DATA PULSES & VERTICAL LIGHT BEAMS
    // -------------------------------------------------------------------------
    const circuitPulses = [];
    for (let i = 0; i < 22; i++) {
        circuitPulses.push({
            angle: Math.random() * Math.PI * 2,
            radius: (50 + Math.random() * 160) * SCALE,
            speed: (0.007 + Math.random() * 0.016) * (Math.random() > 0.5 ? 1 : -1),
            size: 2.2 + Math.random() * 3.5,
            track: Math.floor(Math.random() * 3)
        });
    }

    const verticalBeams = [
        { x: -140 * SCALE, width: 28 * SCALE, height: 440 * SCALE, alpha: 0.16, phase: 0 },
        { x: -70 * SCALE, width: 44 * SCALE, height: 520 * SCALE, alpha: 0.28, phase: 1.1 },
        { x: 10 * SCALE, width: 52 * SCALE, height: 560 * SCALE, alpha: 0.35, phase: 2.4 },
        { x: 95 * SCALE, width: 38 * SCALE, height: 490 * SCALE, alpha: 0.25, phase: 3.7 },
        { x: 165 * SCALE, width: 24 * SCALE, height: 410 * SCALE, alpha: 0.15, phase: 4.8 }
    ];

    // -------------------------------------------------------------------------
    // MAIN 60 FPS RENDER LOOP
    // -------------------------------------------------------------------------
    let rotAngle = 0;
    let floatTime = 0;

    function render() {
        requestAnimationFrame(render);

        // Smooth mouse damping
        mouse.x += (mouse.targetX - mouse.x) * 0.06;
        mouse.y += (mouse.targetY - mouse.y) * 0.06;

        floatTime += 0.024;
        rotAngle += 0.007;

        ctx.clearRect(0, 0, width, height);

        const cx = width * 0.52;
        const cy = height * 0.42 + Math.sin(floatTime) * 12; // breathing hover
        const pedestalY = height * 0.82;

        // 1. Vertical Light Beams (Stage Spotlights)
        ctx.save();
        verticalBeams.forEach(beam => {
            const bx = cx + beam.x;
            const currentAlpha = beam.alpha * (0.75 + 0.25 * Math.sin(floatTime * 2 + beam.phase));
            const grad = ctx.createLinearGradient(bx, pedestalY + 30, bx, pedestalY - beam.height);
            grad.addColorStop(0, `rgba(0, 210, 255, ${currentAlpha})`);
            grad.addColorStop(0.35, `rgba(0, 114, 255, ${currentAlpha * 0.65})`);
            grad.addColorStop(1, 'rgba(0, 70, 220, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(bx - beam.width * 0.5, pedestalY + 30);
            ctx.lineTo(bx + beam.width * 0.5, pedestalY + 30);
            ctx.lineTo(bx + beam.width * 0.85, pedestalY - beam.height);
            ctx.lineTo(bx - beam.width * 0.85, pedestalY - beam.height);
            ctx.closePath();
            ctx.fill();
        });
        ctx.restore();

        // 2. Glowing 3D Pedestal (Concentric perspective rings & circuits)
        ctx.save();
        const baseTilt = 0.36; // perspective flattening
        const rings = [
            { rx: 220 * SCALE, ry: 220 * SCALE * baseTilt, alpha: 0.35, dash: [10, 8], glow: true },
            { rx: 170 * SCALE, ry: 170 * SCALE * baseTilt, alpha: 0.65, dash: [], glow: true },
            { rx: 110 * SCALE, ry: 110 * SCALE * baseTilt, alpha: 0.85, dash: [16, 10], glow: true },
            { rx: 55 * SCALE, ry: 55 * SCALE * baseTilt, alpha: 0.75, dash: [], glow: false }
        ];

        // Radiant floor ambient aura
        const floorAura = ctx.createRadialGradient(cx, pedestalY, 10, cx, pedestalY, 260 * SCALE);
        floorAura.addColorStop(0, 'rgba(0, 225, 255, 0.45)');
        floorAura.addColorStop(0.35, 'rgba(0, 114, 255, 0.26)');
        floorAura.addColorStop(1, 'rgba(1, 4, 20, 0)');
        ctx.fillStyle = floorAura;
        ctx.beginPath();
        ctx.ellipse(cx, pedestalY, 260 * SCALE, 260 * SCALE * baseTilt, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rings
        rings.forEach(r => {
            ctx.strokeStyle = `rgba(0, 225, 255, ${r.alpha})`;
            ctx.lineWidth = r.glow ? 2.2 : 1.2;
            if (r.glow) {
                ctx.shadowColor = '#00f2fe';
                ctx.shadowBlur = 16;
            } else {
                ctx.shadowBlur = 0;
            }
            ctx.setLineDash(r.dash);
            ctx.beginPath();
            ctx.ellipse(cx, pedestalY, r.rx, r.ry, 0, 0, Math.PI * 2);
            ctx.stroke();
        });
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;

        // Radiating Circuit Lines
        for (let a = 0; a < 8; a++) {
            const radAngle = (a / 8) * Math.PI * 2 + rotAngle * 0.15;
            const x1 = cx + Math.cos(radAngle) * (60 * SCALE);
            const y1 = pedestalY + Math.sin(radAngle) * (60 * SCALE * baseTilt);
            const x2 = cx + Math.cos(radAngle) * (190 * SCALE);
            const y2 = pedestalY + Math.sin(radAngle) * (190 * SCALE * baseTilt);

            ctx.strokeStyle = 'rgba(0, 190, 255, 0.38)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            // Circuit node dots
            ctx.fillStyle = 'rgba(0, 245, 255, 0.9)';
            ctx.shadowColor = '#00f2fe';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(x2, y2, 2.8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        // Orbiting glowing circuit packets
        circuitPulses.forEach(p => {
            p.angle += p.speed;
            const trackRadius = [80 * SCALE, 140 * SCALE, 195 * SCALE][p.track];
            const px = cx + Math.cos(p.angle) * trackRadius;
            const py = pedestalY + Math.sin(p.angle) * (trackRadius * baseTilt);

            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#00f2fe';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;
        ctx.restore();

        // 3. 3D Rotation Matrix for the Constellation Note
        const rotY = Math.sin(rotAngle) * 0.25 + mouse.x * 0.42;
        const rotX = -0.12 + mouse.y * 0.32;
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);

        const fov = 520; // 3D perspective depth

        // Project vertices
        const projected = vertices.map(v => {
            // Y rotation
            const x1 = v.x * cosY - v.z * sinY;
            const z1 = v.x * sinY + v.z * cosY;
            // X rotation
            const y2 = v.y * cosX - z1 * sinX;
            const z2 = v.y * sinX + z1 * cosX;

            const scale = fov / (fov + z2);
            return {
                x: cx + x1 * scale,
                y: cy + y2 * scale,
                z: z2,
                scale: scale
            };
        });

        // 4. Render Constellation Connecting Wireframe Edges
        ctx.save();
        edges.forEach(([i, j]) => {
            const p1 = projected[i];
            const p2 = projected[j];
            if (!p1 || !p2) return;

            const avgZ = (p1.z + p2.z) / 2;
            const depthAlpha = Math.max(0.2, Math.min(0.95, (avgZ + 180) / 360));

            ctx.strokeStyle = `rgba(0, 220, 255, ${depthAlpha * 0.78})`;
            ctx.lineWidth = depthAlpha > 0.6 ? 1.5 : 1.0;
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = depthAlpha > 0.55 ? 8 : 0;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        });
        ctx.shadowBlur = 0;

        // 5. Render Constellation Luminous Vertices (Nodes)
        projected.forEach(p => {
            const depthAlpha = Math.max(0.25, Math.min(1.0, (p.z + 180) / 360));
            const nodeSize = Math.max(1.5, 2.6 * p.scale);

            ctx.fillStyle = `rgba(0, 245, 255, ${depthAlpha * 0.95})`;
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, nodeSize, 0, Math.PI * 2);
            ctx.fill();

            if (depthAlpha > 0.6) {
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(p.x, p.y, nodeSize * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.shadowBlur = 0;
        ctx.restore();

        // 6. Render Floating / Dispersing Shard Cloud (Disintegration Effect)
        ctx.save();
        shards.forEach(s => {
            s.life++;
            if (s.life > s.maxLife) {
                resetShard(s);
            }

            s.x += s.vx;
            s.y += s.vy;
            s.z += s.vz;
            s.rot += s.vrot;

            const progress = s.life / s.maxLife;
            s.alpha = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8;

            const x1 = s.x * cosY - s.z * sinY;
            const z1 = s.x * sinY + s.z * cosY;
            const y2 = s.y * cosX - z1 * sinX;
            const z2 = s.y * sinX + z1 * cosX;

            const scale = fov / (fov + z2);
            const sx = cx + x1 * scale;
            const sy = cy + y2 * scale;

            if (s.alpha > 0) {
                ctx.save();
                ctx.translate(sx, sy);
                ctx.rotate(s.rot);
                ctx.fillStyle = `rgba(0, 230, 255, ${s.alpha * 0.85})`;
                ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha * 0.9})`;
                ctx.lineWidth = 0.9;
                ctx.shadowColor = '#00f2fe';
                ctx.shadowBlur = 8;

                const sz = s.size * scale;
                if (s.isTriangle) {
                    ctx.beginPath();
                    ctx.moveTo(0, -sz);
                    ctx.lineTo(sz * 0.86, sz * 0.6);
                    ctx.lineTo(-sz * 0.86, sz * 0.6);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, sz * 0.55, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
        });
        ctx.restore();
    }

    requestAnimationFrame(render);

    // -------------------------------------------------------------------------
    // 2. DYNAMIC REAL-TIME AUDIO EQUALIZER (Left visualizer)
    // -------------------------------------------------------------------------
    const eqCanvas = document.getElementById('heroEqCanvas');
    if (eqCanvas) {
        const eqCtx = eqCanvas.getContext('2d');
        let eqWidth = 0;
        let eqHeight = 0;

        function resizeEq() {
            const rect = eqCanvas.getBoundingClientRect();
            eqWidth = rect.width || 320;
            eqHeight = rect.height || 64;
            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            eqCanvas.width = Math.floor(eqWidth * ratio);
            eqCanvas.height = Math.floor(eqHeight * ratio);
            eqCtx.setTransform(1, 0, 0, 1, 0, 0);
            eqCtx.scale(ratio, ratio);
        }

        window.addEventListener('resize', resizeEq);
        window.addEventListener('load', resizeEq);
        resizeEq();

        const numBars = 34;
        const barHeights = new Float32Array(numBars);

        for (let i = 0; i < numBars; i++) {
            barHeights[i] = Math.random() * 0.4 + 0.2;
        }

        let eqTime = 0;
        function renderEq() {
            requestAnimationFrame(renderEq);
            eqTime += 0.045;

            eqCtx.clearRect(0, 0, eqWidth, eqHeight);

            const gap = 3;
            const barWidth = Math.max(3, (eqWidth / numBars) - gap);

            for (let i = 0; i < numBars; i++) {
                const wave1 = Math.sin(eqTime * 2.8 + i * 0.28);
                const wave2 = Math.cos(eqTime * 1.9 - i * 0.38);
                const wave3 = Math.sin(eqTime * 4.6 + i * 0.18) * 0.5;
                const target = Math.max(0.14, Math.min(0.95, (wave1 + wave2 + wave3 + 2.2) / 4.0));

                barHeights[i] += (target - barHeights[i]) * 0.16;

                const h = barHeights[i] * (eqHeight - 8);
                const x = i * (barWidth + gap);
                const y = eqHeight - h;

                const barGrad = eqCtx.createLinearGradient(0, y, 0, eqHeight);
                barGrad.addColorStop(0, '#00f2fe');
                barGrad.addColorStop(0.5, '#0072ff');
                barGrad.addColorStop(1, 'rgba(0, 114, 255, 0.15)');

                eqCtx.fillStyle = barGrad;
                eqCtx.shadowColor = '#00f2fe';
                eqCtx.shadowBlur = 6;
                eqCtx.fillRect(x, y, barWidth, h);

                // Peak cap
                eqCtx.fillStyle = '#ffffff';
                eqCtx.fillRect(x, y, barWidth, 2);
            }
            eqCtx.shadowBlur = 0;
        }
        requestAnimationFrame(renderEq);
    }

    // -------------------------------------------------------------------------
    // 3. INTERACTIVE MOOD MATRIX SOUNDSCAPE PREVIEW
    // -------------------------------------------------------------------------
    const moodPills = document.querySelectorAll('.mood-matrix-pill');
    const moodStatusText = document.getElementById('moodMatrixStatus');

    if (moodPills.length > 0) {
        moodPills.forEach(pill => {
            pill.addEventListener('click', function () {
                moodPills.forEach(p => p.classList.remove('active'));
                this.classList.add('active');

                const emotion = this.getAttribute('data-mood') || 'happy';
                const desc = this.getAttribute('data-desc') || '';
                if (moodStatusText) {
                    moodStatusText.innerHTML = `Vibe Synced: <strong>${emotion.toUpperCase()}</strong> — ${desc} &nbsp;&bull;&nbsp; <a href="music.html?emotion=${encodeURIComponent(emotion)}" style="color: #00f2fe; text-decoration: underline; font-weight: 700; margin-left: 6px;">Launch Mood Player &rarr;</a>`;
                }
            });
        });
    }

})();
