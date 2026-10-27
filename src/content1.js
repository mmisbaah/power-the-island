/* ================= Mission content =================
   Ten authored missions per grade. IDs use game, grade and mission number and never change;
   presentation order can change after teacher review. All curriculum links are Proposed. */
const MISSIONS={};
const normSet=x=>x&&x.c?{connectors:clone(x.c),switches:{sw:x.sw||'closed'}}:x;
function mk(g,n,o){
  const id=`power-g${g}-${String(n).padStart(2,'0')}`;
  const p=clone(o.play);
  if(p.engine==='circuit') p.initial=normSet(o.play.initial);
  p.reqs=o.play.reqs; p.steps=o.play.steps;
  const fig=o.transfer.fig?Object.assign({},o.transfer.fig):null;
  if(fig&&fig.type==='circuit') fig.set=normSet(fig.set);
  MISSIONS[id]={id,grade:g,number:n,version:o.version||'1.0.0',title:o.t,concept:o.concept,goal:o.goal,scene:o.scene||'island',
    brief:o.brief,play:p,learned:o.learned,hints:o.hints,
    predict:{q:o.predict.q,options:o.predict.o.map(a=>({id:a[0],label:a[1],pic:a[2]})),reasons:(o.predict.r||[]).map(a=>({id:a[0],label:a[1]}))},
    explain:o.explain.map(q=>({q:q.q,options:q.o.map(O)})),
    transfer:{intro:o.transfer.intro,fig,qs:o.transfer.qs.map(q=>({q:q.q,tap:!!q.tap,options:q.o.map(O)}))}};
}
const SAFE=[['safe','Safe choice','adult'],['unsafe','Not safe','stop']];
const SAFE_T=[['safe','Safe choice'],['unsafe','Not safe']];

/* ---------- Grade 1 ---------- */
mk(1,1,{t:'What needs power',concept:'Devices that use electricity',goal:'Sort everyday things into ones that need electricity and ones that don’t.',scene:'classroom',
  brief:'Some things in the classroom need electricity to work. Some don’t. Let’s sort them.',
  predict:{q:'Does a hand fan need electricity?',o:[['yes','Yes, it does','fanOn'],['no','No, it doesn’t','handfan']]},
  play:{engine:'sort',instr:'Put each card in a group.',bins:[['elec','Needs electricity','lampOn'],['none','No electricity','hands']],
    items:[['lamp','Ceiling lamp','elec','It lights up when it is switched on.','lampOn'],['efan','Electric fan','elec','It spins when it is switched on.','fanOn'],['radio','Radio','elec','It needs a battery or electricity to make sound.','radio'],['torch','Torch','elec','Its battery gives it electricity.','torch'],['broom','Broom','none','You push it with your hands.','broom'],['hfan','Hand fan','none','It moves when you wave it.','handfan'],['pencil','Pencil','none','Your hand moves it.','pencil'],['scissors','Scissors','none','Your fingers open and close it.','scissors']]},
  explain:[{q:'How is the electric fan different from the hand fan?',o:[['elec','The electric fan needs electricity. The hand fan moves when you wave it.',1,'Yes. One uses electricity. One uses your hand.','fanOn'],['both','They both need electricity.',0,'Look at your groups. Where did you put the hand fan?','handfan'],['neither','Neither needs electricity.',0,'Look at your groups. Where did you put the electric fan?','hands']]}],
  transfer:{intro:'New things at the noticeboard.',fig:{type:'scene',key:'path'},qs:[{q:'Which one needs electricity?',o:[['bell','School bell',1,'Yes. An electric bell needs electricity to ring.','bell'],['book','Book',0,'A book works without electricity. Look for one you switch on.','book'],['broom','Broom',0,'You push a broom with your hands.','broom']]}]},
  hints:{play:['Ask: do we switch it on?','Things you move with your hands don’t need electricity.','Grown-up helper: point to each card and ask “Do we switch it on?”'],explain:['Look at your groups.','Where are the two fans?'],transfer:['Does it need to be switched on?','Electric things are switched on.']},
  learned:'Some things need electricity to work, like lamps and electric fans. Others work when we move them, like brooms and hand fans.'});

mk(1,2,{version:'2.0.0',t:'A light for the room',concept:'Cause and effect: a switch controls a lamp',goal:'Tap a switch and say whether the lamp is on or off.',scene:'classroom',
  brief:'The classroom is too dark to read. There is a switch on the wall. Let’s find out what it does.',
  predict:{q:'What will happen when you press the switch?',o:[['on','The lamp lights up','lampOn'],['off','The lamp stays dark','lampOff'],['fan','The fan spins','fanOn']]},
  play:{engine:'switch',device:'lamp',start:'open'},
  explain:[{q:'What made the lamp light up?',o:[['switch','I pressed the switch',1,'Yes. Pressing the switch turned the lamp on. Pressing it again turned it off.','switchOn'],['clap','I clapped my hands',0,'Did the lamp change when anyone clapped? Look at your pictures. What did you press?','hands'],['sun','The sun came out',0,'The window stayed the same. Look at your pictures. What did you press?','sun']]}],
  transfer:{intro:'A new place: the noticeboard path.',fig:{type:'switch',device:'path',sw:'open'},qs:[{q:'The switch is OFF. Is the path light on or off?',o:[['on','On',0,'Look at the switch. It points to OFF. What happened in the classroom when the switch was off?','lampOn'],['off','Off',1,'Yes. Switch off, light off. Press the switch to check.','lampOff']]}]},
  hints:{play:['Press the big switch, then look at the lamp.','When the lamp is on, you will see light rays around it.','Grown-up helper: press the switch together, then point at the lamp and say “on” or “off”.'],explain:['Think about what you did just before the lamp came on.','You pressed something on the wall.'],transfer:['Look at the switch. Is it on or off?','In the classroom, switch off meant lamp off.']},
  learned:'A switch can turn a lamp on and off. You watched the lamp to find out.'});

mk(1,3,{t:'Safe choices',concept:'Electrical hazards: keep away and tell an adult',goal:'Choose the safe thing to do after seeing a damaged cable.',scene:'path',
  brief:'On the way to school you see a cable with a broken cover. What should you do?',
  predict:{q:'What should you do first?',o:[['away','Keep away','stop'],['touch','Pick it up','hands']]},
  play:{engine:'sort',instr:'Is each choice safe or not safe?',bins:SAFE,
    items:[['away','Keep away from it','safe','Staying away keeps you safe.','stop'],['tell','Tell a grown-up you trust','safe','A grown-up can get help.','adult'],['touch','Touch the cable','unsafe','Damaged cables can hurt you.','cable'],['pick','Pick it up and move it','unsafe','Never touch a damaged cable.','hands'],['poke','Poke it with a stick','unsafe','Don’t poke it. Keep away.','wood'],['teacher','Tell your teacher','safe','Your teacher can get help.','adult']]},
  explain:[{q:'Why do we keep away and tell a grown-up?',o:[['help','A damaged cable can hurt us. A grown-up can get help.',1,'Yes. Keep away and tell a grown-up.','adult'],['fun','So we can play with it later.',0,'A damaged cable is never a toy. Look at your safe cards.','cable'],['nothing','It doesn’t matter what we do.',0,'It does matter. Look at your safe cards.','stop']]}],
  transfer:{intro:'At home, a lamp cable looks broken.',fig:{type:'scene',key:'classroom'},qs:[{q:'What is the safe choice?',o:[['tell','Keep away and tell a grown-up',1,'Yes. That is the safe choice everywhere.','adult'],['fix','Try to fix it',0,'Fixing cables is a grown-up job. What did you do on the path?','hands'],['touch','Touch it to check',0,'Never touch a damaged cable. What did you do on the path?','cable']]}]},
  hints:{play:['Ask: could this hurt me?','Touching a damaged cable is never safe.','Grown-up helper: say “keep away and tell a grown-up” together.'],explain:['Look at your safe cards.','Who can help?'],transfer:['Is this the same kind of danger?','Safe choices are the same everywhere.']},
  learned:'If you see a damaged cable, keep away and tell a grown-up you trust.'});

