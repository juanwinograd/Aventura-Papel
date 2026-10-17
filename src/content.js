export const HEROES = [
  { id:'vicente', name:'Vicente', color:'#f05a96', dark:'#b52f65', trait:'El espacio es su patio de juegos', powers:[['Prisma','Encerrá a un enemigo por unos segundos.',5,'△'],['Rayo regalo','Envolvé objetos y enemigos. Después, llevalos.',4,'◇'],['Espacio-tiempo','Aparecé en un lugar seguro al azar.',8,'↝']] },
  { id:'fabrizio', name:'Fabrizio', color:'#9ecb52', dark:'#4d751c', trait:'Una sorpresa en cada resorte', powers:[['Cubo reflector','Devolvé los disparos al que los lanzó.',5,'▧'],['Invisibilidad','Cinco segundos para pasar sin que te vean.',13,'◌'],['Picos','Lanzá picos a enemigos y blancos.',2,'⋀'],['¡Fiesta!','Enterrate, prendé las luces y celebrá.',5,'✳']] },
  { id:'luca', name:'Luca', color:'#20b5d5', dark:'#08788f', trait:'Pequeño, pero con mucha energía', powers:[['Rayo eléctrico','Dale energía a las máquinas o aturdí enemigos.',2,'ϟ'],['Tormenta','Cambiá el escenario con una tormenta.',10,'☂'],['Campo de fuerza','Protegé a todos los que estén cerca. Te quedás quieto.',11,'◎'],['Hacerse chiquito','Entrá en pasadizos. Volvé a pulsar para crecer.',3,'↧']] },
  { id:'gaspar', name:'Gaspar', color:'#08afce', dark:'#08778d', trait:'El hermano que llega más lejos', unlock:'gaspar_unlocked', powers:[['Brazo elástico','Alcanzá objetos que están muy lejos.',3,'↔'],['Superpuño','Un golpe enorme contra los enemigos cercanos.',3,'✊'],['Teletransportarse','Saltá a un lugar seguro al azar.',8,'↝'],['Papapumba','Lanzá una papa explosiva. ¡PUM!',5,'●']] },
  { id:'amaral', name:'Amaral', color:'#ef3b50', dark:'#ac2436', trait:'El clima está de su lado', unlock:'amaral_unlocked', powers:[['Neblina','Ocultá al equipo de los enemigos durante seis segundos.',10,'≋'],['Soleado','Despejá la neblina e iluminá toda la viñeta.',8,'☀'],['Viento','Desviá los disparos enemigos con ráfagas de viento.',9,'↠']] },
];

const headquartersGuests=[
  {id:'alma-suave',type:'npc',name:'Alma',character:'alma-face',x:250,y:450,dialog:[['Alma','¡Yo cuido el cuartel! Ustedes salven a Vicente.']]},
  {id:'cata',type:'npc',name:'Cata',character:'cata',x:385,y:425,dialog:[['Cata','Escuché una voz en el cofre. ¡No es un mueble que habla!']]},
  {id:'alma-violeta',type:'npc',name:'Alma',character:'alma-purple',x:535,y:450,dialog:[['Alma','¿Y si alguien pudiera estirar el brazo hasta el cierre del cofre?']]},
  {id:'sofia',type:'npc',name:'Sofía',character:'sofia',x:755,y:440,dialog:[['Sofía','La masa rosa no puede entrar acá. ¡Este cuartel aguanta de todo!']]},
  {id:'seshia',type:'npc',name:'Seshia',character:'seshia',x:855,y:395,dialog:[['Seshia','Amaral está en el cofre. Seguro que con ayuda puede salir.']]},
];
const chest={id:'chest',type:'chest',name:'Cofre de Amaral',x:615,y:272,flag:'amaral_unlocked'};

