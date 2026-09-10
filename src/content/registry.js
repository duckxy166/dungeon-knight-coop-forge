(function () {
    'use strict';
    var content = window.DKContent = {
        weapons: Object.create(null),
        models3d: { weapons:Object.create(null), players:Object.create(null), enemies:Object.create(null), projectiles:Object.create(null), effects:Object.create(null) },
        weaponAnimations: Object.create(null),
        weaponBehaviors: { ids: Object.create(null), families: Object.create(null), handlers: Object.create(null) },
        weaponRenderers: Object.create(null),
        projectileRenderers: Object.create(null),
        projectileOverlays: Object.create(null),
        projectileImpactRenderers: Object.create(null),
        projectileModels: Object.create(null),
        effectModels: Object.create(null),
        statusEffects: Object.create(null),
        slashRenderers: Object.create(null),
        weaponAuras: Object.create(null), signatureEnemies: Object.create(null),
        classes: Object.create(null), biomes: [], biomeArt: Object.create(null),
        bosses: Object.create(null), bossBehaviors: Object.create(null), enemies: Object.create(null), enemyVariants: Object.create(null), memories: Object.create(null),
        roomLayouts: [], resources: Object.create(null), recipes: [],
        stats: Object.create(null), activeSkills: Object.create(null), passiveSkills: Object.create(null),
        pacts: Object.create(null), supportArt: Object.create(null), loadedModules: []
    };
    function mark(name) { if (name && content.loadedModules.indexOf(name) < 0) content.loadedModules.push(name); }
    function replace(name, value, moduleName) { content[name] = value; mark(moduleName); return value; }
    window.DKAttackProfile = function (pose,duration,back,turn,lunge,lift,ghosts,accent,count,radius,phase) {
        return {pose:pose,duration:duration,back:back,turn:turn,lunge:lunge,lift:lift,ghosts:ghosts,accent:accent,count:count,radius:radius,phase:phase};
    };
    window.DKRegister = {
        model3d: function (kind, id, definition, moduleName) {
            if (!content.models3d[kind] || !id || !definition || !Array.isArray(definition.parts)) throw new Error('Invalid 3D model: ' + kind + '/' + id);
            if (definition.parts.length > 64 || definition.parts.some(function(part){return !part || ['size','position','rotation'].some(function(key){return part[key]!==undefined&&(!Array.isArray(part[key])||part[key].length!==3||part[key].some(function(n){return typeof n!=='number'||!isFinite(n);}));});})) throw new Error('3D parts require finite XYZ triples; at most 64 parts.');
            content.model3dRevision=(content.model3dRevision||0)+1;
            content.models3d[kind][id] = definition; mark(moduleName); return definition;
        },
        value: replace,
        weapons: function (definitions, animations, moduleName) {
            Object.keys(definitions || {}).forEach(function (id) { content.weapons[id] = definitions[id]; });
            Object.keys(animations || {}).forEach(function (id) { if (content.weapons[id]) content.weaponAnimations[id] = animations[id]; });
            mark(moduleName);
        },
        weaponBehavior: function (id, hooks, moduleName) { if (content.weapons[id] && hooks) content.weaponBehaviors.ids[id] = hooks; mark(moduleName); return hooks; },
        weaponFamilyBehavior: function (family, hooks, moduleName) { if (family && hooks) content.weaponBehaviors.families[family] = hooks; mark(moduleName); return hooks; },
        weaponHandlerBehavior: function (handler, hooks, moduleName) { if (handler && hooks) content.weaponBehaviors.handlers[handler] = hooks; mark(moduleName); return hooks; },
        weaponRenderer: function (id, renderer, moduleName) { if (content.weapons[id] && typeof renderer === 'function') content.weaponRenderers[id] = renderer; mark(moduleName); return renderer; },
        projectileRenderer: function (sourceId, renderer, moduleName) { if (sourceId && typeof renderer === 'function') content.projectileRenderers[sourceId] = renderer; mark(moduleName); return renderer; },
        projectileOverlay: function (sourceId, renderer, moduleName) { if (sourceId && typeof renderer === 'function') content.projectileOverlays[sourceId] = renderer; mark(moduleName); return renderer; },
        projectileImpactRenderer: function (sourceId, renderer, moduleName) { if (sourceId && typeof renderer === 'function') content.projectileImpactRenderers[sourceId] = renderer; mark(moduleName); return renderer; },
        projectileModel: function (id, definition, moduleName) { if (id && definition && typeof definition === 'object') content.projectileModels[id] = definition; mark(moduleName); return definition; },
        effectModel: function (id, definition, moduleName) { if (id && definition && typeof definition === 'object') content.effectModels[id] = definition; mark(moduleName); return definition; },
        statusEffect: function (id, definition, moduleName) { if (id && definition && typeof definition === 'object') content.statusEffects[id] = definition; mark(moduleName); return definition; },
        slashRenderer: function (sourceId, renderer, moduleName) { if (sourceId && typeof renderer === 'function') content.slashRenderers[sourceId] = renderer; mark(moduleName); return renderer; },
        weaponAura: function (id, renderer, moduleName) { if (content.weapons[id] && typeof renderer === 'function') content.weaponAuras[id] = renderer; mark(moduleName); return renderer; },
        bossBehavior: function (key, hooks, moduleName) { if (key && hooks) content.bossBehaviors[key] = hooks; mark(moduleName); return hooks; }
    };
}());