mk(1,4,{t:'Lights around the island',concept:'Electric lights and other lights',goal:'Sort lights into ones that use electricity and ones that don’t.',scene:'path',
  brief:'The island has lots of lights. Some use electricity. Some don’t.',
  predict:{q:'Does the sun need electricity to shine?',o:[['yes','Yes','lampOn'],['no','No','sun']]},
  play:{engine:'sort',instr:'Put each light in a group.',bins:[['elec','Uses electricity','lampOn'],['none','No electricity','sun']],
    items:[['lamp','Ceiling lamp','elec','It is switched on.','lampOn'],['torch','Torch','elec','It has a battery.','torch'],['path','Path light','elec','It is switched on at night.','pathlight'],['sun','Sun','none','The sun shines by itself.','sun'],['candle','Candle','none','It burns. No electricity is used.','candle']]},
  explain:[{q:'Which light is NOT electric?',o:[['sun','The sun',1,'Yes. The sun shines without electricity.','sun'],['torch','The torch',0,'The torch has a battery. Look at your groups.','torch'],['lamp','The ceiling lamp',0,'The lamp is switched on. Look at your groups.','lampOn']]}],
  transfer:{intro:'Night on the beach.',fig:{type:'scene',key:'pathLit'},qs:[{q:'Which light uses electricity?',o:[['path','Path light',1,'Yes. It is switched on.','pathlight'],['candle','Candle',0,'A candle burns. It doesn’t use electricity.','candle'],['sun','Sun',0,'The sun doesn’t use electricity.','sun']]}]},
  hints:{play:['Ask: is it switched on?','Lamps and torches are switched on.','Grown-up helper: ask “Does it have a switch?” for each card.'],explain:['Look at your groups.','Which light has no switch?'],transfer:['Which one has a switch?','Switched lights use electricity.']},
  learned:'Lamps, torches and path lights use electricity. The sun and a candle give light without electricity.'});

mk(1,5,{t:'Turn on the fan',concept:'A switch controls a fan',goal:'Press a switch and say whether the fan is spinning or still.',scene:'classroom',
  brief:'It is hot in the classroom. There is a desk fan and a switch. Let’s find out what the switch does.',
  predict:{q:'What will happen when you press the switch?',o:[['spin','The fan spins','fanOn'],['still','The fan stays still','fan'],['light','A light comes on','lampOn']]},
  play:{engine:'switch',device:'fan',start:'open'},
  explain:[{q:'What made the fan spin?',o:[['switch','I pressed the switch',1,'Yes. The switch turned the fan on and off.','switchOn'],['wind','The wind blew it',0,'The window was shut. What did you press?','window'],['hand','I pushed it with my hand',0,'You didn’t touch the fan. What did you press?','hands']]}],
  transfer:{intro:'Back in the dark classroom.',fig:{type:'switch',device:'lamp',sw:'closed'},qs:[{q:'The lamp switch is ON. Is the lamp on or off?',o:[['on','On',1,'Yes. Switch on, lamp on.','lampOn'],['off','Off',0,'Look at the switch. It points to ON.','lampOff']]}]},
  hints:{play:['Press the switch, then look at the fan.','A spinning fan has wavy lines next to it.','Grown-up helper: press the switch together and point at the fan.'],explain:['What did you press?','The switch is on the wall.'],transfer:['Is the switch on or off?','Switch on means the thing works.']},
  learned:'A switch can turn a fan on and off, just like a lamp.'});

mk(1,6,{t:'Light, sound or movement',concept:'What electric devices do',goal:'Sort devices by what they give us: light, sound or movement.',scene:'classroom',
  brief:'Electric things do different jobs. Some give light. Some make sound. Some move.',
  predict:{q:'What does a radio give us?',o:[['light','Light','lampOn'],['sound','Sound','radio'],['move','Movement','toycar']]},
  play:{engine:'sort',instr:'What does each one give us?',bins:[['light','Light','lampOn'],['sound','Sound','bell'],['move','Movement','toycar']],
    items:[['lamp','Lamp','light','It lights the room.','lampOn'],['torch','Torch','light','It lights the path.','torch'],['radio','Radio','sound','We hear it.','radio'],['bell','School bell','sound','It rings.','bell'],['fan','Fan','move','Its blades spin.','fanOn'],['car','Toy car','move','It drives along.','toycar']]},
  explain:[{q:'What does an electric fan give us?',o:[['move','Movement. Its blades spin.',1,'Yes. The fan gives movement.','fanOn'],['sound','Sound only',0,'Look at your groups. Where did you put the fan?','bell'],['light','Light',0,'Look at your groups. Where did you put the fan?','lampOn']]}],
  transfer:{intro:'A new thing in the classroom.',fig:{type:'scene',key:'classroom'},qs:[{q:'A television shows pictures. What does it give us?',o:[['light','Light (and sound)',1,'Yes. The screen gives light so we see pictures, and it makes sound too.','tv'],['move','Movement',0,'The TV doesn’t move. Look at the screen.','toycar'],['none','Nothing',0,'Look at the bright screen.','stop']]}]},
  hints:{play:['Ask: do we see it, hear it, or watch it move?','Lights help us see. Bells help us hear.','Grown-up helper: act out each one together: shine, ring, spin.'],explain:['Look at your groups.','What do the blades do?'],transfer:['What do you see on a TV?','A bright screen gives light.']},
  learned:'Electric things give us light, sound or movement.'});

mk(1,7,{t:'Switch it off',concept:'Saving energy',goal:'Choose habits that save energy.',scene:'classroom',
  brief:'Lights and fans use electricity. When nobody needs them, we can switch them off.',
  predict:{q:'Nobody is in the room. The lights are on. Is that good?',o:[['good','Good','lampOn'],['waste','Wasting energy','lampOff']]},
  play:{engine:'sort',instr:'Does each choice save or waste energy?',bins:[['save','Saves energy','switchOff'],['waste','Wastes energy','lampOn']],
    items:[['emptylights','Lights on in an empty room','waste','Nobody needs the light.','lampOn'],['offout','Lights off when we go out','save','No electricity is used.','lampOff'],['emptyfan','Fan on, nobody there','waste','Nobody feels the air.','fanOn'],['torchoff','Torch off after use','save','The battery lasts longer.','torch'],['tv','TV on, nobody watching','waste','Nobody sees it.','tv'],['window','Open the blinds for daylight','save','Sunlight lights the room.','window']]},
  explain:[{q:'Why switch off the lights when we leave?',o:[['save','Nobody needs them, so we save energy.',1,'Yes. Switching off saves energy.','switchOff'],['dark','Rooms should always be dark.',0,'We use lights when we need them. When do we not need them?','lampOff'],['broken','The lights will break.',0,'They won’t break. Look at your groups.','stop']]}],
  transfer:{intro:'Break time at the noticeboard.',fig:{type:'scene',key:'classroomLit'},qs:[{q:'Everyone goes out to play. What can a grown-up do?',o:[['off','Switch off the lights',1,'Yes. That saves energy.','switchOff'],['on','Leave them on',0,'Is anyone using them?','lampOn'],['more','Switch on more lights',0,'Is anyone using them?','lampOn']]}]},
  hints:{play:['Ask: is anybody using it?','If nobody is using it, it wastes energy.','Grown-up helper: ask “Who needs this right now?”'],explain:['Who needs the lights?','Look at your saves-energy group.'],transfer:['Is anyone in the room?','Empty room means switch off.']},
  learned:'When nobody needs a light or a fan, switching it off saves energy.'});