export const SCENES = [
  { title:'El cuartel', subtitle:'e.c.u.c.p.a.e.a.p.s.a', caption:'Toda gran aventura empieza con una noticia muy rara.', theme:'base', requires:['base_power','base_reflect'], objective:'Repará la consola y probá la defensa del cuartel.', hint:'Acercá a Luca a la consola y usá Z. Después, llevá a Fabrizio frente al lanzador y usá Z para devolver un disparo con su cubo.', intro:[['Reportero','¡Última noticia! Una masa rosa está absorbiendo el mundo. Se llama… ¡Vicente!'],['Vicente','¡Ese es mi cuerpo! Yo soy una pequeña esencia que logró salir. ¿Me ayudan a volver?'],['Ancianito','Las esencias están en su corazón. Primero arreglemos el cuartel. Cambien de personaje con 1, 2 y 3.']], objects:[
    {id:'anciano',type:'npc',name:'Ancianito',x:175,y:355,character:'anciano',dialog:[['Ancianito','Una máquina dormida necesita electricidad. Y a ese lanzador le hace falta probar su propio disparo. ¡Tenemos el equipo perfecto!']]},
    {id:'console',type:'electric',name:'Consola sin energía',x:380,y:345,flag:'base_power'},
    {id:'launcher',type:'turret',name:'Lanzador de práctica',x:680,y:325,flag:'base_reflect',practice:true},
    {id:'reportero',type:'npc',name:'Reportero',x:835,y:280,character:'reportero',dialog:[['Reportero','¡El equipo sale al rescate! Mis cálculos indican que la aventura tendrá al menos una fiesta.']]},
    {id:'secret-door',type:'secret-door',name:'Un dibujo sospechoso',x:450,y:250},
    chest,...headquartersGuests,
  ] },
  { title:'La calle doblada', subtitle:'No todo lo que brilla es un regalo. A veces, sí.', caption:'Mientras tanto, en una calle que alguien dobló por la mitad…', theme:'street', requires:['street_prism','street_sneak','street_target','street_piece'], objective:'Conseguí la pieza y abrí el paso sin despertar a todo el barrio.', hint:'Vicente puede encerrar al guardia con Z. Primero envolvé la pieza con X de Vicente y recogela con E. Fabrizio puede llevar el regalo: usá X para cruzar el láser invisible, entregalo con E en el mecanismo y alcanzá el blanco con C.', mark:{x:865,y:245}, objects:[
    {id:'piece',type:'piece',name:'Pieza del mecanismo',x:210,y:435},
    {id:'guard',type:'enemy',name:'Asistente de Fusi',x:365,y:340,prismFlag:'street_prism'},
    {id:'eye',type:'scanner',name:'Ojo vigilante',x:530,y:400,flag:'street_sneak'},
    {id:'target',type:'target',name:'Blanco del cerrojo',x:680,y:270,flag:'street_target'},
    {id:'slot',type:'slot',name:'Mecanismo de salida',x:800,y:415,flag:'street_piece'},
    {id:'anciano',type:'npc',name:'Ancianito',character:'anciano',x:155,y:280,dialog:[['Ancianito','Ese asistente de Fusi no para de molestar. Vicente puede encerrarlo en un prisma con Z.'],['Ancianito','Fabrizio puede cruzar el láser si se vuelve invisible con X. Del otro lado, sus picos activan el blanco del cerrojo con C.']]},
  ] },
  { title:'El laboratorio de tormentas', subtitle:'Una solución del tamaño de una chispa.', caption:'Una pared, un pasadizo y un poquito de mal tiempo.', theme:'lab', requires:['lab_power','lab_storm','lab_escort'], objective:'Encendé el laboratorio y ayudá al Ancianito a cruzar.', hint:'Luca entra por el pasadizo con V. Usá Z cerca de la consola y X para desplegar la antena con una tormenta. Acercate al Ancianito y mantené C: el campo lo protege mientras cruza.', mark:{x:95,y:245}, objects:[
    {id:'switch',type:'electric',name:'Consola del pasadizo',x:600,y:340,flag:'lab_power'},
    {id:'antenna',type:'antenna',name:'Antena plegada',x:805,y:375,flag:'lab_storm'},
    {id:'escort',type:'escort',name:'Ancianito',character:'anciano',x:720,y:425,flag:'lab_escort'},
  ] },
  { title:'El borde del apocalipsis', subtitle:'No pises lo rosa. En serio.', caption:'¡La masa está cerca! Por suerte, las ideas también.', theme:'edge', requires:['edge_plate','edge_reflect','edge_teleport'], objective:'Activá la placa y frená al robot. Después, Vicente debe teletransportarse más allá de la masa.', hint:'Vicente convierte al asistente en regalo con X. Recogelo con E y dejalo sobre la placa con E. Fabrizio devuelve el disparo del robot con Z. La masa bloquea todo el camino a la salida: cuando la placa y el robot estén resueltos, usá C de Vicente para saltar al otro lado.', mark:{x:105,y:245}, objects:[
    {id:'guard',type:'enemy',name:'Asistente distraído',x:270,y:335},
    {id:'plate',type:'plate',name:'Placa de peso',x:480,y:440,flag:'edge_plate'},
    {id:'robot',type:'turret',name:'Robot de Fusi',x:590,y:315,flag:'edge_reflect'},
    {id:'fusi',type:'npc',name:'Fusi',character:'fusi',x:550,y:265,dialog:[['Fusi','¡Hasta yo me alejo de esa masa! Si la tocás, te absorbe de inmediato.']]},
  ] },
  { title:'La fusión de Sebástian', subtitle:'Salvar a un amigo es el mejor superpoder.', caption:'Sebástian tiene un plan. El Ancianito, la otra mitad.', theme:'heart', requires:['heart_power','heart_piece','heart_fusion','heart_restored'], objective:'Prepará las esencias y hablá con Sebástian. ¡No toques la masa!', hint:'Luca enciende la consola con Z. Vicente envuelve la esencia rosa con X y la lleva al receptáculo. Después hablá con Sebástian: caminará hacia la masa para fusionarse. Cuando vuelva, hablá con el Ancianito para que los separe y reúna a Vicente con su cuerpo.', objects:[
    {id:'console',type:'electric',name:'Esencia celeste',x:300,y:325,flag:'heart_power'},
    {id:'sebastian',type:'npc',name:'Sebástian',character:'sebastian',x:455,y:365},
    {id:'anciano',type:'npc',name:'Ancianito',character:'anciano',x:175,y:435},
    {id:'piece',type:'piece',name:'Esencia rosa',x:430,y:270},
    {id:'slot',type:'slot',name:'Receptáculo de esencias',x:475,y:455,flag:'heart_piece'},
  ] },
  { title:'Que empiece la fiesta', subtitle:'El mundo sigue siendo un buen lugar para dibujar.', caption:'Y así, una historia de apocalipsis terminó en una fiesta.', theme:'party', requires:[], objective:'¡Salvaste a Vicente! Celebrá con Fabrizio o buscá la viñeta secreta.', hint:'V de Fabrizio: fiesta subterránea. Buscá las tres estrellas de los márgenes de las viñetas 2, 3 y 4. Después visitá el dibujo del cuartel. Podés volver con «Ver viñetas».', objects:[
    {id:'reportero',type:'npc',name:'Reportero',x:245,y:355,character:'reportero',dialog:[['Reportero','¡El apocalipsis fue cancelado! Gracias a este equipo y sus superpoderes. Ahora sí: ¡hagamos una fiesta!']]},
    {id:'anciano',type:'npc',name:'Ancianito',x:665,y:350,character:'anciano',dialog:[['Ancianito','Algunas historias esconden otra historia en los márgenes. Si encontraste tres marcas, mirá el dibujo del cuartel.']]},
    {id:'secret-door',type:'secret-door',name:'El dibujo del cuartel',x:450,y:260},
    chest,...headquartersGuests.map(o=>({...o,dialog:o.id==='sofia'?[['Sofía','¡Qué suerte que volvió Vicente! Lástima que no hay luces de fiesta… ¿Fabrizio sabe hacer algo?']]:o.id==='seshia'?[['Seshia','¡Al fin volvió la tranquilidad! Si Amaral sigue en el cofre, podemos volver al cuartel a ayudarla.']]:o.id==='alma-suave'?[['Alma','¡El apocalipsis se terminó! ¿Bailamos?']]:o.dialog})),
  ] },
  { title:'La viñeta de Gaspar', subtitle:'¡Un nuevo héroe salió del margen!', caption:'Gaspar llegó. ¡Sus brazos no conocen los márgenes!', theme:'secret', requires:['secret_reach','secret_guard1','secret_guard2'], objective:'Usá el brazo elástico para alcanzar la llave y vencé a los asistentes.', hint:'Elegí a Gaspar con 4. Desde el lado izquierdo, mirá la llave lejana y usá Z: el brazo elástico la trae y abre el puente. Con X, el superpuño alcanza enemigos cercanos. Con V, Papapumba lanza una papa que explota a distancia. C te lleva fuera de peligro.', objects:[
    {id:'key',type:'distant',name:'Llave del puente',x:800,y:265,flag:'secret_reach'},
    {id:'guard1',type:'enemy',name:'Asistente del puente',x:695,y:350,defeatable:true,flag:'secret_guard1'},
    {id:'guard2',type:'enemy',name:'Asistente de las papas',x:865,y:435,defeatable:true,flag:'secret_guard2'},
  ] },
];
export const FLAG_NAMES = [...new Set([...SCENES.flatMap(s=>s.requires), 'victory','secret_open','gaspar_unlocked','amaral_unlocked'])];
export const WIDTH=960, HEIGHT=540;
export const SAVE_KEY='aventura-papel-v1';

// The same ellipses drive rendering and contact: the danger never grows on a timer.
export const MASS_AREAS={
  3:{x:930,y:190,rx:250,ry:215,lobes:[{x:735,y:400,rx:80,ry:210}]},
  4:{x:930,y:190,rx:395,ry:310},
};
export const STREET_LASER={x:530,halfWidth:9,top:235,bottom:477};
export const WEATHER_DURATIONS={fog:6,sun:6,wind:5};
export const COMIC_PAGES=[
  {file:'00_Tapa.jpg',label:'Tapa'},
  ...Array.from({length:12},(_,i)=>({file:`${String(i+1).padStart(2,'0')}_Pagina.jpg`,label:`Página ${i+1}`})),
];
