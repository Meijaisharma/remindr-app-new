import React from 'react';

// PRO-LEVEL ILLUSTRATOR ENGINE
// Uses SVG Filters for Soft Lighting, Specular Highlights, and Fabric Texture.

const h = React.createElement;
const uid = () => Math.random().toString(36).substr(2, 9);

// --- ADVANCED COLOR UTILS ---
function hexToRgb(hex: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function shade(color: string, percent: number) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

// --- GLOBAL FILTERS (The Secret Sauce) ---
export const AvatarFilters = () => h('defs', null,
    // 1. Soft Skin Glow (Subsurface Scattering)
    h('filter', { id: 'soft-glow', x: '-50%', y: '-50%', width: '200%', height: '200%' },
        h('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: '1.5', result: 'blur' }),
        h('feComposite', { in: 'SourceGraphic', in2: 'blur', operator: 'over' })
    ),
    // 2. Specular Shine (For Nose/Lips/Eyes)
    h('filter', { id: 'specular-shine' },
        h('feGaussianBlur', { in: 'SourceAlpha', stdDeviation: '2', result: 'blur' }),
        h('feSpecularLighting', { in: 'blur', surfaceScale: '3', specularConstant: '1', specularExponent: '20', lightingColor: '#white', result: 'specOut' },
            h('fePointLight', { x: '-500', y: '-1000', z: '400' })
        ),
        h('feComposite', { in: 'specOut', in2: 'SourceAlpha', operator: 'in', result: 'specOut' }),
        h('feComposite', { in: 'SourceGraphic', in2: 'specOut', operator: 'arithmetic', k1: '0', k2: '1', k3: '1', k4: '0' })
    ),
    // 3. Deep Shadows (Ambient Occlusion)
    h('filter', { id: 'deep-shadow', x: '-50%', y: '-50%', width: '200%', height: '200%' },
         h('feDropShadow', { dx: '0', dy: '4', stdDeviation: '5', floodColor: '#000', floodOpacity: '0.2' })
    ),
    // 4. Hair Texture (Noise)
    h('filter', { id: 'hair-noise' },
        h('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.8', numOctaves: '3', stitchTiles: 'stitch' }),
        h('feColorMatrix', { type: 'saturate', values: '0' }),
        h('feComponentTransfer', null, h('feFuncA', { type: 'table', tableValues: '0 0.2' }))
    )
);

export const AVATAR_ASSETS = {
  skinTones: ['#FFDFC4', '#E4B98E', '#C68642', '#8D5524', '#5D4037', '#3E2723'],

  body: {
    // REALISTIC ANATOMY - LEGS
    legs: (color: string) => {
        const dark = shade(color, -0.4);
        const mid = shade(color, -0.1);
        return h('g', { filter: 'url(#deep-shadow)' },
            // Left Leg
            h('path', { d: "M75,260 Q70,330 75,400 L95,400 Q105,330 100,260", fill: color }),
            h('path', { d: "M75,260 Q70,330 75,400", fill: "none", stroke: dark, strokeWidth: "15", opacity: "0.1" }), // Shading Side
            // Right Leg
            h('path', { d: "M125,260 Q130,330 125,400 L105,400 Q95,330 100,260", fill: color }),
            h('path', { d: "M125,260 Q130,330 125,400", fill: "none", stroke: dark, strokeWidth: "15", opacity: "0.1" }) // Shading Side
        );
    },

    // REALISTIC ANATOMY - ARMS & HANDS
    arms: (color: string) => {
        const shadow = shade(color, -0.3);
        const highlight = shade(color, 0.2);
        return h('g', null,
            // Left Arm (Relaxed)
            h('path', { d: "M55,160 Q45,200 40,240 L35,280", stroke: color, strokeWidth: "20", strokeLinecap: "round", fill: "none" }),
            h('path', { d: "M55,160 Q45,200 40,240 L35,280", stroke: shadow, strokeWidth: "20", strokeLinecap: "round", fill: "none", opacity: "0.2", transform: "translate(2,0)" }), // Muscle Shadow
            
            // Right Arm (Relaxed)
            h('path', { d: "M145,160 Q155,200 160,240 L165,280", stroke: color, strokeWidth: "20", strokeLinecap: "round", fill: "none" }),
            h('path', { d: "M145,160 Q155,200 160,240 L165,280", stroke: shadow, strokeWidth: "20", strokeLinecap: "round", fill: "none", opacity: "0.2", transform: "translate(-2,0)" }), // Muscle Shadow

            // Left Hand (Detailed Fingers)
            h('g', { transform: "translate(35, 280) rotate(10)" },
                h('path', { d: "M-10,-5 L10,-5 L8,25 L-8,25 Z", fill: color }), // Palm
                h('ellipse', { cx: "0", cy: "25", rx: "8", ry: "4", fill: color }), // Knuckles
                // Fingers
                h('path', { d: "M-8,25 L-9,40 Q-9,44 -6,44 L-5,25", fill: color }), // Pinky
                h('path', { d: "M-3,28 L-3,45 Q-3,48 0,48 L1,28", fill: color }), // Ring
                h('path', { d: "M2,28 L3,48 Q3,51 6,48 L5,28", fill: color }), // Middle
                h('path', { d: "M7,25 L9,42 Q10,45 12,42 L10,25", fill: color }), // Index
                h('path', { d: "M8,5 L16,12 Q19,10 16,4 L10,0", fill: color }) // Thumb
            ),

            // Right Hand
            h('g', { transform: "translate(165, 280) rotate(-10)" },
                h('path', { d: "M-10,-5 L10,-5 L8,25 L-8,25 Z", fill: color }), // Palm
                h('ellipse', { cx: "0", cy: "25", rx: "8", ry: "4", fill: color }), // Knuckles
                // Fingers
                h('path', { d: "M-8,25 L-9,40 Q-9,44 -6,44 L-5,25", fill: color }), 
                h('path', { d: "M-3,28 L-3,45 Q-3,48 0,48 L1,28", fill: color }), 
                h('path', { d: "M2,28 L3,48 Q3,51 6,48 L5,28", fill: color }), 
                h('path', { d: "M7,25 L9,42 Q10,45 12,42 L10,25", fill: color }), 
                h('path', { d: "M-8,5 L-16,12 Q-19,10 -16,4 L-10,0", fill: color }) 
            )
        );
    },

    // HEAD (The Star of the Show)
    head: (color: string, width: number, jaw: number, cheeks: number) => {
        const shadow = shade(color, -0.3);
        const blush = shade(color, -0.15); // Redder
        const highlight = shade(color, 0.2);
        
        // Morph Maths
        const w = (val: number) => val * 8; 
        const j = (val: number) => val * 10;
        const c = (val: number) => val * 6;

        return h('g', null,
            // 1. Neck (Muscular & Realistic)
            h('path', { d: "M70,120 Q65,160 55,170 L145,170 Q135,160 130,120", fill: shadow }),
            h('path', { d: "M80,130 L85,165", stroke: shade(color, -0.4), opacity: "0.1", strokeWidth: "3", filter: "url(#soft-glow)" }), // SCM Muscle
            h('path', { d: "M120,130 L115,165", stroke: shade(color, -0.4), opacity: "0.1", strokeWidth: "3", filter: "url(#soft-glow)" }),

            // 2. Head Shape (Complex Bezier for Realistic Jaw/Cheeks)
            h('path', { 
                d: `
                M${55 - w(width)},60 
                C${55 - w(width)},10, ${145 + w(width)},10, ${145 + w(width)},60 
                C${145 + w(width)},105, ${135 + c(cheeks)},${115}, ${100},${135 + j(jaw)} 
                C${65 - c(cheeks)},${115}, ${55 - w(width)},105, ${55 - w(width)},60
                `, 
                fill: color,
                filter: "url(#specular-shine)" // Gives the "3D" sheen
            }),
            
            // 3. Realistic Ears
            h('path', { d: "M45,90 C35,85 35,115 52,115", fill: color }),
            h('path', { d: "M48,95 Q42,100 48,105", fill: "none", stroke: shadow, opacity: "0.3" }), // Inner Ear Detail
            h('path', { d: "M155,90 C165,85 165,115 148,115", fill: color }),
            h('path', { d: "M152,95 Q158,100 152,105", fill: "none", stroke: shadow, opacity: "0.3" }),

            // 4. Nose (3D Sculpture)
            h('path', { d: "M94,85 Q100,82 106,85 L110,105 Q100,112 90,105 Z", fill: shadow, opacity: "0.15", filter: "url(#soft-glow)" }), // Shadow structure
            h('path', { d: "M92,104 Q100,112 108,104", stroke: shadow, fill: "none", strokeWidth: "1.5", opacity: "0.4" }), // Nostrils
            h('ellipse', { cx: "100", cy: "98", rx: "3", ry: "8", fill: highlight, opacity: "0.3", filter: "url(#soft-glow)" }), // Bridge Highlight

            // 5. Lips (Realistic Volume)
            h('g', { transform: "translate(0, 5)" },
                h('path', { d: "M88,115 Q100,112 112,115", stroke: "#CF8676", strokeWidth: "3", fill: "none", filter: "url(#soft-glow)" }), // Upper Lip
                h('path', { d: "M88,115 Q100,122 112,115", stroke: "#BCAAA4", strokeWidth: "2", fill: "none", opacity: "0.6" }) // Lower Lip Shadow
            ),

            // 6. Cheeks (Subtle Blush)
            h('ellipse', { cx: "75", cy: "105", rx: "10", ry: "6", fill: "#FF0000", opacity: "0.08", filter: "url(#soft-glow)" }),
            h('ellipse', { cx: "125", cy: "105", rx: "10", ry: "6", fill: "#FF0000", opacity: "0.08", filter: "url(#soft-glow)" })
        );
    }
  },

  eyes: {
    // HIGH-END 3D EYES (Reflective, Depth)
    realistic: h('g', null,
        // Left Eye
        h('g', { transform: "translate(0, 0)" },
            h('path', { d: "M70,90 Q80,82 92,90 Q80,98 70,90 Z", fill: "#FFF" }), // Sclera
            h('defs', null,
                h('radialGradient', { id: 'iris-grad' },
                    h('stop', { offset: '0%', stopColor: '#4E342E' }),
                    h('stop', { offset: '80%', stopColor: '#3E2723' }),
                    h('stop', { offset: '100%', stopColor: '#1a1a1a' })
                )
            ),
            h('circle', { cx: "81", cy: "90", r: "4.5", fill: "url(#iris-grad)" }), // Iris
            h('circle', { cx: "81", cy: "90", r: "2", fill: "#000" }), // Pupil
            h('circle', { cx: "82.5", cy: "88.5", r: "1.5", fill: "#FFF", opacity: "0.9" }), // Major Highlight
            h('circle', { cx: "79", cy: "92", r: "0.8", fill: "#FFF", opacity: "0.4" }), // Minor Highlight
            h('path', { d: "M68,88 Q80,80 94,88", fill: "none", stroke: "#3E2723", strokeWidth: "1", opacity: "0.3" }), // Crease
            h('path', { d: "M68,88 Q80,84 94,88", fill: "none", stroke: "#000", strokeWidth: "1.5" }) // Eyelashes
        ),
        // Right Eye
        h('g', { transform: "translate(38, 0)" },
            h('path', { d: "M70,90 Q80,82 92,90 Q80,98 70,90 Z", fill: "#FFF" }), 
            h('circle', { cx: "81", cy: "90", r: "4.5", fill: "url(#iris-grad)" }),
            h('circle', { cx: "81", cy: "90", r: "2", fill: "#000" }), 
            h('circle', { cx: "82.5", cy: "88.5", r: "1.5", fill: "#FFF", opacity: "0.9" }),
            h('circle', { cx: "79", cy: "92", r: "0.8", fill: "#FFF", opacity: "0.4" }),
            h('path', { d: "M68,88 Q80,80 94,88", fill: "none", stroke: "#3E2723", strokeWidth: "1", opacity: "0.3" }),
            h('path', { d: "M68,88 Q80,84 94,88", fill: "none", stroke: "#000", strokeWidth: "1.5" })
        ),
        // Natural Brows
        h('path', { d: "M68,84 Q78,78 94,84", stroke: "#222", strokeWidth: "3.5", strokeLinecap: "round", fill: "none", filter: "url(#soft-glow)" }),
        h('path', { d: "M106,84 Q122,78 132,84", stroke: "#222", strokeWidth: "3.5", strokeLinecap: "round", fill: "none", filter: "url(#soft-glow)" })
    ),
  },

  hair: {
    // 1. Dreads (Complex Strands)
    dreads: (color: string) => {
        const dark = shade(color, -0.4);
        const light = shade(color, 0.3);
        return h('g', { filter: "url(#deep-shadow)" },
           // Base Volume
           h('path', { d: "M50,70 C40,120 35,140 40,160 L160,160 C165,140 160,120 150,70 C150,20 50,20 50,70", fill: dark }),
           // Individual Dreads with Lighting
           Array.from({length: 12}).map((_, i) => {
               const x = 45 + (i * 10);
               const curve = i % 2 === 0 ? 10 : -10;
               return h('g', { key: i },
                  h('path', { d: `M${x},55 Q${x + curve},100 ${x},150`, stroke: color, strokeWidth: "8", fill: "none", strokeLinecap: "round" }),
                  h('path', { d: `M${x},55 Q${x + curve},100 ${x},150`, stroke: light, strokeWidth: "2", fill: "none", opacity: "0.3", strokeDasharray: "4 4" }) // Texture
               );
           })
        );
    },
    // 2. Curtains (K-Pop style)
    curtains: (color: string) => {
        const dark = shade(color, -0.3);
        const light = shade(color, 0.4);
        return h('g', { filter: "url(#deep-shadow)" },
           // Back Hair
           h('path', { d: "M45,70 C45,110 50,130 60,130 L140,130 C150,130 155,110 155,70 C155,30 45,30 45,70", fill: dark }),
           // Front Bangs Left
           h('path', { d: "M100,45 C80,45 60,50 50,90 C45,110 55,100 65,90 C80,75 90,60 100,45", fill: color }),
           h('path', { d: "M60,60 Q70,70 80,60", stroke: light, strokeWidth: "2", fill: "none", opacity: "0.2" }), // Shine
           // Front Bangs Right
           h('path', { d: "M100,45 C120,45 140,50 150,90 C155,110 145,100 135,90 C120,75 110,60 100,45", fill: color }),
           h('path', { d: "M140,60 Q130,70 120,60", stroke: light, strokeWidth: "2", fill: "none", opacity: "0.2" })
        );
    },
    // 3. Short (Textured)
    short: (color: string) => {
        const light = shade(color, 0.4);
        return h('g', null,
            h('path', { d: "M55,70 C55,30, 145,30, 145,70 L145,95 L142,75 L58,75 L55,95 Z", fill: color }),
            h('path', { d: "M55,70 C55,30, 145,30, 145,70", fill: "none", stroke: light, strokeWidth: "2", opacity: "0.3", strokeDasharray: "10 10" }) // Texture
        );
    }
  },

  tops: {
    // 1. Black T-Shirt (Realistic Cloth Folds)
    blackTee: h('g', { filter: "url(#deep-shadow)" },
       h('path', { d: "M50,150 Q40,180 30,220 L55,230 L70,170 L130,170 L145,230 L170,220 Q160,180 150,150 Q100,170 50,150", fill: "#212121" }), // Sleeves
       h('path', { d: "M55,160 L55,270 L145,270 L145,160", fill: "#262626" }), // Body
       // Folds
       h('path', { d: "M55,160 Q70,220 55,270", fill: "none", stroke: "#000", opacity: "0.2", strokeWidth: "5" }),
       h('path', { d: "M145,160 Q130,220 145,270", fill: "none", stroke: "#000", opacity: "0.2", strokeWidth: "5" }),
       h('path', { d: "M30,220 L55,230", stroke: "#000", strokeWidth: "2", opacity: "0.3" }) // Sleeve hem
    ),

    // 2. Green/Purple Striped Shirt (Baggy Fit)
    stripedShirt: h('g', { filter: "url(#deep-shadow)" },
       // Clip Path for stripes
       h('defs', null,
           h('clipPath', { id: 'baggy-shirt' },
              h('path', { d: "M45,155 Q35,190 25,225 L55,235 L70,170 L130,170 L145,235 L175,225 Q165,190 155,155 Q100,175 45,155 V275 H155 V155" })
           )
       ),
       h('g', { clipPath: 'url(#baggy-shirt)' },
          h('rect', { x: 0, y: 0, width: 200, height: 400, fill: "#7C4DFF" }), // Purple
          Array.from({length: 6}).map((_, i) => 
            h('path', { key: i, d: `M0,${160 + (i*25)} Q100,${170 + (i*25)} 200,${160 + (i*25)}`, stroke: "#00C853", strokeWidth: "12", fill: "none" })
          )
       ),
       // Baggy Folds
       h('path', { d: "M60,180 Q80,220 60,260", stroke: "#000", opacity: "0.1", strokeWidth: "3", fill: "none" }),
       h('path', { d: "M140,180 Q120,220 140,260", stroke: "#000", opacity: "0.1", strokeWidth: "3", fill: "none" }),
       // White Undershirt
       h('path', { d: "M25,225 L20,240 L50,250 L55,235", fill: "#EEE" }),
       h('path', { d: "M175,225 L180,240 L150,250 L145,235", fill: "#EEE" })
    ),

    // 3. Monster Hoodie
    monsterHoodie: h('g', { filter: "url(#deep-shadow)" },
       h('path', { d: "M45,150 L25,220 L50,230 L70,160 L130,160 L150,230 L175,220 L155,150", fill: "#1B5E20" }),
       h('path', { d: "M50,150 L50,270 L150,270 L150,150", fill: "#2E7D32" }),
       // Graphic
       h('g', { opacity: "0.9" },
         h('path', { d: "M85,190 Q100,180 115,190 L110,240 Q100,250 90,240 Z", fill: "#000" }),
         h('circle', { cx: "92", cy: "205", r: "5", fill: "#FFEB3B", filter: "url(#soft-glow)" }),
         h('circle', { cx: "108", cy: "205", r: "5", fill: "#FFEB3B", filter: "url(#soft-glow)" })
       ),
       // Strings
       h('path', { d: "M90,165 L90,200", stroke: "#FFF", strokeWidth: "2" }),
       h('path', { d: "M110,165 L110,200", stroke: "#FFF", strokeWidth: "2" })
    )
  },

  bottoms: {
    jeans: h('g', null,
       h('path', { d: "M60,260 L55,410 L95,410 L98,280 L102,280 L105,410 L145,410 L140,260 Z", fill: "#1565C0" }),
       h('path', { d: "M60,260 L55,410", stroke: "#0D47A1", strokeWidth: "2", fill: "none" }), // Seam
       h('path', { d: "M140,260 L145,410", stroke: "#0D47A1", strokeWidth: "2", fill: "none" })  // Seam
    ),
    cargos: h('g', null,
       h('path', { d: "M55,260 L50,400 L95,400 L98,280 L102,280 L105,400 L150,400 L145,260 Z", fill: "#5D4037" }),
       h('rect', { x: 45, y: 310, width: 12, height: 35, rx: 2, fill: "#4E342E", stroke: "#3E2723" }), // Pocket
       h('rect', { x: 143, y: 310, width: 12, height: 35, rx: 2, fill: "#4E342E", stroke: "#3E2723" })  // Pocket
    )
  },

  shoes: {
    converseWhite: h('g', { filter: "url(#deep-shadow)" },
       h('path', { d: "M55,390 L45,420 L75,430 L85,420 L80,390", fill: "#FFF", stroke: "#EEE" }),
       h('path', { d: "M145,390 L155,420 L125,430 L115,420 L120,390", fill: "#FFF", stroke: "#EEE" }),
       h('path', { d: "M45,420 L75,430 L75,435 L45,425 Z", fill: "#E0E0E0" }),
       h('path', { d: "M155,420 L125,430 L125,435 L155,425 Z", fill: "#E0E0E0" })
    ),
    leatherBoots: h('g', { filter: "url(#deep-shadow)" },
       h('path', { d: "M55,390 L45,420 L75,430 L85,420 L80,390", fill: "#5D4037" }),
       h('path', { d: "M145,390 L155,420 L125,430 L115,420 L120,390", fill: "#5D4037" }),
       h('path', { d: "M60,395 L75,415", stroke: "#8D6E63", strokeWidth: "2" })
    )
  }
};