mk(1,8,{t:'Need a lamp?',concept:'When we need electric light',goal:'Sort times when we need a lamp and times when daylight is enough.',scene:'path',
  brief:'Sometimes it is bright. Sometimes it is dark. When do we need a lamp?',
  predict:{q:'Do we need a lamp at sunny playtime?',o:[['yes','Yes','lampOn'],['no','No','sun']]},
  play:{engine:'sort',instr:'Do we need a lamp?',bins:[['need','Need a lamp','lampOn'],['no','No lamp needed','sun']],
    items:[['night','Reading at night','need','It is dark.','moon'],['play','Sunny playtime','no','The sun is bright.','sun'],['path','Dark path after sunset','need','We need to see the path.','pathlight'],['morning','Bright morning lesson','no','Daylight comes in.','window']]},
  explain:[{q:'When do we need a lamp?',o:[['dark','When it is dark',1,'Yes. Lamps help us see in the dark.','moon'],['always','All the time',0,'Look at your sunny cards.','sun'],['never','Never',0,'Look at your night cards.','moon']]}],
  transfer:{intro:'A rainy, dark afternoon.',fig:{type:'scene',key:'classroom'},qs:[{q:'The classroom is too dark to read. Do we need the lamp?',o:[['yes','Yes',1,'Yes. When it is too dark, a lamp helps.','lampOn'],['no','No',0,'Can you read in the dark?','sun']]}]},
  hints:{play:['Ask: is it dark or bright?','Dark times need a lamp.','Grown-up helper: ask “Can we see?” for each card.'],explain:['Look at your two groups.','When could you not see?'],transfer:['Is it bright or dark?','Too dark means we need a lamp.']},
  learned:'We need a lamp when it is dark. When the sun is bright, daylight is enough.'});

mk(1,9,{t:'Torch story',concept:'Cause and effect in order',goal:'Put the torch story in order: what happens first, next and last.',scene:'path',
  brief:'It is dark on the path. You have a torch. What happens when you use it?',
  predict:{q:'What happens first?',o:[['press','You press the switch','switchOn'],['see','You see the path','eye']]},
  play:{engine:'sequence',instr:'Tap the cards in order.',cards:[['press','Press the switch','switchOn'],['lights','The torch lights up','torchOn'],['shine','Light shines on the path','pathlight'],['see','We see the path','eye']]},
  explain:[{q:'Why could we see the path?',o:[['torch','The torch light shone on it',1,'Yes. The light from the torch helped us see.','torchOn'],['eyes','We closed our eyes',0,'Look at your story. What shone on the path?','eye'],['moon','The moon came out',0,'Look at your story. What shone on the path?','moon']]}],
  transfer:{intro:'A new story in the classroom.',fig:{type:'scene',key:'classroom'},qs:[{q:'What happens right after you press the lamp switch?',o:[['lamp','The lamp lights up',1,'Yes. Same order as the torch.','lampOn'],['see','You can see the book first',0,'What has to happen before you can see?','book'],['nothing','Nothing ever happens',0,'Think about the torch story.','stop']]}]},
  hints:{play:['What do you do first?','You press before it lights.','Grown-up helper: act out the story with a pretend torch.'],explain:['Look at your story.','What came out of the torch?'],transfer:['Think about the torch story.','Press, then light.']},
  learned:'First we press the switch, then the light comes on, then we can see.'});

mk(1,10,{t:'Water and electricity',concept:'Keep water away from electric things',goal:'Choose safe ways to keep water away from electric things.',scene:'classroom',
  brief:'Water and electricity don’t mix. Let’s find the safe choices.',
  predict:{q:'Is it safe to splash water near a fan?',o:[['safe','Safe','fanOn'],['unsafe','Not safe','water']]},
  play:{engine:'sort',instr:'Is each choice safe or not safe?',bins:SAFE,
    items:[['drinks','Keep drinks away from the radio','safe','Water stays away from it.','radio'],['splash','Splash water near the fan','unsafe','Water and electric things don’t mix.','water'],['tell','Tell a grown-up if a device gets wet','safe','A grown-up can help.','adult'],['wet','Use a wet torch','unsafe','Let a grown-up check it first.','torch']]},
  explain:[{q:'What do we do if an electric thing gets wet?',o:[['tell','Tell a grown-up and don’t touch it',1,'Yes. Let a grown-up help.','adult'],['dry','Keep using it',0,'Look at your safe cards.','water'],['shake','Shake it hard',0,'Look at your safe cards.','hands']]}],
  transfer:{intro:'At home, the TV is near a fish tank.',fig:{type:'scene',key:'classroom'},qs:[{q:'Water spills near the TV. What is the safe choice?',o:[['tell','Keep away and tell a grown-up',1,'Yes. A grown-up can help safely.','adult'],['wipe','Wipe the TV yourself',0,'Let a grown-up help. What did your safe cards say?','hands'],['ignore','Keep watching',0,'Tell a grown-up.','tv']]}]},
  hints:{play:['Ask: is water near something electric?','Water near electric things is not safe.','Grown-up helper: say “water away, tell a grown-up” together.'],explain:['Look at your safe cards.','Who can help?'],transfer:['Is water near something electric?','Tell a grown-up.']},
  learned:'Keep water away from electric things. If something electric gets wet, tell a grown-up.'});

/* ---------- Grade 2 ---------- */
mk(2,1,{t:'Source or reflector',concept:'Light sources and reflected light',goal:'Tell things that make light from things that only reflect it.',scene:'path',
  brief:'Some things make their own light. Others only bounce light back. Let’s sort them.',
  predict:{q:'Does the moon make its own light?',o:[['yes','Yes','moon'],['no','No, it reflects sunlight','sun']]},
  play:{engine:'sort',instr:'Does it make light or reflect light?',bins:[['source','Makes light','torchOn'],['reflect','Reflects light','mirror']],
    items:[['torch','Lit torch','source','It makes its own light.','torchOn'],['sun','Sun','source','It makes its own light.','sun'],['lamp','Lit lamp','source','It makes its own light.','lampOn'],['mirror','Mirror','reflect','It bounces light back.','mirror'],['book','Book','reflect','We see it when light bounces off it.','book'],['spoon','Spoon','reflect','It shines when light hits it.','spoon'],['moon','Moon','reflect','It reflects sunlight.','moon']]},
  explain:[{q:'Why does a mirror look bright?',o:[['reflect','It reflects light that hits it',1,'Yes. A mirror bounces light. It doesn’t make light.','mirror'],['makes','It makes its own light',0,'Would a mirror shine in a dark room?','torchOn'],['electric','It uses electricity',0,'A mirror has no battery or switch.','stop']]}],
  transfer:{intro:'In a dark cupboard.',fig:{type:'scene',key:'classroom'},qs:[{q:'In a dark cupboard, which one can you still see glowing?',o:[['torch','A lit torch',1,'Yes. A light source makes its own light.','torchOn'],['mirror','A mirror',0,'A mirror needs light to reflect.','mirror'],['spoon','A spoon',0,'A spoon needs light to reflect.','spoon']]}]},
  hints:{play:['Ask: would it shine in a dark room?','Only light sources shine in the dark.','Worked example: a torch shines in the dark; a mirror doesn’t.'],explain:['Look at your groups.','Where did the mirror go?'],transfer:['No light gets into the cupboard.','Which one makes its own light?']},
  learned:'A light source makes its own light. Mirrors, books and the moon only reflect light.'});

