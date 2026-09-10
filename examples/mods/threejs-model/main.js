// Add this main.js to a mod created with the in-game starter. No gameplay changes.
DK.register.model3d('weapons', 'rustPistol', {
    parts: [
        {shape:'box',size:[.6,.18,.18],position:[.25,0,0],color:'#73ced8'},
        {shape:'cylinder',size:[.08,.5,.08],position:[.65,0,0],rotation:[0,0,Math.PI/2],color:'#c5d2d6'},
        {shape:'box',size:[.1,.25,.1],position:[.08,-.16,0],color:'#303743'},
        {shape:'crystal',size:[.12,.18,.12],position:[.25,.16,0],color:'#a4f0e8',glow:true}
    ]
}, 'mod:threejs-model');
