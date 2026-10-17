export const HEROES = [
  { id:'vicente', name:'Vicente', color:'#f05a96', dark:'#b52f65', trait:'El espacio es su patio de juegos', powers:[['Prisma','Encerrá a un enemigo por unos segundos.',5,'△'],['Rayo regalo','Envolvé objetos y enemigos. Después, llevalos.',4,'◇'],['Espacio-tiempo','Aparecé en un lugar seguro al azar.',8,'↝']] },
  { id:'fabrizio', name:'Fabrizio', color:'#9ecb52', dark:'#4d751c', trait:'Una sorpresa en cada resorte', powers:[['Cubo reflector','Devolvé los disparos al que los lanzó.',5,'▧'],['Invisibilidad','Cinco segundos para pasar sin que te vean.',13,'◌'],['Picos','Lanzá picos a enemigos y blancos.',2,'⋀'],['¡Fiesta!','Enterrate, prendé las luces y celebrá.',5,'✳']] },
  { id:'luca', name:'Luca', color:'#20b5d5', dark:'#08788f', trait:'Pequeño, pero con mucha energía', powers:[['Rayo eléctrico','Dale energía a las máquinas o aturdí enemigos.',2,'ϟ'],['Tormenta','Cambiá el escenario con una tormenta.',10,'☂'],['Campo de fuerza','Protegé a todos los que estén cerca. Te quedás quieto.',11,'◎'],['Hacerse chiquito','Entrá en pasadizos. Volvé a pulsar para crecer.',3,'↧']] },
];