mk(2,2,{t:'Light reaches the eye',concept:'A simple light path',goal:'Show how light travels from a source, to an object, to your eye.',scene:'classroom',
  brief:'How do we see a book? Light has to travel to our eyes.',
  predict:{q:'Where does the light start?',o:[['torch','At the torch','torchOn'],['eye','At the eye','eye']]},
  play:{engine:'sequence',instr:'Put the light’s journey in order.',cards:[['torch','The torch makes light','torchOn'],['book','Light bounces off the book','book'],['eye','Light reaches your eye','eye']]},
  explain:[{q:'How do we see the book?',o:[['path','Light from the torch bounces off the book into our eye',1,'Yes. Light travels from the source, to the book, to the eye.','eye'],['eye','Light comes out of our eyes',0,'Look at your order. Where does light start?','eye'],['book','The book makes light',0,'Did the book glow in the dark?','book']]}],
  transfer:{intro:'Sunlight on the noticeboard.',fig:{type:'scene',key:'path'},qs:[{q:'How do you see a poster on the noticeboard?',o:[['sun','Sunlight bounces off the poster into your eye',1,'Yes. Same path: source, object, eye.','sun'],['poster','The poster glows by itself',0,'Is the poster a light source?','book'],['eye','Your eye shines on the poster',0,'Where does light start?','eye']]}]},
  hints:{play:['Where does light start?','Light starts at a light source.','Worked example: lamp → wall → eye.'],explain:['Look at your order.','Light starts at the torch.'],transfer:['What is the light source outdoors?','Source, object, eye.']},
  learned:'We see things when light from a source bounces off them and travels into our eyes.'});

mk(2,3,{t:'Power and purpose',concept:'Choosing a device for a job',goal:'Choose a lamp, a fan or no device for each job.',scene:'classroom',
  brief:'Each job needs the right tool. Some jobs need electricity. Some don’t.',
  predict:{q:'What helps in a hot classroom?',o:[['fan','A fan','fanOn'],['lamp','A lamp','lampOn']]},
  play:{engine:'sort',instr:'Which one does the job?',bins:[['lamp','Lamp','lampOn'],['fan','Fan','fanOn'],['none','No electricity needed','hands']],
    items:[['corner','Dark reading corner','lamp','A lamp gives light to read.','book'],['hot','Hot classroom','fan','A fan moves air.','sun'],['cut','Cutting paper','none','Scissors work by hand.','scissors'],['path','Path at night','lamp','A lamp lights the way.','pathlight'],['sweep','Sweeping the floor','none','A broom works by hand.','broom'],['stuffy','Stuffy room','fan','A fan moves air.','window']]},
  explain:[{q:'Why don’t we need electricity to sweep?',o:[['hand','A broom does the job when we push it',1,'Yes. Not every job needs electricity.','broom'],['all','Every job needs electricity',0,'Look at your no-electricity group.','stop'],['fan','A fan sweeps better',0,'A fan moves air. It doesn’t sweep.','fanOn']]}],
  transfer:{intro:'Night at the noticeboard.',fig:{type:'scene',key:'path'},qs:[{q:'Someone needs to read the noticeboard at night. What helps?',o:[['lamp','A lamp',1,'Yes. The job is to see, so we need light.','lampOn'],['fan','A fan',0,'A fan moves air. What is the job?','fanOn'],['broom','A broom',0,'What is the job?','broom']]}]},
  hints:{play:['What is the job: seeing, cooling, or something else?','Lamps give light. Fans move air.','Worked example: dark corner → lamp.'],explain:['Look at your third group.','How does a broom move?'],transfer:['What is the job?','Seeing needs light.']},
  learned:'Pick a device by its job: lamps give light, fans move air, and some jobs need no electricity.'});

mk(2,4,{t:'See-through or shadow',concept:'Materials that let light through or block it',goal:'Sort materials that let light through and ones that block it.',scene:'classroom',
  brief:'Some things let light through. Some block light and make a shadow.',
  predict:{q:'Will a book make a shadow?',o:[['yes','Yes','wall'],['no','No','glass']]},
  play:{engine:'sort',instr:'Does light go through it?',bins:[['through','Lets light through','glass'],['block','Blocks light','wall']],
    items:[['glass','Clear glass','through','We can see through it.','glass'],['window','Window','through','Sunlight comes in.','window'],['book','Book','block','It makes a shadow.','book'],['wood','Wood','block','It makes a shadow.','wood'],['hands','Hand','block','It makes a shadow.','hands'],['card','Cardboard','block','It makes a shadow.','cardboard']]},
  explain:[{q:'Why does a book make a shadow?',o:[['block','It blocks the light',1,'Yes. Where light can’t reach, there is a shadow.','book'],['dark','It makes darkness',0,'Shadows are where light is blocked.','wall'],['through','Light goes through it',0,'Look at your groups. Where did the book go?','glass']]}],
  transfer:{intro:'Sunshine on the path.',fig:{type:'scene',key:'path'},qs:[{q:'Which one will make a shadow on the sand?',o:[['board','The wooden noticeboard',1,'Yes. Wood blocks light.','wood'],['glass','A clear glass jar',0,'Light goes through clear glass.','glass'],['window','A window pane',0,'Light goes through windows.','window']]}]},
  hints:{play:['Ask: can you see through it?','If you can’t see through it, it blocks light.','Worked example: hand → shadow; glass → no shadow.'],explain:['What does the book do to the light?','Look at your blocks-light group.'],transfer:['Can you see through it?','Wood blocks light.']},
  learned:'Clear materials let light through. Materials that block light make shadows.'});

mk(2,5,{t:'Make a shadow',concept:'Light travels in straight lines',goal:'Put the steps for making a shadow in order.',scene:'classroom',
  brief:'Let’s make a hand shadow on the wall with a torch.',
  predict:{q:'Where will the shadow be?',o:[['behind','Behind your hand, on the wall','wall'],['torch','Inside the torch','torch']]},
  play:{engine:'sequence',instr:'Put the shadow steps in order.',cards:[['torch','The torch shines light','torchOn'],['hand','Your hand blocks some light','hands'],['shadow','A shadow appears on the wall','wall']]},
  explain:[{q:'Why is the shadow the shape of your hand?',o:[['block','Your hand blocks the light in that shape',1,'Yes. Light travels straight, so the blocked part is hand-shaped.','hands'],['wall','The wall draws it',0,'Look at your steps. What blocks the light?','wall'],['torch','The torch makes a hand shape',0,'Look at your steps. What blocks the light?','torchOn']]}],
  transfer:{intro:'Sunset at the noticeboard.',fig:{type:'scene',key:'path'},qs:[{q:'The sun shines on the palm tree. Where is its shadow?',o:[['away','On the side away from the sun',1,'Yes. The tree blocks the sunlight.','tree'],['sun','On the sun side',0,'Where can’t the light reach?','sun'],['none','There is no shadow',0,'Does a tree let light through?','tree']]}]},
  hints:{play:['What makes the light?','The hand must be between the torch and the wall.','Worked example: torch → hand → wall.'],explain:['Look at your steps.','What blocks the light?'],transfer:['Where can’t the sunlight reach?','Shadows are behind the object.']},
  learned:'A shadow forms behind an object that blocks light, because light travels in straight lines.'});

