(function () {
    'use strict';

    var game=window.DKGame,net=window.DKNet;
    var mode='local',classId='independent',starter=null,rooms=[],roster=[],room=null,snapshotHz=30;
    var colors=['#e74c3c','#3498db','#2ecc71','#f1c40f'];
    var names={melee:'MELEE',gunner:'GUNNER / ARCHER',magic:'MAGIC',independent:'INDEPENDENT'};
    function byId(id){return window.document&&window.document.getElementById(id);}
    function tr(value){return window.DKI18n&&typeof window.DKI18n.t==='function'?window.DKI18n.t(value):value;}
    function show(id){['start-screen','class-screen','room-screen','waiting-screen'].forEach(function(key){byId(key).style.display=key===id?'flex':'none';});if(document.body)document.body.setAttribute('data-ui-screen',id.replace('-screen',''));if(id==='start-screen'&&window.DKUI)window.DKUI.showMainMenu();}
    function limitGraphemes(value,max){if(typeof Intl!=='undefined'&&Intl.Segmenter){var parts=Array.from(new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(value),function(part){return part.segment;});return parts.slice(0,max).join('');}return Array.from(value).slice(0,max).join('');}
    function cleanPlayerName(value){value=String(value||'KNIGHT');if(value.normalize)value=value.normalize('NFC');try{value=value.replace(/[^\p{L}\p{M}\p{N} _-]/gu,'');}catch(error){value=value.replace(/[^a-z0-9 _\-\u0E00-\u0E7F\u3040-\u30FF\u3400-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]/gi,'');}value=limitGraphemes(value.trim(),16);return value||'KNIGHT';}
    function safeName(){var field=byId('player-name-input'),value=cleanPlayerName(field.value);field.value=value;try{localStorage.setItem('dungeonKnightPlayerName',value);}catch(error){}return value;}
    function editorBundle(){return null;}
    function shareEditorCatalog(){return false;}
    function rollStarter(){starter=game.rollStarter(classId);byId('starter-preview').textContent=starter.name+' · '+starter.category;byId('starter-preview').style.color=starter.color;}
    function chooseClass(id){classId=id;document.querySelectorAll('.class-card').forEach(function(card){card.classList.toggle('selected',card.getAttribute('data-class')===id);});rollStarter();if(window.DKAudio)window.DKAudio.play('ui.class');}
    function beginClass(nextMode){mode=nextMode;chooseClass(classId);byId('class-confirm-btn').textContent=mode==='local'?'CONTINUE':'MULTIPLAYER ROOMS';show('class-screen');}
    function localRoster(name){return[{id:'local',slot:0,name:name,meta:{classId:classId,starterId:starter.id}}];}
    function enterWaiting(nextRoom,nextRoster){room=nextRoom||null;roster=(nextRoster||[]).slice(0,4);var state=net&&net.state?net.state():{},name=safeName(),role=mode==='local'?'local':state.role,peerId=mode==='local'?'local':state.peerId,me=roster.find(function(entry){return entry.id===peerId;})||{slot:0};snapshotHz=30;game.configureNetwork({role:role,peerId:peerId,name:name,roster:roster,snapshotHz:30});game.enterLobby({role:role,peerId:peerId,name:name,classId:classId,starterId:starter.id,slot:me.slot||0,roster:roster,snapshotHz:30});byId('waiting-title').textContent=mode==='local'?'Single Player':'Multiplayer';byId('room-code-line').textContent=mode==='local'?'Ready':'Room '+(nextRoom&&nextRoom.id||state.roomId||'------')+' · 30 Hz · '+(role==='host'?'Host':'Waiting for host');byId('launch-run-btn').disabled=role==='guest';byId('launch-run-btn').textContent=role==='guest'?'Waiting for host':'Start';renderWaiting();if(window.DKUI&&window.DKUI.setWaitingUiHidden)window.DKUI.setWaitingUiHidden(false);show('waiting-screen');setNetworkLabel();}
    function renderWaiting(){var node=byId('waiting-party');node.textContent='';(roster.length?roster:localRoster(safeName())).forEach(function(member){var card=document.createElement('div'),meta=member.meta||{},dot=document.createElement('i'),copy=document.createElement('div'),name=document.createElement('strong'),detail=document.createElement('span');card.className='waiting-member';dot.style.background=colors[member.slot]||colors[3];name.textContent=(member.slot+1)+'P · '+member.name;detail.textContent=(names[meta.classId]||'INDEPENDENT')+' · '+((game.classData().find(function(item){return item.id===meta.classId;})||{}).pool&&meta.starterId?meta.starterId.replace(/([A-Z])/g,' $1').toUpperCase():'COMMON STARTER');copy.appendChild(name);copy.appendChild(detail);card.appendChild(dot);card.appendChild(copy);node.appendChild(card);});for(var i=roster.length||1;i<4;i++){var empty=document.createElement('div');empty.className='waiting-member empty';empty.textContent=(i+1)+'P · OPEN SLOT';node.appendChild(empty);}}
    function setSignal(text,state){var node=byId('signal-state');if(!node)return;node.textContent=text;node.setAttribute('data-state',state||'');}
    var lastConnection=null,cachedPing=0,lastPingRead=0;
    function setNetworkLabel(connection,refreshPing){
        var text=tr('LOCAL'),online=false,pill=byId('network-pill'),label=byId('network-text');if(!pill||!label)return;
        if(connection)lastConnection=connection;connection=connection||lastConnection;
        if(mode==='online'&&net){
            var state=net.state(),now=Date.now();online=state.online;
            if(refreshPing||!lastPingRead||now-lastPingRead>=5000){cachedPing=Math.max(0,Math.round(Number(state.rttMs)||Number(connection&&connection.rttMs)||Number(state.serverRttMs)||0));lastPingRead=now;}
            text=state.role==='host'?tr('HOST')+' · '+(connection&&connection.direct?connection.direct+' P2P':tr('RELAY READY')):state.role==='guest'?tr('GUEST')+' · '+(connection&&connection.direct?'P2P':tr('RELAY READY')):tr('ROOM SERVER');
            text+=' · '+(cachedPing?cachedPing+' ms':'-- ms');
        }
        label.textContent=text;pill.className=!online?'offline':connection&&connection.direct?'direct':'relay';
    }
    function renderRooms(){var list=byId('room-list');list.textContent='';var open=rooms.filter(function(entry){return entry.state==='waiting'&&entry.players<entry.maxPlayers;}),serverPing=net&&net.state?Math.max(0,Math.round(Number(net.state().serverRttMs)||0)):0;if(!open.length){var empty=document.createElement('div');empty.className='empty-room';empty.textContent='NO OPEN ROOMS';list.appendChild(empty);return;}open.forEach(function(entry){var row=document.createElement('div'),copy=document.createElement('div'),title=document.createElement('strong'),detail=document.createElement('span'),join=document.createElement('button');row.className='room-entry';title.textContent=entry.name;detail.textContent=entry.players+'/'+entry.maxPlayers+' PLAYERS · 30 HZ · '+(serverPing?serverPing+' MS SERVER':'PINGING SERVER')+' · '+entry.id;copy.appendChild(title);copy.appendChild(detail);join.className='menu-btn gate';join.textContent='JOIN';join.addEventListener('click',function(){setSignal('JOINING','busy');net.joinRoom(entry.id,{classId:classId,starterId:starter.id});});row.appendChild(copy);row.appendChild(join);list.appendChild(row);});}
    function returnToMenu(){if(mode==='online'&&net)net.leaveRoom();game.configureNetwork({role:'local',peerId:'local',name:safeName(),roster:[]});game.leaveToMenu();room=null;roster=[];mode='local';lastConnection=null;cachedPing=0;lastPingRead=0;setNetworkLabel();show('start-screen');}

    byId('local-mode-btn').addEventListener('click',function(){beginClass('local');});
    byId('online-mode-btn').addEventListener('click',function(){beginClass('online');});
    byId('class-back-btn').addEventListener('click',function(){show('start-screen');});
    document.querySelectorAll('.class-card').forEach(function(card){card.addEventListener('click',function(){chooseClass(card.getAttribute('data-class'));});});
    byId('class-confirm-btn').addEventListener('click',function(){
        if(!starter)rollStarter();var name=safeName();if(mode==='local'){enterWaiting(null,localRoster(name));return;}
        show('room-screen');setSignal('CONNECTING','busy');net.connect(name).then(function(){net.updatePresence({classId:classId,starterId:starter.id});net.listRooms();setSignal('ONLINE','online');setNetworkLabel();}).catch(function(error){setSignal('SERVER OFFLINE','error');byId('room-list').innerHTML='<div class="empty-room">'+error.message+'<br>START THE INCLUDED SERVER.MJS FIRST.</div>';});
    });
    byId('create-room-btn').addEventListener('click',function(){setSignal('CREATING','busy');snapshotHz=30;net.createRoom({classId:classId,starterId:starter.id},{snapshotHz:30});});
    byId('refresh-rooms-btn').addEventListener('click',function(){net.listRooms();});
    byId('room-back-btn').addEventListener('click',function(){net.leaveRoom();show('class-screen');});
    byId('leave-lobby-btn').addEventListener('click',returnToMenu);
    byId('launch-run-btn').addEventListener('click',function(){var state=mode==='online'?net.state():{role:'local'};if(state.role==='guest')return;game.startRun();});

    var prevRosterCount = 0;
    if(net){
        net.on('ready',function(){setSignal('ONLINE','online');setNetworkLabel();net.listRooms();});
        net.on('rooms',function(next){rooms=next||[];renderRooms();});
        net.on('room',function(event){room=event.room;roster=event.roster||[];prevRosterCount=roster.length;game.configureNetwork({role:event.role,peerId:net.state().peerId,name:safeName(),roster:roster});enterWaiting(room,roster);shareEditorCatalog();if(window.DKAudio)window.DKAudio.play('net.join');});
        net.on('roster',function(next){var nextLen=(next||[]).length;if(prevRosterCount&&nextLen>prevRosterCount&&window.DKAudio)window.DKAudio.play('net.join');else if(prevRosterCount&&nextLen<prevRosterCount&&window.DKAudio)window.DKAudio.play('net.leave');prevRosterCount=nextLen;roster=next||[];game.setRoster(roster);renderWaiting();shareEditorCatalog();});
        net.on('data',function(event){game.handleNetworkMessage(event.from,event.data);});
        net.on('connection',function(event){setNetworkLabel(event);});
        net.on('server-ping',function(){setNetworkLabel(lastConnection,true);renderRooms();});
        net.on('signal',function(event){setSignal(event.state==='connected'?'ONLINE':event.state.toUpperCase(),event.state);setNetworkLabel();});
        net.on('room-update',function(nextRoom){room=nextRoom;if(nextRoom.state==='run')byId('room-code-line').textContent='RUN IN PROGRESS · WAVE '+((nextRoom.meta&&nextRoom.meta.wave)||1);});
        net.on('host-left',function(){if(window.DKAudio)window.DKAudio.play('net.error');alert('The host left the co-op room.');returnToMenu();});
        net.on('error',function(error){if(window.DKAudio)window.DKAudio.play('net.error');setSignal((error.message||'NETWORK ERROR').toUpperCase(),'error');if(error.code==='HOST_LEFT')returnToMenu();});
    }

    try{byId('player-name-input').value=localStorage.getItem('dungeonKnightPlayerName')||'KNIGHT';}catch(error){}
    if(window.DK_STANDALONE_OFFLINE){var onlineButton=byId('online-mode-btn'),onlineNote=onlineButton&&onlineButton.querySelector('small');if(onlineButton){onlineButton.disabled=true;onlineButton.title='Use the multiplayer ZIP through its included server for online rooms.';}if(onlineNote)onlineNote.textContent='HOSTED ZIP REQUIRED';}
    window.setInterval(function(){if(mode==='online')setNetworkLabel(lastConnection,true);},5000);
    chooseClass('independent');setNetworkLabel();
}());