export const SCENES = [
  { title:'El cuartel', subtitle:'e.c.u.c.p.a.e.a.p.s.a', caption:'Toda gran aventura empieza con una noticia muy rara.', theme:'base', requires:['base_power','base_reflect'], objective:'Repará la consola y probá la defensa del cuartel.', hint:'Acercá a Luca a la consola y usá Z. Después, llevá a Fabrizio frente al lanzador y usá Z para devolver un disparo con su cubo.', intro:[['Reportero','¡Última noticia! Una masa rosa está absorbiendo el mundo. Se llama… ¡Vicente!'],['Vicente','¡Ese es mi cuerpo! Yo soy una pequeña esencia que logró salir. ¿Me ayudan a volver?'],['Ancianito','Las esencias están en su corazón. Primero arreglemos el cuartel. Cambien de personaje con 1, 2 y 3.']], objects:[
    {id:'anciano',type:'npc',name:'Ancianito',x:175,y:355,character:'anciano',dialog:[['Ancianito','Una máquina dormida necesita electricidad. Y a ese lanzador le hace falta probar su propio disparo. ¡Tenemos el equipo perfecto!']]},
    {id:'console',type:'electric',name:'Consola sin energía',x:380,y:345,flag:'base_power'},
    {id:'launcher',type:'turret',name:'Lanzador de práctica',x:680,y:325,flag:'base_reflect',practice:true},
    {id:'reportero',type:'npc',name:'Reportero',x:835,y:280,character:'reportero',dialog:[['Reportero','¡El equipo sale al rescate! Mis cálculos indican que la aventura tendrá al menos una fiesta.']]},
    {id:'secret-door',type:'secret-door',name:'Un dibujo sospechoso',x:450,y:250},
  ] },
  { title:'La calle doblada', subtitle:'No todo lo que brilla es un regalo. A veces, sí.', caption:'Mientras tanto, en una calle que alguien dobló por la mitad…', theme:'street', requires:['street_prism','street_sneak','street_target','street_piece'], objective:'Conseguí la pieza y abrí el paso sin despertar a todo el barrio.', hint:'Vicente puede encerrar al guardia con Z. Fabrizio cruza invisible junto al ojo con X y alcanza el blanco con C. Envolvé la pieza con X de Vicente, recogela con E y llevala al mecanismo.', mark:{x:865,y:245}, objects:[
    {id:'piece',type:'piece',name:'Pieza del mecanismo',x:210,y:435},
    {id:'guard',type:'enemy',name:'Asistente de Fusi',x:365,y:340,prismFlag:'street_prism'},
    {id:'eye',type:'scanner',name:'Ojo vigilante',x:530,y:400,flag:'street_sneak'},
    {id:'target',type:'target',name:'Blanco del cerrojo',x:680,y:270,flag:'street_target'},
    {id:'slot',type:'slot',name:'Mecanismo de salida',x:800,y:415,flag:'street_piece'},
  ] },
  { title:'El laboratorio de tormentas', subtitle:'Una solución del tamaño de una chispa.', caption:'Una pared, un pasadizo y un poquito de mal tiempo.', theme:'lab', requires:['lab_power','lab_storm','lab_escort'], objective:'Encendé el laboratorio y ayudá al Ancianito a cruzar.', hint:'Luca entra por el pasadizo con V. Usá Z cerca de la consola y X para desplegar la antena con una tormenta. Acercate al Ancianito y mantené C: el campo lo protege mientras cruza.', mark:{x:95,y:245}, objects:[
    {id:'switch',type:'electric',name:'Consola del pasadizo',x:600,y:340,flag:'lab_power'},
    {id:'antenna',type:'antenna',name:'Antena plegada',x:770,y:265,flag:'lab_storm'},
    {id:'escort',type:'escort',name:'Ancianito',character:'anciano',x:720,y:425,flag:'lab_escort'},
  ] },
  { title:'El borde del apocalipsis', subtitle:'No pises lo rosa. En serio.', caption:'¡La masa está cerca! Por suerte, las ideas también.', theme:'edge', requires:['edge_plate','edge_reflect','edge_teleport'], objective:'Activá la placa, frená al robot y probá una salida de emergencia.', hint:'Vicente convierte al asistente en regalo con X. Recogelo con E y dejalo sobre la placa con E. Fabrizio devuelve el disparo del robot con Z. Probá C de Vicente: siempre te lleva fuera de peligro.', mark:{x:105,y:245}, objects:[
    {id:'guard',type:'enemy',name:'Asistente distraído',x:270,y:335},
    {id:'plate',type:'plate',name:'Placa de peso',x:480,y:440,flag:'edge_plate'},
    {id:'robot',type:'turret',name:'Robot de Fusi',x:735,y:315,flag:'edge_reflect'},
    {id:'fusi',type:'npc',name:'Fusi',character:'fusi',x:840,y:265,dialog:[['Fusi','¡Todo lo violeta es mío! Excepto las emociones. Y los personajes. Bueno… es complicado.']]},
  ] },
  { title:'El corazón de papel', subtitle:'Salvar a un amigo es el mejor superpoder.', caption:'Dentro de Vicente todavía hay un montón de Vicente.', theme:'heart', requires:['heart_power','heart_escort','heart_piece'], objective:'Reuní las tres esencias para que Vicente vuelva a ser Vicente.', hint:'Luca enciende la máquina rosa con Z. Su campo C protege a Sebastián del pulso. Vicente envuelve la esencia rosa con X y la lleva al corazón de la derecha. Después, E junto al corazón para reunirlas.', objects:[
    {id:'console',type:'electric',name:'Esencia celeste',x:300,y:325,flag:'heart_power'},
    {id:'escort',type:'escort',name:'Sebastián',character:'sebastian',x:530,y:420,flag:'heart_escort'},
    {id:'piece',type:'piece',name:'Esencia rosa',x:650,y:290},
    {id:'slot',type:'slot',name:'Corazón de Vicente',x:800,y:420,flag:'heart_piece'},
  ] },
  { title:'Que empiece la fiesta', subtitle:'El mundo sigue siendo un buen lugar para dibujar.', caption:'Y así, una historia de apocalipsis terminó en una fiesta.', theme:'party', requires:[], objective:'¡Salvaste a Vicente! Celebrá con Fabrizio o buscá la viñeta secreta.', hint:'V de Fabrizio: fiesta subterránea. Buscá las tres estrellas de los márgenes de las viñetas 2, 3 y 4. Después visitá el dibujo del cuartel. Podés volver con «Ver viñetas».', objects:[
    {id:'reportero',type:'npc',name:'Reportero',x:245,y:355,character:'reportero',dialog:[['Reportero','¡El apocalipsis fue cancelado! Gracias a tres amigos y once poderes. Ahora sí: ¡hagamos una fiesta!']]},
    {id:'anciano',type:'npc',name:'Ancianito',x:665,y:350,character:'anciano',dialog:[['Ancianito','Algunas historias esconden otra historia en los márgenes. Si encontraste tres marcas, mirá el dibujo del cuartel.']]},
    {id:'secret-door',type:'secret-door',name:'El dibujo del cuartel',x:450,y:260},
  ] },
  { title:'La viñeta que no estaba', subtitle:'¡La encontraste! Esta página es para jugar.', caption:'Hay aventuras que solo aparecen cuando mirás un poquito más allá.', theme:'secret', requires:['secret_power','secret_piece','secret_party'], objective:'Encendé la estrella, entregá un regalo y armá una fiesta secreta.', hint:'Z de Luca enciende la estrella. Vicente usa X para envolver el objeto y E para llevarlo al altar. V de Fabrizio prende la fiesta. ¡Los tres amigos tienen algo que aportar!', objects:[
    {id:'console',type:'electric',name:'Estrella apagada',x:300,y:325,flag:'secret_power'},
    {id:'piece',type:'piece',name:'Sorpresa secreta',x:560,y:295},
    {id:'slot',type:'slot',name:'Altar de regalos',x:770,y:420,flag:'secret_piece'},
  ] },
];
export const FLAG_NAMES = [...new Set([...SCENES.flatMap(s=>s.requires), 'victory','secret_open'])];
export const WIDTH=960, HEIGHT=540;
export const SAVE_KEY='aventura-papel-v1';