mk(2,6,{t:'Carry it or fixed',concept:'Battery-powered and building-supplied devices',goal:'Sort devices you can carry from devices fixed in a building.',scene:'classroom',
  brief:'Some electric things have batteries, so we can carry them. Others are fixed in the building.',
  predict:{q:'Can you carry a torch to the beach?',o:[['yes','Yes','torch'],['no','No','lampOn']]},
  play:{engine:'sort',instr:'Can you carry it, or is it fixed?',bins:[['carry','Battery, can carry','battery'],['fixed','Fixed in the building','lampOn']],
    items:[['torch','Torch','carry','It has a battery inside.','torch'],['radio','Small radio','carry','It runs on batteries.','radio'],['car','Toy car','carry','It has batteries.','toycar'],['phone','Phone','carry','It has a battery.','phone'],['lamp','Ceiling lamp','fixed','It is fixed to the ceiling.','lampOn'],['fan','Ceiling fan','fixed','It is fixed to the ceiling.','fanOn']]},
  explain:[{q:'Why can we carry a torch?',o:[['battery','It has a battery inside',1,'Yes. The battery goes where the torch goes.','battery'],['light','It is light to lift',0,'A torch needs electricity too. Where does it come from?','torch'],['none','It doesn’t need electricity',0,'It does. Look at your groups.','stop']]}],
  transfer:{intro:'A camping trip.',fig:{type:'scene',key:'path'},qs:[{q:'Which light can you take to the camp?',o:[['torch','A battery lantern',1,'Yes. It has its own battery.','torch'],['lamp','The classroom ceiling lamp',0,'Is it fixed?','lampOn'],['path','The path light post',0,'Is it fixed?','pathlight']]}]},
  hints:{play:['Ask: does it have a battery?','Battery things can go with you.','Worked example: torch → carry; ceiling lamp → fixed.'],explain:['What is inside a torch?','Look at your carry group.'],transfer:['Does it have its own battery?','Fixed lights stay in place.']},
  learned:'Battery-powered devices can be carried. Fixed devices get electricity from the building.'});

mk(2,7,{t:'Mirror in the corner',concept:'Reflection changes the direction of light',goal:'Show how a mirror sends torch light into a dark corner.',scene:'classroom',
  brief:'A corner is dark. Can a mirror help torch light reach it?',
  predict:{q:'Can a mirror send light somewhere new?',o:[['yes','Yes','mirror'],['no','No','stop']]},
  play:{engine:'sequence',instr:'Put the light’s journey in order.',cards:[['torch','The torch shines','torchOn'],['mirror','Light bounces off the mirror','mirror'],['corner','Light reaches the corner','wall'],['eye','Light bounces into your eye','eye']]},
  explain:[{q:'What did the mirror do?',o:[['bounce','It bounced the light in a new direction',1,'Yes. Mirrors reflect light.','mirror'],['make','It made new light',0,'Does a mirror shine in the dark?','torchOn'],['stop','It stopped the light',0,'Did light reach the corner?','stop']]}],
  transfer:{intro:'Sunlight on the path.',fig:{type:'scene',key:'path'},qs:[{q:'You hold a shiny spoon in the sun. What happens?',o:[['bounce','It reflects sunlight',1,'Yes. Shiny things reflect light.','spoon'],['glow','It glows by itself',0,'Is a spoon a light source?','spoon'],['nothing','Nothing at all',0,'What did the mirror do?','mirror']]}]},
  hints:{play:['Where does the light start?','The mirror comes before the corner.','Worked example: torch → mirror → corner → eye.'],explain:['Look at your order.','The mirror changed the direction.'],transfer:['Is a spoon shiny?','Shiny things reflect.']},
  learned:'A mirror reflects light and can send it in a new direction.'});

mk(2,8,{t:'Shiny or dull',concept:'How much light materials reflect',goal:'Sort materials that reflect a lot of light from ones that reflect little.',scene:'classroom',
  brief:'Everything we see reflects some light. Shiny things reflect a lot.',
  predict:{q:'Does foil reflect a lot of light?',o:[['lot','A lot','foil'],['little','A little','cloth']]},
  play:{engine:'sort',instr:'Does it reflect a lot or a little?',bins:[['lot','Reflects a lot','mirror'],['little','Reflects a little','cloth']],
    items:[['mirror','Mirror','lot','It is smooth and shiny.','mirror'],['foil','Foil','lot','It is shiny.','foil'],['spoon','Metal spoon','lot','It is shiny.','spoon'],['cloth','Dark cloth','little','It is dull and dark.','cloth'],['card','Cardboard','little','It is dull.','cardboard'],['wood','Rough wood','little','It is dull.','wood']]},
  explain:[{q:'Which is best for a bright safety strip on a school bag?',o:[['shiny','Something shiny that reflects a lot',1,'Yes. It bounces car lights back.','foil'],['dark','Dark cloth',0,'Look at your reflects-a-little group.','cloth'],['wood','Rough wood',0,'Look at your reflects-a-little group.','wood']]}],
  transfer:{intro:'A night walk.',fig:{type:'scene',key:'pathLit'},qs:[{q:'Which shows up best in torch light?',o:[['shiny','A shiny badge',1,'Yes. Shiny things reflect a lot of light.','spoon'],['dull','A dark cloth bag',0,'Does dark cloth reflect a lot?','cloth'],['card','A cardboard box',0,'Is cardboard shiny?','cardboard']]}]},
  hints:{play:['Ask: is it shiny?','Shiny and smooth reflect a lot.','Worked example: mirror → a lot; dark cloth → a little.'],explain:['Which group bounces the most light?','Shiny things.'],transfer:['Which is shiny?','Shiny reflects a lot.']},
  learned:'Shiny, smooth things reflect a lot of light. Dull, dark things reflect only a little.'});

mk(2,9,{t:'Look after your eyes',concept:'Safety with bright light',goal:'Choose safe ways to use bright light.',scene:'path',
  brief:'Light helps us see, but very bright light can hurt our eyes.',
  predict:{q:'Is it safe to look straight at the sun?',o:[['safe','Safe','sun'],['unsafe','Not safe','stop']]},
  play:{engine:'sort',instr:'Is each choice safe or not safe?',bins:SAFE,
    items:[['nosun','Never look straight at the sun','safe','It protects your eyes.','sun'],['torcheyes','Shine a torch in a friend’s eyes','unsafe','Bright light can hurt eyes.','torchOn'],['hat','Wear a sun hat in bright sun','safe','It shades your eyes.','sun'],['mirror','Flash sunlight from a mirror at someone','unsafe','Reflected sunlight can hurt eyes.','mirror'],['down','Point a torch at the ground','safe','It lights the path, not eyes.','pathlight']]},
  explain:[{q:'Why point a torch at the ground?',o:[['eyes','So bright light doesn’t go into anyone’s eyes',1,'Yes. Light the path, not faces.','eye'],['dark','So it gets dark',0,'Does the torch still light the way?','torchOn'],['battery','To use up the battery',0,'Think about eyes.','battery']]}],
  transfer:{intro:'A bright beach day.',fig:{type:'scene',key:'path'},qs:[{q:'A friend wants to look at the sun. What do you say?',o:[['no','Don’t look straight at it',1,'Yes. That keeps their eyes safe.','stop'],['mirror','Use a mirror to look',0,'Reflected sunlight is still too bright.','mirror'],['quick','Just look quickly',0,'Even a quick look is not safe.','sun']]}]},
  hints:{play:['Ask: could bright light go into eyes?','Very bright light into eyes is not safe.','Worked example: torch at the ground → safe.'],explain:['Where should the light go?','Away from eyes.'],transfer:['Is the sun bright?','Never look straight at it.']},
  learned:'Never look straight at the sun, and never shine bright light into anyone’s eyes.'});

mk(2,10,{t:'Light the night path',concept:'Electric light for safety at night',goal:'Switch the path light and record whether it is on or off.',scene:'path',
  brief:'At night the path is dark. The path light helps people walk safely.',
  predict:{q:'What happens when you press the path light switch?',o:[['on','The light comes on','pathlight'],['off','Nothing happens','lampOff']]},
  play:{engine:'switch',device:'path',start:'open'},
  explain:[{q:'Why do we need the path light at night?',o:[['see','So people can see where they walk',1,'Yes. Light helps us see the path safely.','eye'],['warm','To warm the sand',0,'What does a light help us do?','sun'],['day','It is only for daytime',0,'When is the path dark?','moon']]}],
  transfer:{intro:'Back in the classroom.',fig:{type:'switch',device:'lamp',sw:'open'},qs:[{q:'The classroom switch is OFF. Is the lamp on or off?',o:[['off','Off',1,'Yes. Switch off, light off.','lampOff'],['on','On',0,'What happened to the path light when its switch was off?','lampOn']]}]},
  hints:{play:['Press the switch and look at the light.','A lit light has a glow around it.','Worked example: switch ON → light on.'],explain:['When is the path dark?','What does light help us do?'],transfer:['Is the switch on or off?','Same idea as the path light.']},
  learned:'A switch turns the path light on and off. Light at night helps people see and stay safe.'});

/* ---------- Grade 3 ---------- */
mk(3,1,{t:'Switch off waste',concept:'Responsible energy use',goal:'Choose adult-approved actions that stop wasting energy.',scene:'classroom',
  brief:'The class went outside, but lights and fans are still on. Which actions save energy?',
  predict:{q:'Does leaving lights on in an empty room waste energy?',o:[['yes','Yes'],['no','No']],r:[['nobody','Nobody is using them'],['free','Electricity is free'],['unsure','I’m not sure']]},
  play:{engine:'sort',instr:'Does each action save or waste energy?',bins:[['save','Saves energy'],['waste','Wastes energy']],
    items:[['lights','Lights left on in an empty classroom','waste','Nobody needs the light.'],['fan','Turning off the fan at break, with the teacher’s OK','save','The fan isn’t needed while the room is empty.'],['daylight','Opening blinds to use daylight','save','Sunlight replaces lamp light.'],['pc','Leaving the computer on overnight','waste','It uses energy while nobody works.'],['ask','Asking an adult before switching off shared equipment','save','Some equipment must stay on; an adult knows which.'],['door','Leaving the door open with the air conditioner on','waste','Cool air escapes, so it works harder.']]},
  explain:[{q:'Which statement do your results support?',o:[['need','Switching off things nobody needs saves energy.',1,'Yes. Every waste card was something left on with nobody using it.'],['all','We should switch everything off all the time.',0,'Some things are needed. Look at the “ask an adult” card.'],['free','Leaving things on costs nothing.',0,'Using electricity uses energy that has to be produced.']]}],
  transfer:{intro:'The school office at lunchtime.',fig:{type:'scene',key:'classroomLit'},qs:[{q:'The office is empty. A printer and lights are on. What is the best first step?',o:[['ask','Tell an adult so they can switch off what isn’t needed',1,'Yes. Saving energy safely, with an adult’s OK.'],['unplug','Unplug everything yourself',0,'Plugs are for adults. Who should decide?'],['leave','Leave it all on',0,'Is anyone using them?']]}]},
  hints:{play:['Ask: is anyone using it right now?','Things left on with nobody using them waste energy.','Worked example: empty room + lights on → waste.'],explain:['Look at the waste group.','What do they have in common?'],transfer:['Is anyone using them?','Who should switch things off at school?']},
  learned:'Switching off lights and devices that nobody needs saves energy. Ask an adult before switching off shared equipment.'});

mk(3,2,{t:'Sunlight to electricity',concept:'A solar panel needs suitable light',goal:'Compare a solar panel in sunlight and in shade.',scene:'solar',
  brief:'The path light has a solar panel. Does it matter where we put the panel?',
  predict:{q:'Will the lamp work if the panel is in the shade?',o:[['yes','Yes, the same as in sun'],['no','No, it needs sunlight']],r:[['light','Panels need light'],['always','Panels always work'],['unsure','I’m not sure']]},
  play:{engine:'solar',initial:{panel:'yes',site:'sun',storage:'no',time:'day'},edit:['site'],
    reqs:[['Test with the panel in open sun.',has((s,r)=>s.site==='sun'&&s.time==='day'&&r.lit)],['Move the panel into shade and test.',has((s,r)=>s.site==='shade'&&s.time==='day'&&!r.lit)]],
    steps:['Test the lamp with the panel in open sun.','Now move the panel under the palm and test again.']},
  explain:[{q:'Which claim do your tests support?',o:[['light','The panel needs suitable sunlight to make enough electricity for the lamp.',1,'Yes. Same panel, same lamp; only the light changed.'],['always','The panel works the same anywhere.',0,'Look at your shade test.'],['lamp','The lamp broke in the shade.',0,'It worked again when you moved the panel back.']]},
    {q:'What stayed the same in both tests?',o:[['same','The panel, the lamp and the time of day',1,'Yes. Only the spot changed, so it was fair.'],['nothing','Nothing stayed the same',0,'Look at your test log.'],['spot','The panel spot',0,'The spot was the thing you changed.']]}],
  transfer:{intro:'A new panel at the school gate.',fig:{type:'solar',set:{panel:'yes',site:'shade',storage:'no',time:'day'}},qs:[{q:'This panel is under the palm. What would help the lamp work by day?',o:[['move','Move the panel into open sun',1,'Yes. Suitable light is what it needs.'],['lamp','Use a bigger lamp',0,'Would a bigger lamp get more electricity?'],['shade','Add more shade',0,'Look at your shade test.']]}]},
  hints:{play:['Press Test, then change only the panel spot.','The panel spot buttons move it into shade.','Worked example: sun → lamp on; shade → lamp off.'],explain:['Compare your two tests.','What did you change?'],transfer:['Where did the panel work?','In open sun.']},
  learned:'A solar panel needs suitable sunlight. In shade it makes too little electricity for the lamp (in this model).'});

mk(3,3,{t:'Read a power record',concept:'Recording paired observations',goal:'Record the switch setting and lamp state together at three checkpoints.',scene:'classroom',
  brief:'Scientists write down what they see. Keep a record: switch setting and lamp state, at each check.',
  predict:{q:'If the switch is ON at a checkpoint, what will you record for the lamp?',o:[['on','Lamp on'],['off','Lamp off']]},
  play:{engine:'switch',device:'lamp',start:'open',checkpoints:true,
    reqs:[['Record three checkpoints.',T=>T.length>=3],['Record the lamp both on and off.',T=>T.some(x=>x.s==='closed')&&T.some(x=>x.s==='open')]]},
  explain:[{q:'Why write the switch setting next to the lamp state?',o:[['pair','So each observation is matched to the setting it came from',1,'Yes. A paired record lets us see the pattern.'],['neat','It makes the page look neat',0,'Could you see the pattern without both?'],['time','It isn’t needed',0,'Look at your record. What tells you why the lamp was off?']]},
    {q:'What pattern does your record show?',o:[['pattern','Switch ON → lamp on; switch OFF → lamp off',1,'Yes. Every checkpoint fits.'],['random','No pattern',0,'Look down your record.'],['always','Lamp always on',0,'Look at your OFF rows.']]}],
  transfer:{intro:'Someone else’s record.',fig:{type:'scene',key:'classroom'},qs:[{q:'A record says: “10:00 – lamp off.” What is missing?',o:[['switch','The switch setting',1,'Yes. Without it, we can’t tell why the lamp was off.'],['colour','The lamp colour',0,'What explains on and off?'],['nothing','Nothing is missing',0,'Compare with your record.']]}]},
  hints:{play:['Set the switch, then record what the lamp does.','Each record needs a setting and an observation.','Worked example: 9:00 · switch ON · lamp on.'],explain:['Look at your record rows.','What explains each lamp state?'],transfer:['What two things does each row need?','Setting and observation.']},
  learned:'A good record pairs each setting with what was observed, so patterns are easy to see.'});

mk(3,4,{t:'Energy for moving',concept:'Different energy sources',goal:'Sort moving things by where their energy comes from.',scene:'island',
  brief:'Things that move need energy. On the island it comes from electricity, fuel or our muscles.',
  predict:{q:'Where does a bicycle get its energy?',o:[['muscle','Our muscles'],['elec','Electricity'],['fuel','Fuel']]},
  play:{engine:'sort',instr:'Where does the energy come from?',bins:[['elec','Electricity'],['fuel','Fuel'],['muscle','Muscles']],
    items:[['fan','Electric fan','elec','It is switched on.'],['car','Battery toy car','elec','Its battery supplies electricity.'],['dhoni','Motor boat','fuel','Its engine burns fuel.'],['bike','Motorbike','fuel','Its engine burns fuel.'],['cycle','Bicycle','muscle','Your legs push the pedals.'],['row','Rowing boat','muscle','Your arms pull the oars.']]},
  explain:[{q:'Which claim fits your sort?',o:[['sources','Moving things get energy from different sources.',1,'Yes. Electricity, fuel and muscles all supply energy.'],['all','Everything that moves uses electricity.',0,'Look at your muscles group.'],['none','Some things move with no energy at all.',0,'Every card needed some source.']]}],
  transfer:{intro:'A new vehicle.',fig:{type:'scene',key:'island'},qs:[{q:'An electric scooter is charged at night. Where does its energy come from?',o:[['elec','Electricity, stored in its battery',1,'Yes.'],['muscle','Only muscles',0,'Does it need charging?'],['fuel','Fuel',0,'Does it have a fuel tank?']]}]},
  hints:{play:['Ask: does it have a switch, an engine, or a person pushing?','Engines usually burn fuel.','Worked example: bicycle → muscles.'],explain:['Count your groups.','Were they all electric?'],transfer:['What does charging fill?','A battery.']},
  learned:'Moving things need energy. It can come from electricity, fuel or muscles.'});

mk(3,5,{t:'Best place for the panel',concept:'Siting a solar panel',goal:'Choose good and poor places for a solar panel.',scene:'solar',
  brief:'The school wants a solar panel. Where should it go?',
  predict:{q:'Is under a tree a good place for a solar panel?',o:[['good','Good'],['poor','Poor']],r:[['shade','Trees make shade'],['cool','It is cool there'],['unsure','I’m not sure']]},
  play:{engine:'sort',instr:'Good spot or poor spot?',bins:[['good','Good spot'],['poor','Poor spot']],
    items:[['roof','Open roof facing the sky','good','Sunlight reaches it all day.'],['beach','Open sandy area','good','Nothing blocks the sun.'],['pole','On a tall pole above the shade','good','It is above the shadows.'],['tree','Under a palm tree','poor','Leaves block sunlight.'],['wall','Behind a tall wall','poor','The wall shades it.'],['cupboard','Inside a cupboard','poor','No sunlight gets in.']]},
  explain:[{q:'What makes a spot good?',o:[['sun','Sunlight reaches the panel without shade',1,'Yes. Panels need suitable light.'],['cool','It is cool and dark',0,'Look at your poor spots.'],['close','It is close to the door',0,'What did all the good spots share?']]}],
  transfer:{intro:'A new building.',fig:{type:'solar',set:{panel:'yes',site:'shade',storage:'no',time:'day'}},qs:[{q:'The only roof is shaded by a big tree in the afternoon. What is the best choice?',o:[['open','Find an open spot that gets sun most of the day',1,'Yes. Less shade means more electricity.'],['shade','Keep it in the shade',0,'Look at your good spots.'],['inside','Put it indoors',0,'Look at your poor spots.']]}]},
  hints:{play:['Ask: does sunlight reach it?','Shade makes a poor spot.','Worked example: open roof → good.'],explain:['Compare the two groups.','What blocks sun in the poor spots?'],transfer:['Where does sun reach?','Avoid shade.']},
  learned:'A good spot for a solar panel gets plenty of sunlight with little shade.'});

mk(3,6,{t:'When does the panel work?',concept:'A panel needs light: day and night',goal:'Test a solar lamp with no battery store by day and after dark.',scene:'solar',
  brief:'This path light has a solar panel but no battery store. Does it work at night?',
  predict:{q:'Will the lamp light after dark?',o:[['yes','Yes'],['no','No']],r:[['sun','There is no sunlight at night'],['saved','It saves sunlight'],['unsure','I’m not sure']]},
  play:{engine:'solar',initial:{panel:'yes',site:'sun',storage:'no',time:'day'},edit:['time'],
    reqs:[['Test in the daytime.',has((s,r)=>s.time==='day'&&r.lit)],['Test after dark.',has((s,r)=>s.time==='night'&&!r.lit)]],
    steps:['Test the lamp in the daytime.','Now change the time to after dark and test.']},
  explain:[{q:'Which claim do your tests support?',o:[['light','A panel alone only powers the lamp while there is sunlight.',1,'Yes. No light, no electricity from the panel.'],['night','Panels work best at night.',0,'Look at your night test.'],['moon','Moonlight is enough.',0,'Look at your night test.']]}],
  transfer:{intro:'A night-time football field.',fig:{type:'solar',set:{panel:'yes',site:'sun',storage:'no',time:'night'}},qs:[{q:'A field light has only a panel. Will it work for an evening match?',o:[['no','No, there is no sunlight then',1,'Yes. It would need stored energy or another supply.'],['yes','Yes, panels work any time',0,'Look at your night test.'],['bright','Only if the lamp is bright',0,'Where would the electricity come from?']]}]},
  hints:{play:['Change only the time setting.','Test once in daytime and once after dark.','Worked example: day → on; night → off.'],explain:['Compare day and night.','What is missing at night?'],transfer:['Is there sunlight in the evening?','A panel needs light.']},
  learned:'A solar panel only makes electricity while there is suitable light. A panel alone can’t light a lamp at night.'});

mk(3,7,{t:'Sunlight to lamp',concept:'The solar lamp chain',goal:'Put the steps from sunlight to lamp light in order.',scene:'solar',
  brief:'How does sunlight end up as light from the lamp?',
  predict:{q:'What comes first?',o:[['sun','Sunlight'],['lamp','Lamp light']]},
  play:{engine:'sequence',instr:'Put the steps in order.',cards:[['sun','Sunlight reaches the panel'],['panel','The panel makes electricity'],['wire','Wires carry electricity to the lamp'],['lamp','The lamp gives out light']]},
  explain:[{q:'What job do the wires do?',o:[['carry','Carry electricity from the panel to the lamp',1,'Yes. They complete the path.'],['make','Make electricity',0,'Look at your order. What makes it?'],['light','Give out light',0,'What gives out light?']]}],
  transfer:{intro:'A solar fan.',fig:{type:'solar',set:{panel:'yes',site:'sun',storage:'no',time:'day'}},qs:[{q:'A solar fan spins. What is the last step?',o:[['spin','The fan spins and moves air',1,'Yes. Same chain, different output.'],['sun','Sunlight reaches the panel',0,'That comes first.'],['wire','Wires carry electricity',0,'What happens after that?']]}]},
  hints:{play:['Start with the sun.','The panel comes before the wires.','Worked example: sun → panel → wires → lamp.'],explain:['Look at step 3.','What moves along the wires?'],transfer:['What does a fan do at the end?','It moves.']},
  learned:'Sunlight reaches the panel, the panel makes electricity, wires carry it, and the lamp gives out light.'});

mk(3,8,{t:'Daylight or lamp',concept:'Using daylight first',goal:'Decide when daylight is enough and when a lamp is needed.',scene:'classroom',
  brief:'Using daylight instead of lamps saves energy. When is daylight enough?',
  predict:{q:'Is daylight enough for reading next to a sunny window?',o:[['yes','Yes'],['no','No']]},
  play:{engine:'sort',instr:'Is daylight enough, or do we need a lamp?',bins:[['day','Daylight is enough'],['lamp','Need a lamp']],
    items:[['window','Reading by a sunny window','day','Plenty of sunlight comes in.'],['store','Working in a windowless store room','lamp','No daylight gets in.'],['evening','Evening class after sunset','lamp','There is no daylight.'],['outside','Art lesson outdoors at noon','day','The sun is bright.'],['storm','Very dark stormy afternoon','lamp','Clouds block most light.']]},
  explain:[{q:'Which plan saves energy?',o:[['first','Use daylight when there is enough; switch on lamps when there isn’t.',1,'Yes. Lamps only when needed.'],['always','Keep lamps on all day.',0,'Look at your daylight group.'],['never','Never use lamps.',0,'Look at your lamp group.']]}],
  transfer:{intro:'The library.',fig:{type:'scene',key:'classroomLit'},qs:[{q:'The library has big windows and it is sunny. Lamps are on. What is the energy-saving choice?',o:[['off','Switch off lamps near the windows (with an adult’s OK)',1,'Yes. Daylight is enough there.'],['more','Switch on more lamps',0,'Is there enough daylight?'],['close','Close the blinds',0,'Would that save energy?']]}]},
  hints:{play:['Ask: does daylight reach here?','No windows or no sun means a lamp.','Worked example: sunny window → daylight.'],explain:['Look at both groups.','When is a lamp needed?'],transfer:['Is it sunny?','Daylight first.']},
  learned:'Using daylight when there is enough, and lamps only when needed, saves energy.'});

mk(3,9,{t:'Energy at home',concept:'Saving energy at home',goal:'Sort home habits that save or waste energy.',scene:'island',
  brief:'Families can save energy at home too. Which habits help?',
  predict:{q:'Does keeping the fridge door open waste energy?',o:[['yes','Yes'],['no','No']]},
  play:{engine:'sort',instr:'Does each habit save or waste energy?',bins:[['save','Saves energy'],['waste','Wastes energy']],
    items:[['fridge','Leaving the fridge door open','waste','Cold air escapes, so the fridge works harder.'],['fanoff','Switching off the fan when leaving','save','It isn’t needed.'],['tv','TV on with nobody watching','waste','Nobody needs it.'],['line','Drying clothes on a line in the sun','save','Sunlight does the job.'],['charger','Charging a phone that is already full','waste','No more energy is needed.'],['led','Using an efficient LED bulb','save','It gives the same light with less energy.']]},
  explain:[{q:'Which statement fits your sort?',o:[['needless','Waste happens when energy is used and nobody gets a benefit.',1,'Yes.'],['all','All electricity use is waste.',0,'Look at your saving group.'],['tv','Only TVs waste energy.',0,'Look at your waste group.']]}],
  transfer:{intro:'Grandma’s kitchen.',fig:{type:'scene',key:'island'},qs:[{q:'Which habit saves energy?',o:[['lid','Cooking rice with a lid on',1,'Yes. Less heat escapes.'],['open','Leaving the oven door open to cool the kitchen',0,'Does that help anyone?'],['lights','Lights on in every room all day',0,'Is anyone using them?']]}]},
  hints:{play:['Ask: does anyone benefit?','Energy used for nothing is wasted.','Worked example: TV on, nobody watching → waste.'],explain:['Look at the waste group.','What do they share?'],transfer:['Which choice keeps heat in?','A lid stops heat escaping.']},
  learned:'At home, switching off unneeded devices and keeping heat or cold in saves energy.'});

mk(3,10,{t:'Where does the energy come from?',concept:'Batteries, sunlight and fuel',goal:'Sort devices by their energy source.',scene:'island',
  brief:'Electric devices get energy from different places: batteries, sunlight, or fuel.',
  predict:{q:'Where does a solar path light get its energy?',o:[['sun','Sunlight'],['battery','A battery only'],['fuel','Fuel']]},
  play:{engine:'sort',instr:'Where does the energy come from?',bins:[['battery','Battery'],['sun','Sunlight'],['fuel','Fuel']],
    items:[['torch','Torch','battery','It runs on batteries.'],['remote','TV remote','battery','It runs on batteries.'],['path','Solar path light','sun','Its panel uses sunlight.'],['calc','Solar calculator','sun','A small panel uses light.'],['boat','Boat engine','fuel','It burns fuel.'],['stove','Gas stove','fuel','It burns gas.']]},
  explain:[{q:'Which claim fits your sort?',o:[['sources','Devices can get energy from batteries, sunlight or fuel.',1,'Yes.'],['battery','Everything uses batteries.',0,'Look at your fuel group.'],['sun','Everything uses sunlight.',0,'Look at your battery group.']]}],
  transfer:{intro:'A new gadget.',fig:{type:'scene',key:'island'},qs:[{q:'A garden fountain has a small panel and no battery. Where does its energy come from?',o:[['sun','Sunlight',1,'Yes. The panel uses sunlight.'],['fuel','Fuel',0,'Does it have a fuel tank?'],['battery','A battery',0,'It has no battery.']]}]},
  hints:{play:['Look for a panel, a battery or an engine.','Panels use sunlight; engines burn fuel.','Worked example: torch → battery.'],explain:['Count your groups.','Was there only one source?'],transfer:['What does it have?','A panel.']},
  learned:'Devices get energy from batteries, sunlight (through panels) or fuel.'});
